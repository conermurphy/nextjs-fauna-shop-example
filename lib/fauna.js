import { GraphQLClient, gql } from 'graphql-request'

const CLIENT_SECRET =
  process.env.FAUNA_ADMIN_KEY || process.env.FAUNA_CLIENT_SECRET
const FAUNA_GRAPHQL_BASE_URL = 'https://graphql.fauna.com/graphql'

const graphQLClient = new GraphQLClient(FAUNA_GRAPHQL_BASE_URL, {
  headers: {
    authorization: `Bearer ${CLIENT_SECRET}`,
  },
})

export const listProducts = () => {
  const query = gql`
    query {
      getAllProducts {
        data {
          _id
          _ts
          title
          quantity
        }
      }
    }
  `

  return graphQLClient
    .request(query)
    .then(({ getAllProducts: { data } }) => data)
}

export const createProduct = (newProduct) => {
  const mutation = gql`
    mutation createProduct($input: ProductInput!) {
      createProduct(data: $input) {
        _id
        _ts
        title
        quantity
      }
    }
  `

  return graphQLClient.request(mutation, { input: newProduct })
}


export const updateProduct = (id, updatedProduct) => {
  const mutation = gql`
    mutation updateProduct($id: ID!, $input: ProductInput!) {
      updateProduct(id: $id, data: $input) {
        _id
        _ts
        title
        quantity
      }
    }
  `

  return graphQLClient.request(mutation, { id, input: updatedProduct })
}