/**
 * Facebook Marketplace Browser Agent
 *
 * IMPORTANT DISCLAIMER:
 * This agent uses browser automation (Playwright) to navigate Facebook Marketplace.
 * Facebook's Terms of Service prohibit automated scraping. This implementation:
 * - Uses session-based auth (your existing FB cookies) - no password storage
 * - Rate-limits requests with random delays (2-5s between requests)
 * - Collects only publicly visible listing data
 * - May break if Facebook updates their UI
 *
 * Use responsibly and in compliance with applicable laws and terms of service.
 */

import { chromium } from 'playwright'
import { prisma } from './prisma'
import { scoreCarListing } from './ai-scorer'
import { sendAIRunSummary } from './email'
import type { AISearchConfig } from '@prisma/client'

interface MarketplaceListing {
  title: string
  price?: number
  location?: string
  mileage?: number
  year?: number
  make?: string
  model?: string
  trim?: string
  description?: string
  photos: string[]
  sourceUrl: string
  sellerName?: string
  postedAt?: string
}

interface ListingDetails {
  photos: string[]
  description: string
  mileage?: number
  transmission?: string
  exteriorColor?: string
  interiorColor?: string
  fuelType?: string
  owners?: number
  titleStatus?: string
  sellerName?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(min = 2000, max = 5000): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return sleep(ms)
}

function parsePriceUSD(priceStr: string): number | undefined {
  const match = priceStr.match(/\$\s*([\d,]+)/)
  if (!match) return undefined
  const num = parseInt(match[1].replace(/,/g, ''), 10)
  return isNaN(num) ? undefined : num
}

function parseMileage(text: string): number | undefined {
  const match = text.match(/([\d,]+)(k)?\s*(mi|miles|km)/i)
  if (!match) return undefined
  let num = parseInt(match[1].replace(/,/g, ''), 10)
  if (match[2]) num *= 1000
  if (match[3].toLowerCase() === 'km') num = Math.round(num * 0.621371)
  return num
}

function parseYear(title: string): number | undefined {
  const match = title.match(/\b(19[8-9]\d|20[0-2]\d)\b/)
  return match ? parseInt(match[1]) : undefined
}

function parseMakeModel(title: string): { make?: string; model?: string } {
  const commonMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'BMW',
    'Mercedes', 'Mercedes-Benz', 'Lexus', 'Audi', 'Hyundai', 'Kia',
    'Mazda', 'Subaru', 'Volkswagen', 'Jeep', 'Ram', 'GMC', 'Infiniti',
    'Acura', 'Volvo', 'Land Rover', 'Jaguar', 'Cadillac', 'Lincoln',
    'Buick', 'Chrysler', 'Mitsubishi', 'Porsche',
  ]
  for (const make of commonMakes) {
    if (title.toLowerCase().includes(make.toLowerCase())) {
      const afterMake = title.slice(title.toLowerCase().indexOf(make.toLowerCase()) + make.length).trim()
      const modelMatch = afterMake.match(/^(\w+)/)
      return { make, model: modelMatch?.[1] }
    }
  }
  return {}
}

/**
 * Visit an individual listing page and extract all photos, description, and structured attributes.
 * Falls back gracefully on any error so the main loop is never blocked.
 */
