const {ApolloServer} = require('apollo-server'); 
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');

const {createToken, getUserFromToken} = require('./auth');
const db = require('./db');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({req, connection}) {
    if (connection) {
      return {...db, ...connection.context}
    }
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return {...db, user, createToken}
  },
  subscriptions: {
    onConnect(connectionParams) {
      if(connectionParams.auth) {
        const user = getUserFromToken(connectionParams.auth);

        if(!user) {
          throw new Error("Not authenticated")
        }

        return { user }
      }
      
      throw new Error("Not authenticated")
    }
  }
})

server.listen(4000).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`)
})
