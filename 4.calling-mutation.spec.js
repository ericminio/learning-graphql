const { expect } = require('chai');
const { buildSchema } = require('graphql');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { request } = require('./http-request');

describe('calling mutation', () => {
    let server;
    beforeEach((done) => {
        let schema = buildSchema(`
          type Query {
            ignoredButNeeded: String
          }

          type Mutation {
            welcome(name: String): String
          }
        `);
        let resolver = {
            welcome: (visitor) => {
                return `hello ${visitor.name}`;
            },
        };
        let app = express();
        app.use(
            '/api',
            graphqlHTTP({
                schema: schema,
                rootValue: resolver,
            })
        );
        server = app.listen(4000, () => {
            done();
        });
    });
    afterEach(() => {
        server.close();
    });

    it('requires the mutation keyword in the client query', (done) => {
        request({
            hostname: 'localhost',
            port: 4000,
            path: `/api`,
            method: 'POST',
            payload: 'mutation { welcome(name:"Joe") }',
        })
            .then((response) => {
                let answer = JSON.parse(response.body);
                expect(answer).to.deep.equal({
                    data: { welcome: 'hello Joe' },
                });
                done();
            })
            .catch((error) => done(error));
    });
});