async function fetchListingDetails(
  context: import('playwright').BrowserContext,
  url: string
): Promise<ListingDetails> {
  const page = await context.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
    // Allow lazy-loaded images and React content to render
    await sleep(2500)

    const data = await page.evaluate(() => {
      // ---- Photos ----
      // CRITICAL: scope to [role="main"] ONLY — this excludes the Facebook chat sidebar,
      // navigation bar, story tray, and other logged-in UI elements that contain the
      // user's personal photos (profile pics, messenger images, etc.)
      const mainEl = document.querySelector('[role="main"]') || document.body
      const seenUrls = new Set<string>()
      const photos: string[] = []

      mainEl.querySelectorAll('img').forEach((img) => {
        const src = img.src || img.getAttribute('data-src') || ''
        if (!src) return
        if (!src.includes('fbcdn.net') && !src.includes('scontent')) return
        // Skip known non-photo patterns (tiny icons, profile pics)
        if (
          src.includes('emoji') ||
          src.includes('_s.jpg') ||
          src.includes('p50x50') ||
          src.includes('p40x40') ||
          src.includes('p32x32') ||
          src.includes('1x1')
        ) return
        const w = img.naturalWidth || img.width || 0
        const h = img.naturalHeight || img.height || 0
        if ((w > 0 && w < 120) || (h > 0 && h < 120)) return
        // Skip images inside recommended/similar listing cards
        if (img.closest('a[href*="/marketplace/item/"]')) return
        // Skip images inside nav, aside (chat sidebar), footer, and ARIA landmark regions
        // that Facebook uses for the navigation bar, chat panel, and other UI chrome
        if (
          img.closest('nav') ||
          img.closest('aside') ||
          img.closest('footer') ||
          img.closest('[role="navigation"]') ||
          img.closest('[role="banner"]') ||
          img.closest('[role="complementary"]')
        ) return
        // Skip Facebook-injected ads/sponsored content that appear within [role="main"]
        // These show the same ad image across multiple listings (e.g. car brand ads)
        if (
          img.closest('[data-ad-preview]') ||
          img.closest('[data-ad-comet-preview]') ||
          img.closest('[aria-label*="ponsored"]') ||
          img.closest('[data-pagelet*="ad"]') ||
          img.closest('[data-testid*="sponsor"]')
        ) return
        if (seenUrls.has(src)) return
        seenUrls.add(src)
        photos.push(src)
      })
      // Hard cap: real listings rarely exceed 20 photos; anything beyond is likely injected content
      photos.splice(20)

      // ---- Full page text ----
      const fullText = (document.body.innerText || '').replace(/\u00A0/g, ' ')

      // ---- Seller's description ----
      let description = ''
      const descMatch = fullText.match(
        /seller['']?s?\s+description[\s\n]+([\s\S]{10,4000}?)(?=\n{2,}(?:meet\s+the\s+seller|send\s+(?:a\s+)?message|send\s+seller|report\s+listing|similar\s+items|you\s+might\s+also|today['']?s\s+picks|$))/i
      )
      if (descMatch) {
        description = descMatch[1].trim()
      }

      // ---- Mileage ----
      let mileage: number | undefined
      const mileageMatch = fullText.match(/driven\s+([\d,]+)\s*(k\s*)?(miles?|km)/i)
      if (mileageMatch) {
        mileage = parseInt(mileageMatch[1].replace(/,/g, ''))
        if (mileageMatch[2]) mileage *= 1000
        if (mileageMatch[3]?.toLowerCase() === 'km') mileage = Math.round(mileage * 0.621371)
      }

      // ---- Transmission ----
      // Only accept known transmission type words to avoid capturing adjacent attribute lines.
      // (The loose regex previously matched across newlines and captured "Exterior color: White")
      const transmissionMatch =
        fullText.match(/transmission[ \t]*:[ \t]*(automatic|manual|cvt|semi.?automatic)/i) ||
        fullText.match(/\b(automatic|manual|cvt|semi.?automatic)\s+transmission\b/i) ||
        fullText.match(/\b(automatic|manual|cvt)\b/i)
      const transmission = transmissionMatch?.[1]?.trim() || undefined

      // ---- Colors ----
      // Use separate greedy regexes (the combined lazy regex was only capturing 1 letter)
      const extColorMatch = fullText.match(/exterior\s+color[:\s]+([^\n·•\t]+)/i)
      const intColorMatch = fullText.match(/interior\s+color[:\s]+([^\n·•\t]+)/i)
      const exteriorColor = extColorMatch?.[1]?.trim() || undefined
      const interiorColor = intColorMatch?.[1]?.trim() || undefined

      // ---- Fuel type ----
      const fuelMatch = fullText.match(/fuel\s+type:\s*([^\n]+)/i)
      const fuelType = fuelMatch?.[1]?.trim() || undefined

      // ---- Owners ----
      const ownerMatch = fullText.match(/(\d+)\s+owner/i)
      const owners = ownerMatch ? parseInt(ownerMatch[1]) : undefined

      // ---- Title status ----
      const titleMatch = fullText.match(/(clean|rebuilt|salvage)\s+title/i)
      const titleStatus = titleMatch?.[1] || undefined

      // ---- Seller name ----
      const sellerMatch =
        fullText.match(/listed\s+by\s+([^\n]+)/i) ||
        fullText.match(/sold\s+by\s+([^\n]+)/i)
      const sellerName = sellerMatch?.[1]?.trim().slice(0, 60) || undefined

      return {
        photos,
        description,
        mileage,
        transmission,
        exteriorColor,
        interiorColor,
        fuelType,
        owners,
        titleStatus,
        sellerName,
      }
    })

    return data
  } catch (e) {
    console.error(`  Failed to fetch details (${url.slice(0, 60)}):`, (e as Error).message)
    return { photos: [], description: '' }
  } finally {
    await page.close().catch(() => {})
  }
}

