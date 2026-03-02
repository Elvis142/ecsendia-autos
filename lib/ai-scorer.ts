import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ScoringInput {
  title: string
  price?: number | null
  mileage?: number | null
  year?: number | null
  description?: string | null
  location?: string | null
  searchConfig: {
    maxPrice?: number | null
    maxMileage?: number | null
    minYear?: number | null
    keywords?: string[]
    searchRadius?: number
  }
}

export interface ScoringResult {
  score: number
  reasons: string[]
}

export async function scoreCarListing(input: ScoringInput): Promise<ScoringResult> {
  const currentYear = new Date().getFullYear()
  const carAge = input.year ? currentYear - input.year : null

  const prompt = `You are analyzing a US-based used car listing for a Nigerian auto dealer who buys in USD and ships to Nigeria. Score this listing from 0-100 based on its investment/resale potential.

Car Details:
- Title: ${input.title}
- Price: ${input.price ? `$${input.price.toLocaleString('en-US')}` : 'Not listed'}
- Year: ${input.year || 'Unknown'} ${carAge !== null ? `(${carAge} years old)` : ''}
- Mileage: ${input.mileage ? `${input.mileage.toLocaleString()} miles` : 'Not listed'}
- Location: ${input.location || 'Unknown'}
- Description: ${input.description || 'No description'}

Search Criteria (dealer's preferences):
- Max Budget: ${input.searchConfig.maxPrice ? `$${input.searchConfig.maxPrice.toLocaleString('en-US')}` : 'Not set'}
- Max Mileage: ${input.searchConfig.maxMileage ? `${input.searchConfig.maxMileage.toLocaleString()} mi` : 'Not set'}
- Min Year: ${input.searchConfig.minYear || 'Not set'}
- Preferred Keywords: ${input.searchConfig.keywords?.join(', ') || 'None'}

Scoring criteria:
- Price relative to budget (is it within budget? significantly below?)
- Mileage relative to year (low mileage for age is good)
- Title status signals in description (clean title is best)
- Condition signals (well maintained, service history, etc.)
- Location/distance
- Completeness of listing info

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "reasons": ["reason 1", "reason 2", "reason 3"]
}

Keep reasons concise (max 8 words each). Provide 2-4 reasons.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return { score: 50, reasons: ['Unable to score listing'] }
    }

    // Strip markdown code fences if model wraps JSON in ```json ... ```
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }
    const result = JSON.parse(jsonText) as ScoringResult
    return {
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      reasons: result.reasons.slice(0, 4),
    }
  } catch (error) {
    console.error('AI scoring error:', error)
    return { score: 50, reasons: ['Auto-scored (AI unavailable)'] }
  }
}
