import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY!, // Use your Groq API key
    baseURL: "https://api.groq.com/openai/v1", // Groq endpoint
});

export async function runTechStackAgent(
    idea: string,
    background: string,
    requirements: string
) {
    const model = "llama-3.1-8b-instant";

    const completion = await client.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: `You are an elite software architect determining the optimal tech stack for a project.
You MUST output ONLY a pure JSON object representing the recommended tech stack.
The JSON object MUST strictly follow this exact schema, using only these four lowercase keys containing arrays of objects with 'name' and 'reason' strings:
{
  "frontend": [ { "name": "Next.js", "reason": "Provides hybrid server rendering and optimal SEO for this application." } ],
  "backend": [ { "name": "Node.js", "reason": "Enables high-concurrency connections required for the feature set." } ],
  "database": [ { "name": "PostgreSQL", "reason": "Ensures ACID compliance and relational integrity for user data." } ],
  "deployment": [ { "name": "Vercel", "reason": "Seamless integration with Next.js for zero-config deployments." } ]
}
Choose the absolute best modern technologies for the given project. The reasoning should be concise, highly specific to the project's requirements, and professional.
Do not include markdown blocks, explanations, or any other text. Output pure JSON only.`,
            },
            {
                role: "user",
                content: `Idea: ${idea}\n\nBackground: ${background}\n\nRequirements: ${requirements}`,
            },
        ],
    });

    // Ensure returning a valid stringified JSON even if something weird happens
    const raw = completion.choices[0].message.content ?? "{}";
    try {
        const parsed = JSON.parse(raw);
        return JSON.stringify({
            frontend: Array.isArray(parsed.frontend) ? parsed.frontend : [],
            backend: Array.isArray(parsed.backend) ? parsed.backend : [],
            database: Array.isArray(parsed.database) ? parsed.database : [],
            deployment: Array.isArray(parsed.deployment) ? parsed.deployment : []
        });
    } catch {
        // Absolute fallback
        return JSON.stringify({ frontend: [], backend: [], database: [], deployment: [] });
    }
}
