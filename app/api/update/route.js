import { NextResponse} from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

export async function POST(req) {
    const data = await req.json()

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })
    const index = pc.index('rag').namespace('ns1')
    const openai = new OpenAI()

    // const text = JSON.parse(data[0].content)
    const text = data[0].content
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.review,
        encoding_format: 'float',
    })

    const processed_data =
        {
            "values": embedding.data[0].embedding,
            "id": text.professor,
            "metadata": {
                "review": text.review,
                "subject": text.subject,
                "stars": text.stars,
            }
        }

    const results = await index.upsert([processed_data])
    return new NextResponse(results)
}