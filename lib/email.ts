import { Resend } from 'resend'
import { formatNaira, formatDateTime } from './formatting'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'autosales@ecsendia.site'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'autosales@ecsendia.site'

export interface InquiryEmailData {
  inquiryId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  preferredContact: string
  carTitle: string
  carSlug: string
  vehiclePrice: number
  customerOffer?: number | null
  shippingNeeded: boolean
  shippingDestination?: string
  paymentPlan?: string | null
  notes?: string | null
  timestamp: Date
}

export async function sendInquiryNotification(data: InquiryEmailData): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const carUrl = `${siteUrl}/inventory/${data.carSlug}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #7B1F2E; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Inquiry — Ecsendia Autos</h1>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <h2 style="color: #7B1F2E; border-bottom: 2px solid #7B1F2E; padding-bottom: 8px;">Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 40%;">Name:</td><td>${data.customerName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${data.customerPhone}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Preferred Contact:</td><td>${data.preferredContact}</td></tr>
        </table>

        <h2 style="color: #7B1F2E; border-bottom: 2px solid #7B1F2E; padding-bottom: 8px; margin-top: 24px;">Vehicle Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 40%;">Vehicle:</td><td><a href="${carUrl}" style="color: #7B1F2E;">${data.carTitle}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Listed Price:</td><td style="font-size: 18px; color: #7B1F2E; font-weight: bold;">${formatNaira(data.vehiclePrice)}</td></tr>
          ${data.customerOffer ? `<tr><td style="padding: 6px 0; font-weight: bold;">Customer Offer:</td><td>${formatNaira(data.customerOffer)}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; font-weight: bold;">Payment Plan:</td><td>${data.paymentPlan || 'Not specified'}</td></tr>
        </table>

        <h2 style="color: #7B1F2E; border-bottom: 2px solid #7B1F2E; padding-bottom: 8px; margin-top: 24px;">Shipping & Other</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 40%;">Shipping Needed:</td><td>${data.shippingNeeded ? '✅ Yes' : '❌ No'}</td></tr>
          ${data.shippingDestination ? `<tr><td style="padding: 6px 0; font-weight: bold;">Destination:</td><td>${data.shippingDestination}</td></tr>` : ''}
          ${data.notes ? `<tr><td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Notes:</td><td>${data.notes}</td></tr>` : ''}
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #fff; border-left: 4px solid #7B1F2E; border-radius: 4px;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            Inquiry ID: ${data.inquiryId}<br>
            Received: ${formatDateTime(data.timestamp)}
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="${siteUrl}/admin/inquiries" style="background: #7B1F2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View in Admin Dashboard
          </a>
        </div>
      </div>

      <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
        <p>Ecsendia Autos — Auto Inventory Management</p>
      </div>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.customerEmail,
    subject: `New Inquiry: ${data.carTitle} — ${data.customerName}`,
    html,
  })
}

export interface AIRunSummaryData {
  runId: string
  startedAt: Date
  completedAt: Date
  listingsFound: number
  listingsQueued: number
  suggestions: Array<{
    title: string
    price?: number | null
    location?: string | null
    opportunityScore?: number | null
    sourceUrl: string
  }>
}

export async function sendAIRunSummary(data: AIRunSummaryData): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const topSuggestions = data.suggestions.slice(0, 5)

  const suggestionsHtml = topSuggestions.length
    ? topSuggestions
        .map(
          (s) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${s.title}</td>
        <td style="padding: 8px;">${s.price ? formatNaira(s.price) : 'N/A'}</td>
        <td style="padding: 8px;">${s.location || 'N/A'}</td>
        <td style="padding: 8px;">
          <span style="background: ${(s.opportunityScore || 0) >= 80 ? '#dcfce7' : (s.opportunityScore || 0) >= 60 ? '#fef9c3' : '#fee2e2'};
                        color: ${(s.opportunityScore || 0) >= 80 ? '#166534' : (s.opportunityScore || 0) >= 60 ? '#713f12' : '#991b1b'};
                        padding: 2px 8px; border-radius: 12px; font-weight: bold;">
            ${s.opportunityScore || 0}/100
          </span>
        </td>
      </tr>
    `
        )
        .join('')
    : '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #999;">No new suggestions found</td></tr>'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #7B1F2E; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">AI Sourcing Daily Summary</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Ecsendia Autos</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <div style="display: flex; gap: 16px; margin-bottom: 24px;">
          <div style="flex: 1; background: white; padding: 16px; border-radius: 8px; text-align: center; border-top: 3px solid #7B1F2E;">
            <div style="font-size: 32px; font-weight: bold; color: #7B1F2E;">${data.listingsFound}</div>
            <div style="color: #666; font-size: 14px;">Listings Scanned</div>
          </div>
          <div style="flex: 1; background: white; padding: 16px; border-radius: 8px; text-align: center; border-top: 3px solid #16a34a;">
            <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${data.listingsQueued}</div>
            <div style="color: #666; font-size: 14px;">Queued for Review</div>
          </div>
        </div>

        <h2 style="color: #7B1F2E; border-bottom: 2px solid #7B1F2E; padding-bottom: 8px;">Top Suggestions</h2>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #7B1F2E; color: white;">
              <th style="padding: 10px; text-align: left;">Vehicle</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Location</th>
              <th style="padding: 10px; text-align: left;">Score</th>
            </tr>
          </thead>
          <tbody>${suggestionsHtml}</tbody>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="${siteUrl}/admin/ai-sourcing" style="background: #7B1F2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Review All Suggestions →
          </a>
        </div>
      </div>

      <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
        <p>Run completed at ${formatDateTime(data.completedAt)}</p>
      </div>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `AI Sourcing: ${data.listingsQueued} new suggestions found`,
    html,
  })
}
