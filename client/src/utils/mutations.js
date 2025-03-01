import { gql } from '@apollo/client';

export const LOGIN = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                username
            }
        }
    }
`;

export const ADD_USER = gql`
    mutation addUser($username: String!, $email: String!, $password: String!) {
        addUser(username: $username, email: $email, password: $password) {
            token
            user {
                username
            }
        }
    }
`;

export const ADD_CELLAR_BOTTLE = gql`
    mutation addCellarBottle($bottle: ID!, $quantity: Int!, $vintage: Int, $purchasePrice: Float) {
        addCellarBottle(bottle: $bottle, quantity: $quantity, vintage: $vintage, purchasePrice: $purchasePrice) {
            _id
            vintage
            quantity
            purchasePrice
            currentValue
            purchaseDate
            bottle {
                _id
            }
        }
    }
`;
