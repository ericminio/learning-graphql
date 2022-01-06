const { expect } = require('chai');
const { ApolloClient, HttpLink, InMemoryCache } = require('@apollo/client/core');
const fetch = require('cross-fetch');
const { ApolloServer, gql } = require('apollo-server');
  
describe('apollo server', () => {

  let apolloServer;
  beforeEach(async () => {
    const typeDefs = gql`
      type Book { 
        title: String 
      }

      type Query { 
        books: [Book] 
      }
    `;
    const resolvers = {
      Query: {
        books: () => [ { title:'hello world' } ],
      },
    };
    apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.listen({ port:4000 });
  })
  afterEach(async () => {
    await apolloServer.stop()
  });

  it('can answer to single query', (done) => {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:4000/',        
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    client.query({
      query: gql`query GetBooks { books { title } }`
    })
      .then(response => {
        expect(response.data).to.deep.equal({ books: [{ title:'hello world', __typename: "Book" }] })
        done();
      })
      .catch(error => done(error))          
  });
});