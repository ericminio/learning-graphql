const { expect } = require('chai');
const { ApolloClient, HttpLink, InMemoryCache } = require('@apollo/client/core');
const fetch = require('cross-fetch');
const { ApolloServer, gql } = require('apollo-server');
var { request } = require('./http-request');
  
describe('apollo server', () => {

  let apolloServer;
  beforeEach(async () => {
    apolloServer = new ApolloServer({ 
      typeDefs: gql`
        type Greeting { 
          text: String 
        }

        type Query { 
          greetings: Greeting 
        }
      `, 
      resolvers: {
        Query: {
          greetings: () => ({ text:'hello world' }),
        },
      } 
    });
    await apolloServer.listen({ port:4000 });
  })
  afterEach(async () => {
    await apolloServer.stop()
  });

  it('can answer to single query from ApolloClient', (done) => {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:4000/',        
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    client.query({
      query: gql`{ greetings { text } }`
    })
      .then(response => {
        expect(response.data).to.deep.equal({ 
          greetings: { 
            text:'hello world', 
            __typename: "Greeting" 
          } 
        })
        done();
      })
      .catch(error => done(error))          
  });

  it('can answer to single query from native HTTP POST', (done) => {
    request({
      hostname: 'localhost',
      port: 4000,
      path: `/`,
      method: 'POST',
      payload: JSON.stringify({ query: '{ greetings { text } }'}),
      contentType: 'application/json',
    })
      .then(response => {
        let answer = JSON.parse(response.body)
        expect(answer.data).to.deep.equal({ 
          greetings: { 
            text: 'hello world'
          }
        })
        done();
      })
      .catch(error => done(error))          
});
});