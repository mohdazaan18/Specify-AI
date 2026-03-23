import { gql } from "apollo-server-micro";

export const typeDefs = gql`

type Project {
  id: ID!
  title: String!
  description: String
  created_at: String
}

type SpecSection {
  id: ID!
  section_type: String!
  content: String
}

type AgentRun {
  id: ID!
  agent_name: String!
  section_type: String!
  status: String!
  created_at: String!
}

type Query {
  projects: [Project]
  project(id: ID!): Project
  specSections(projectId: ID!): [SpecSection]
  agentRuns(projectId: ID!): [AgentRun]
}

type Mutation {
  createProject(title: String!): Project
  runAgentPipeline(projectId: ID!): Boolean
  runAgentForSection(projectId: ID!, sectionType: String!): Boolean
  updateSectionContent(sectionId: ID!, content: String!): Boolean
}
`;