/**
 * Build a structured description combining extracted attributes + seller text.
 * Stored as the suggestion's description so the AI scorer and admin panel
 * both have full context in one field.
 */
function buildFullDescription(details: ListingDetails, fallbackCardText: string): string {
  const attrLines: string[] = []

  if (details.mileage) attrLines.push(`Mileage: ${details.mileage.toLocaleString()} miles`)
  if (details.transmission) attrLines.push(`Transmission: ${details.transmission}`)
  if (details.exteriorColor) {
    const colorLine = details.interiorColor
      ? `Exterior: ${details.exteriorColor} · Interior: ${details.interiorColor}`
      : `Exterior color: ${details.exteriorColor}`
    attrLines.push(colorLine)
  }
  if (details.fuelType) attrLines.push(`Fuel: ${details.fuelType}`)
  if (details.owners) attrLines.push(`Owners: ${details.owners}`)
  if (details.titleStatus) attrLines.push(`Title: ${details.titleStatus}`)

  const parts: string[] = []

  if (attrLines.length > 0) {
    parts.push('--- Vehicle Details ---')
    parts.push(attrLines.join('\n'))
  }

  if (details.description) {
    parts.push('\n--- Seller Description ---')
    parts.push(details.description)
  } else if (fallbackCardText) {
    parts.push('\n--- Listing Text ---')
    parts.push(fallbackCardText.slice(0, 800))
  }

  return parts.join('\n').trim()
}

