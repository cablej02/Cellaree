import { gql } from '@apollo/client';

export const ME = gql`
    {
        me {
            _id
            username
            email
                cellar {
            _id
            bottle {
                _id
                winery {
                _id
                name
                countries
                }
                productName
                location
                wineStyle {
                _id
                name
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
            bottle {
                _id
                winery {
                _id
                name
                countries
                }
                productName
                location
                wineStyle {
                _id
                name
                }
            }
            vintage
            quantity
            drankDate
            }
            wishlist {
            _id
            bottle {
                _id
                winery {
                _id
                name
                countries
                }
                productName
                location
                wineStyle {
                _id
                name
                }
            }
            notes
            addedDate
            }
        }
    }
`;