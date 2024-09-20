// tests/test.ts

import 'dotenv/config'
import './testSupport'
import { execute } from "./testSupport";

async function test() {
    const specificRequirements = "The blog post should be at least 500 words long and include 3 subheadings.";
    const content = `
    The Future of Artificial Intelligence in Business

    Artificial Intelligence (AI) is rapidly transforming the business landscape, offering unprecedented opportunities for innovation, efficiency, and growth. As we look towards the future, it's clear that AI will play an increasingly central role in how companies operate and compete. Let's explore three key areas where AI is set to make a significant impact.

    Enhancing Customer Experience
    One of the most promising applications of AI in business is in improving customer experience. AI-powered chatbots and virtual assistants are already revolutionizing customer service, providing 24/7 support and handling a wide range of queries with increasing sophistication. In the future, we can expect these systems to become even more advanced, offering personalized interactions that rival human customer service representatives.

    Optimizing Operations and Decision Making
    AI's ability to process and analyze vast amounts of data is transforming business operations and decision-making processes. Machine learning algorithms can identify patterns and insights that would be impossible for humans to detect, leading to more informed strategic decisions. From supply chain optimization to predictive maintenance, AI is helping businesses operate more efficiently and proactively.

    Driving Innovation and Product Development
    AI is not just improving existing processes; it's also driving innovation and new product development. By analyzing market trends, customer preferences, and emerging technologies, AI can help businesses identify new opportunities and create products that better meet consumer needs. Additionally, AI-driven simulations and prototyping tools are accelerating the product development cycle, allowing companies to bring innovations to market faster than ever before.

    As AI continues to evolve, its impact on business will only grow. Companies that embrace AI and effectively integrate it into their operations will be well-positioned to thrive in the increasingly competitive and fast-paced business environment of the future. However, this technological revolution also brings challenges, including ethical considerations and the need for workforce adaptation. Navigating these challenges while harnessing the power of AI will be crucial for business success in the coming years.
    `;

    const getResult = await execute({
        method: 'GET',
        path: '/ipfs/CID',
        queries: {
            requirements: [specificRequirements],
            content: [content],
        },
        secret: { openaiApiKey: process.env.OPENAI_API_KEY },
        headers: {},
    })
    console.log('GET RESULT:', JSON.parse(getResult))

    console.log(`\nNow you are ready to publish your agent, add secrets, and interact with your agent in the following steps:
    - Execute: 'npm run publish-agent'
    - Set secrets: 'npm run set-secrets'
    - Go to the url produced by setting the secrets (e.g. https://wapo-testnet.phala.network/ipfs/QmPQJD5zv3cYDRM25uGAVjLvXGNyQf9Vonz7rqkQB52Jae?key=b092532592cbd0cf)`)
}

test().then(() => { }).catch(err => console.error(err)).finally(() => process.exit())