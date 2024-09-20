// src/index.ts
import { Request, Response, route } from './httpSupport'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

// Define the structure for the assessment result
const AssessmentResult = z.object({
  isValid: z.boolean(),
  reason: z.string(),
})

// System prompt for the AI assessor
const systemPrompt = `You are a service validity assessor for a decentralized AI Fiverr-like platform. Your task is to evaluate digital services based on provided requirements. Here are the general requirements:
1. The content must be original and not plagiarized.
2. The content must be free of grammatical and spelling errors.
3. The content must be coherent and well-structured.
4. The content must be relevant to the specified topic or service.
Assess the provided content against both these general requirements and the specific requirements provided by the service requirer. If all requirements are met, return a positive assessment. If not, explain why the content fails to meet the requirements.`

// Handle GET requests
async function GET(req: Request): Promise<Response> {
  const secrets = req.secret || {}
  const queries = req.queries
  const openaiApiKey = (secrets.openaiApiKey) ? secrets.openaiApiKey as string : ''
  const openai = new OpenAI({ apiKey: openaiApiKey })
  const specificRequirements = queries.requirements ? queries.requirements[0] : ''
  const content = queries.content ? queries.content[0] : ''

  if (!specificRequirements || !content) {
    return new Response(JSON.stringify({ error: 'Missing requirements or content' }), { status: 400 })
  }

  try {
    // Use OpenAI to assess the content
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini", //"gpt-4o-2024-08-06",
      response_format: zodResponseFormat(AssessmentResult, "assessment"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Specific requirements: ${specificRequirements}\n\nContent to assess: ${content}` }
      ],
    })

    const assessment = completion.choices[0].message.parsed
    // Check if assessment is not null before accessing its properties
    const isValid = assessment ? assessment.isValid : false;
    const reason = assessment ? assessment.reason : '';

    // Prepare the result for attestation
    const attestationResult = {
      isValid,
      reason,
      timestamp: new Date().toISOString(),
      contentHash: await sha256(content),
    }

    return new Response(JSON.stringify(attestationResult))
  } catch (error) {
    console.error('Error assessing content:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

// Generate SHA-256 hash
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Handle POST requests
async function POST(req: Request): Promise<Response> {
  // Parse the request body
  const body = await req.json()
  
  // Extract requirements and content from the body
  const { requirements, content } = body

  if (!requirements || !content) {
    return new Response(JSON.stringify({ error: 'Missing requirements or content' }), { status: 400 })
  }

  // Create a new Request object with the extracted data as query parameters
  const getReq = new Request('', {
    ...req,
    method: 'GET',
    queries: {
      requirements: [requirements],
      content: [content]
    }
  })

  // Call the GET function with the new request
  return GET(getReq)
}

// Main function to route requests
export default async function main(request: string) {
  return await route({ GET, POST }, request)
}   