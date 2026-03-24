import { gql } from "graphql-tag";

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

type Query {
  projects: [Project]
  project(id: ID!): Project
  specSections(projectId: ID!): [SpecSection]
  agentRuns(projectId: ID!): [AgentRun]
}

type AgentRun {
  id: ID!
  section_type: String!
  agent_name: String!
  status: String!
  created_at: String
}

type Mutation {

  createProject(
    title: String!
    idea: String
  ): Project

  updateProject(
    id: ID!
    title: String
    idea: String
  ): Project

  deleteProject(
    id: ID!
  ): Boolean

  updateSection(
    id: ID!
    content: String
  ): SpecSection

  generateBackground(projectId: ID!): Boolean
  generateSpec(projectId: ID!): Boolean
  regenerateSection(projectId: ID!, sectionType: String!): Boolean
}
`;