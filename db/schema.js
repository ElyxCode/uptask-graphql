const { gql } = require("apollo-server");

const typeDefs = gql`
  type Token {
    token: String
  }

  type Project {
    name: String
    id: ID
  }

  type Task {
    name: String
    id: ID
    project: String
    status: Boolean
  }

  type Query {
    getProjects: [Project]
    getTasks(input: ProjectIdInput): [Task]
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  input AuthInput {
    email: String!
    password: String!
  }

  input ProjectInput {
    name: String!
  }

  input TaskInput {
    name: String!
    project: String
  }

  input ProjectIdInput {
    project: String!
  }

  type Mutation {
    # users
    createUser(input: UserInput): String
    authUser(input: AuthInput): Token

    #projects
    newProject(input: ProjectInput): Project
    updateProject(id: ID!, input: ProjectInput): Project
    deleteProject(id: ID!): String

    #tasks
    newTask(input: TaskInput): Task
    updateTask(id: ID!, input: TaskInput, status: Boolean): Task
    deleteTask(id: ID!): String
  }
`;

module.exports = typeDefs;
