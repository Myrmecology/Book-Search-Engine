import { gql } from 'apollo-server-express';

// Create our typeDefs
const typeDefs = gql`
  # Define a Book type for fields that come from Google Books API
  type Book {
    bookId: String!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
  }

  # Define a User type
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  # Define an Auth type for authentication
  type Auth {
    token: ID!
    user: User
  }

  # Input type for saving a book (all the parameters needed)
  input BookInput {
    bookId: String!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
  }

  # Define queries - operations that don't modify data
  type Query {
    # Returns the logged in user data
    me: User
  }

  # Define mutations - operations that modify data
  type Mutation {
    # Login mutation - takes email and password, returns auth token and user data
    login(email: String!, password: String!): Auth

    # Add user mutation - takes username, email, and password, returns auth token and user data
    addUser(username: String!, email: String!, password: String!): Auth

    # Save book mutation - takes a book input, returns the updated user
    saveBook(bookData: BookInput!): User

    # Remove book mutation - takes a bookId, returns the updated user
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;