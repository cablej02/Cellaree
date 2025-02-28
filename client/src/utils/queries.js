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
                drankDate
            }
            wishlist {
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
                notes
                addedDate
            }
        }
    }
`;