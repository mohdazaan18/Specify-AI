import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // keep using your Groq key
  baseURL: "https://api.groq.com/openai/v1",
});

export async function runBackgroundAgent(idea: string) {
  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant", // ✅ cheapest reliable model
    messages: [
      {
        role: "system",
        content: `
You are a senior software architect writing the BACKGROUND section of an engineering design specification for a project idea provided by the user. 

RULES:
1. Do NOT use placeholders like [project name] or [problem].
2. Do NOT output templates.
3. Always infer and fill in concrete details from the project idea.
4. Write 2-4 well-structured paragraphs.
5. Include:
   - Project description
   - Problem statement
   - Market / industry context
   - Technological landscape
   - Functional overview (brief)
6. Write in a professional, formal tone suitable for an engineering design document.
7. Output content only; no markdown formatting necessary unless explicitly requested.
        `,
      },
      {
        role: "user",
        content: `Project idea: ${idea}`,
      },
    ],
  });

  return completion.choices[0].message.content;
}