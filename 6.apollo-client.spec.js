const { expect } = require('chai');
const { buildSchema } = require('graphql');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const { ApolloClient, gql, HttpLink, InMemoryCache } = require('@apollo/client/core');
const { BatchHttpLink } = require('@apollo/client/link/batch-http');
const fetch = require('cross-fetch');
  
describe('apollo client', () => {

  let server;
  let contentType;
  let batchSize;
  beforeEach(async () => {
    let app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      contentType = req.headers['content-type']
      next();
    });
    app.use('/batch', (req, res, next) => {
      batchSize = req.body.length;
      req.body = req.body[0];
      next();
    });
    app.use('/', graphqlHTTP({
      schema: buildSchema(`type Query { greetings: String } `),
      rootValue: { greetings: 'hello world' },
    }));  
    server = await app.listen(4000);
  })
  afterEach(() => {
    server.close()
  });

  it('needs a fetch function', (done) => {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:4000/',        
        fetch,
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

  it('uses application/json content type', () => {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:4000/',        
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    client.query({
      query: gql`{ greetings }`
    })
      .then(() => {
        expect(contentType).to.equal('application/json');
        done();
      })
      .catch(error => done(error))      
  });

  it('can send a batch of queries', (done) => {
    const client = new ApolloClient({
      link: new BatchHttpLink({
        uri: 'http://localhost:4000/batch',        
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    client.query({
      query: gql`{ greetings }`
    })
      .then(response => {
        expect(batchSize).to.equal(1);
        expect(response.data).to.deep.equal({ greetings:'hello world' })
        done();
      })
      .catch(error => done(error))          
  });
});