const { expect } = require('chai');
const {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema,
  } = require('graphql');
  
  describe('query without parameter returning hard-coded value', () => {

    it('can be done like this', async () => {
        let schema = new GraphQLSchema({
            query: new GraphQLObjectType({
              name: 'RootQueryType',
              fields: {
                greetings: {
                  type: GraphQLString,
                  resolve() {
                    return 'hello world';
                  },
                },
              },
            }),
          });        
        let query = '{ greetings }';
        let result = await graphql({ schema:schema, source:query });
        
        expect(result).to.deep.equal({ data: { greetings: 'hello world' } })
    });

    it('can be less verbose with buildSchema', async () => {
        let schema = buildSchema(`
            type Query {
                greetings: String
            }
        `);
        var resolver = {
            greetings: () => {
                return 'hello world';
            },
        };
        let query = '{ greetings }';
        let result = await graphql({ schema:schema, source:query, rootValue:resolver });
        
        expect(result).to.deep.equal({ data: { greetings: 'hello world' } })
    });
});