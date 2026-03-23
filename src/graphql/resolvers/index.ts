import { projectResolver } from "./projectResolver";

export const resolvers = {
  Mutation: {
    ...projectResolver.Mutation,
  },
};