export async function runFacebookMarketplaceAgent(
  config: AISearchConfig,
  logId: string
): Promise<{ found: number; queued: number }> {
  let browser
  let found = 0
  let queued = 0
  const newSuggestions: MarketplaceListing[] = []

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    })

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    })

    // Inject Facebook session cookies if provided
    if (config.fbCookies) {
      try {
        const raw = JSON.parse(config.fbCookies)
        const sameSiteMap: Record<string, 'None' | 'Lax' | 'Strict'> = {
          no_restriction: 'None',
          unspecified: 'None',
          lax: 'Lax',
          strict: 'Strict',
          none: 'None',
        }
        const cookies = raw.map((c: Record<string, unknown>) => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: (c.path as string) ?? '/',
          expires: c.expirationDate ?? c.expires ?? -1,
          httpOnly: c.httpOnly ?? false,
          secure: c.secure ?? false,
          sameSite: sameSiteMap[String(c.sameSite ?? 'none').toLowerCase()] ?? 'None',
        }))
        await context.addCookies(cookies)
      } catch (e) {
        console.error('Failed to parse FB cookies:', e)
      }
    }

    const searchPage = await context.newPage()

    // Hide automation fingerprints
    await searchPage.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })

    // Build search URL
    const params = new URLSearchParams()
    if (config.city) params.set('city', config.city)
    if (config.searchRadius) params.set('radius', config.searchRadius.toString())
    if (config.minPrice) params.set('minPrice', config.minPrice.toString())
    if (config.maxPrice) params.set('maxPrice', config.maxPrice.toString())
    if (config.minYear) params.set('minYear', config.minYear.toString())
    if (config.maxYear) params.set('maxYear', config.maxYear.toString())
    if (config.maxMileage) params.set('maxMileage', config.maxMileage.toString())
    params.set('vehicleType', 'car_truck')

    const searchUrl = `https://www.facebook.com/marketplace/category/vehicles?${params.toString()}`
    console.log(`Searching: ${searchUrl}`)

    await searchPage.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await randomDelay(2000, 4000)

    // Scroll to load more listings
    for (let i = 0; i < 3; i++) {
      await searchPage.evaluate(() => window.scrollBy(0, window.innerHeight))
      await sleep(1500)
    }

    // Extract listing cards from the search results page
    const listings = await searchPage.evaluate(() => {
      const cards = document.querySelectorAll('a[href*="/marketplace/item/"]')
      const results: Array<{
        href: string
        text: string
        imgSrc: string
        spans: string[]
      }> = []
      cards.forEach((card) => {
        const anchor = card as HTMLAnchorElement
        const href = anchor.href
        const text = (anchor.textContent || '').trim()
        const img = anchor.querySelector('img')
        const imgSrc = img?.src || ''
        const spans = Array.from(anchor.querySelectorAll('span'))
          .map((s) => s.textContent?.trim() || '')
          .filter(Boolean)
        if (href && !results.find((r) => r.href === href)) {
          results.push({ href, text, imgSrc, spans })
        }
      })
      return results.slice(0, 30)
    })

    await searchPage.close()

    found = listings.length
    const limit = config.resultsPerDay ?? listings.length
    console.log(`Found ${found} listings. Processing up to ${Math.min(found, limit)} (visiting each page for full details)...`)
    console.log(`Config: city=${config.city || '(none)'}, maxPrice=${config.maxPrice}, minYear=${config.minYear}, minScore=${config.minOpportunityScore}`)

    if (listings[0]) {
      console.log(`Sample card[0] spans: ${JSON.stringify(listings[0].spans)}`)
    }

    let skippedExisting = 0
    let skippedKeywords = 0
    let skippedScore = 0

    for (const listing of listings.slice(0, limit)) {
      try {
        const stableUrl = listing.href.split('?')[0].replace(/\/$/, '')

        // Check if already seen
        const existing = await prisma.aISuggestion.findFirst({
          where: { sourceUrl: { startsWith: stableUrl } },
        })

        if (existing) {
          skippedExisting++
          const titlePrice = parsePriceUSD(listing.text)
          if (titlePrice && existing.price && titlePrice < existing.price) {
            await prisma.aISuggestion.update({
              where: { id: existing.id },
              data: {
                lastSeenAt: new Date(),
                price: titlePrice,
                priceHistory: { create: { price: titlePrice } },
              },
            })
          } else {
            await prisma.aISuggestion.update({
              where: { id: existing.id },
              data: { lastSeenAt: new Date() },
            })
          }
          continue
        }

        // Extract card-level data (fast, no page visit)
        const uniqueSpans = [...new Set(listing.spans)]
        const combinedCardText = [...uniqueSpans, listing.text].join(' ')
        const cardPrice = parsePriceUSD(combinedCardText)
        const cardTitle =
          uniqueSpans.find((s) => /\b(19[89]\d|20[0-3]\d)\b/.test(s)) ||
          uniqueSpans.find((s) => s.length > 8 && !/^\$/.test(s)) ||
          listing.text.slice(0, 80)
        const year = parseYear(cardTitle) || parseYear(combinedCardText)
        const { make, model } = parseMakeModel(cardTitle)
        const cardLocation = listing.spans.find((s) =>
          /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/.test(s)
        ) || ''

        // Quick exclude-keyword check before making a page visit
        const cardTextLower = combinedCardText.toLowerCase()
        const hasExcluded = (config.excludeKeywords || []).some((kw) =>
          cardTextLower.includes(kw.toLowerCase())
        )
        if (hasExcluded) { skippedKeywords++; continue }

        // --- Visit the individual listing page for full details ---
        console.log(`  Fetching: ${cardTitle.slice(0, 50)} — ${stableUrl.slice(-20)}`)
        const details = await fetchListingDetails(context, listing.href)
        await randomDelay(1500, 3000)

        // Merge: prefer detail page data over card data
        const mileage = details.mileage || parseMileage(combinedCardText)
        const photos = details.photos.length > 0
          ? details.photos
          : listing.imgSrc ? [listing.imgSrc] : []

        const fullDescription = buildFullDescription(details, combinedCardText)

        // Re-check exclude keywords against full description (more accurate)
        const fullTextLower = fullDescription.toLowerCase()
        const hasExcludedFull = (config.excludeKeywords || []).some((kw) =>
          fullTextLower.includes(kw.toLowerCase())
        )
        if (hasExcludedFull) { skippedKeywords++; continue }

        const meetsKeywords =
          (config.keywords || []).length === 0 ||
          (config.keywords || []).some((kw) => fullTextLower.includes(kw.toLowerCase()))
        if (!meetsKeywords && (config.keywords || []).length > 0) { skippedKeywords++; continue }

        // Score with full context
        const { score, reasons } = await scoreCarListing({
          title: cardTitle,
          price: cardPrice,
          mileage,
          year,
          description: fullDescription,
          location: cardLocation,
          searchConfig: {
            maxPrice: config.maxPrice,
            maxMileage: config.maxMileage,
            minYear: config.minYear,
            keywords: config.keywords,
            searchRadius: config.searchRadius,
          },
        })

        console.log(`  Score: ${score}/100 | $${cardPrice ?? '?'} | ${mileage ?? '?'} mi | ${photos.length} photos | ${reasons.join('; ')}`)
        if (score < config.minOpportunityScore) { skippedScore++; continue }

        const suggestion: MarketplaceListing = {
          title: cardTitle,
          price: cardPrice,
          location: cardLocation,
          mileage,
          year,
          make,
          model,
          description: fullDescription,
          photos,
          sourceUrl: listing.href,
          sellerName: details.sellerName,
        }

        await prisma.aISuggestion.create({
          data: {
            ...suggestion,
            opportunityScore: score,
            scoreReasons: reasons,
            status: 'PENDING',
            ...(cardPrice ? { priceHistory: { create: { price: cardPrice } } } : {}),
          },
        })

        newSuggestions.push(suggestion)
        queued++
        console.log(`  ✓ Queued: "${suggestion.title}" (score: ${score}, ${photos.length} photos)`)
      } catch (itemError) {
        console.error('Error processing listing:', (itemError as Error).message)
      }
    }

    console.log(`\nRun summary: found=${found} queued=${queued} skipped_existing=${skippedExisting} skipped_keywords=${skippedKeywords} skipped_score=${skippedScore}`)
  } finally {
    if (browser) await browser.close()

    await prisma.aIRunLog.update({
      where: { id: logId },
      data: {
        completedAt: new Date(),
        status: 'COMPLETED',
        listingsFound: found,
        listingsQueued: queued,
      },
    })

    if (config.emailNotifications && config.adminEmail) {
      try {
        await sendAIRunSummary({
          runId: logId,
          startedAt: new Date(),
          completedAt: new Date(),
          listingsFound: found,
          listingsQueued: queued,
          suggestions: newSuggestions.map((s) => ({
            title: s.title,
            price: s.price,
            location: s.location,
            opportunityScore: 0,
            sourceUrl: s.sourceUrl,
          })),
        })
      } catch (emailError) {
        console.error('Failed to send email summary:', emailError)
      }
    }
  }

  return { found, queued }
}
