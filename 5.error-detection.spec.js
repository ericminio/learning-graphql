const { expect } = require('chai');
const { buildSchema } = require('graphql');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { request } = require('./http-request');

describe('error detection', () => {
    let server;
    beforeEach((done) => {
        let schema = buildSchema(`
          type Query {
            ignoedButNeeded: String
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

    it('reports field mismatch on mutation call', (done) => {
        request({
            hostname: 'localhost',
            port: 4000,
            path: `/api`,
            method: 'POST',
            payload: 'mutation { welcome(random:"Joe") }',
        })
            .then((response) => {
                let answer = JSON.parse(response.body);
                expect(answer).to.deep.equal({
                    errors: [
                        {
                            locations: [
                                {
                                    column: 20,
                                    line: 1,
                                },
                            ],
                            message:
                                'Unknown argument "random" on field "Mutation.welcome".',
                        },
                    ],
                });
                done();
            })
            .catch((error) => done(error));
    });
});
