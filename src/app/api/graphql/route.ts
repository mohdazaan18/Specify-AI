import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers/index";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: Request) => {
    // Request.headers is a Headers object in App Router
    const authHeader = req.headers.get("authorization"); // string | null
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    if (!token) return { user: null };

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    return { user };
  },
});

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}