const { expect } = require('chai');
const { buildSchema } = require('graphql');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { request } = require('./http-request')
  
  describe('fetching data', () => {

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
        graphiql: true,
      }));
      server = app.listen(4000, () => {
        done();
      });
    })
    afterEach(() => {
      server.close()
    })

    it('can be done with a POST request', (done) => {
        request({
          hostname: 'localhost',
          port: 4000,
          path: `/api`,
          method: 'POST',
          payload: { query: '{ greetings }' }
        })
          .then(response => {
            let answer = JSON.parse(response.body)
            expect(answer).to.deep.equal({ data: { greetings:'hello world' }})
            done();
          })
          .catch(error => done(error))          
    });
});