const { expect } = require('chai');
const { buildSchema } = require('graphql');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const { ApolloClient, gql, HttpLink, InMemoryCache } = require('@apollo/client/core');
const fetch = require('cross-fetch');
  
describe('apollo client', () => {

  let server;
  beforeEach((done) => {
    let schema = buildSchema(`
      type Query {
          greetings: String
      }
    `);
    let resolver = {
      greetings: () => {
          return 'hello world';
      },
    };
    let app = express();
    app.use('/api', graphqlHTTP({
      schema: schema,
      rootValue: resolver,
    }));
    server = app.listen(4000, () => {
      done();
    });
  })
  afterEach(() => {
    server.close()
  })

  it('needs a fetch function', (done) => {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:4000/api',        
        fetch: fetch,
      }),
      cache: new InMemoryCache(),
    });
    client.query({
      query: gql`{ greetings }`
    })
      .then(response => {
        expect(response.data).to.deep.equal({ greetings:'hello world' })
        done();
      })
      .catch(error => done(error))          
  });
});