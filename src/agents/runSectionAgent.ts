import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!, // Use your Groq API key
  baseURL: "https://api.groq.com/openai/v1", // Groq endpoint
});

export async function runSectionAgent(
  idea: string,
  section: string
) {

  // Use Groq-supported model
  const model = "llama-3.1-8b-instant";

  const completion = await client.chat.completions.create({
    model,

    messages: [
      {
        role: "system",
        content: `You are a senior software architect writing the ${section} section of an engineering design specification. Keep it concise, structured, and professional. Do not use placeholders or templates.`,
      },
      {
        role: "user",
        content: `Project idea: ${idea}`,
      },
    ],
  });

  return completion.choices[0].message.content ?? "";
}