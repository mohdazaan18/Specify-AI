import { agent } from "@/lib/agentClient";

export async function runBackgroundAgent(input: string) {
  const result = await agent.run({
    instructions: `
Generate the Background section of an engineering spec.

Context:
${input}
`
  });

  return result.output_text;
}