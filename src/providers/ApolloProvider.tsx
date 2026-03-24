"use client";

import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { supabase } from "@/lib/supabase";

// HTTP connection to your GraphQL API
const httpLink = new HttpLink({
  uri: "/api/graphql", // Replace with your API endpoint
});

// Auth link (modern v4 way)
const authLink = setContext(async (_, { headers }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    headers: {
      ...headers,
      authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
    },
  };
});

// Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

interface ApolloWrapperProps {
  children: React.ReactNode;
}

export default function ApolloWrapper({ children }: ApolloWrapperProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}