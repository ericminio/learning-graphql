const { expect } = require('chai');
const { buildSchema } = require('graphql');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { request } = require('./http-request');

describe('fetching data', () => {
    let server;

    describe('single object', () => {
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

        it('can be done with a POST request', (done) => {
            request({
                hostname: 'localhost',
                port: 4000,
                path: `/api`,
                method: 'POST',
                payload: '{ greetings }',
            })
                .then((response) => {
                    let answer = JSON.parse(response.body);
                    expect(answer).to.deep.equal({
                        data: { greetings: 'hello world' },
                    });
                    done();
                })
                .catch((error) => done(error));
        });

        it('needs more info to use content type application/json', (done) => {
            request({
                hostname: 'localhost',
                port: 4000,
                path: `/api`,
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify({ query: '{ greetings }' }),
            })
                .then((response) => {
                    let answer = JSON.parse(response.body);
                    expect(answer).to.deep.equal({
                        data: { greetings: 'hello world' },
                    });
                    done();
                })
                .catch((error) => done(error));
        });
    });

    describe('collection', () => {
        beforeEach((done) => {
            let schema = buildSchema(`
                type Greeting {
                    value: String
                }
                type Query {
                    greetings: [Greeting]
                }
            `);
            let resolver = {
                greetings: () => {
                    return [{ value: 'hello' }, { value: 'world' }];
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

        it('is also a matter of type', (done) => {
            request({
                hostname: 'localhost',
                port: 4000,
                path: `/api`,
                method: 'POST',
                payload: '{ greetings { value } }',
            })
                .then((response) => {
                    let answer = JSON.parse(response.body);
                    expect(answer).to.deep.equal({
                        data: {
                            greetings: [{ value: 'hello' }, { value: 'world' }],
                        },
                    });
                    done();
                })
                .catch((error) => done(error));
        });
    });
});
