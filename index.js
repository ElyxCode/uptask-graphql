const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");
require("dotenv").config(".env");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDB = require("./config/db");

// run db
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const user = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.SECRET_WORD
        );

        console.log(user);

        return { user };
      } catch (error) {
        console.log(error);
      }
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready in url ${url}`);
});
