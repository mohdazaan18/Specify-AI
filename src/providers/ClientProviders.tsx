"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import ApolloWrapper from "./ApolloProvider";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ApolloWrapper>{children}</ApolloWrapper>
    </AuthProvider>
  );
}