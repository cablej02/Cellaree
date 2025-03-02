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

export const DRINK_CELLAR_BOTTLE = gql`
    mutation drinkCellarBottle($_id: ID!, $quantity: Int!, $drankDate: String) {
        drinkCellarBottle(_id: $_id, quantity: $quantity, drankDate: $drankDate) {
            cellar {
                _id
                bottle {
                    _id
                    winery {
                        _id
                        name
                    }
                    productName
                    country
                    location
                    wineStyle {
                        _id
                        name
                        category
                    }
                }
                vintage
                quantity
                purchasePrice
                currentValue
                purchaseDate
            }
            drankHistory {
                _id
                vintage
                quantity
                drankDate
                bottle {
                    _id
                    winery {
                        _id
                        name
                    }
                    productName
                    country
                    location
                    wineStyle {
                        _id
                        name
                        category
                    }
                }
            }
        }
    }
`;

export const ADD_BOTTLE = gql`
    mutation addBottle($productName: String!, $winery: ID!, $wineStyle: ID!, $country: String!, $location: String) {
        addBottle(productName: $productName, winery: $winery, wineStyle: $wineStyle, country: $country, location: $location) {
            _id
            productName
            winery {
                _id
                name
            }
            wineStyle {
                _id
                name
                category
            }
            country
            location
        }
    }
`;