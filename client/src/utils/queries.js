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
                notes
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

export const GET_BOTTLES = gql`
    {
        getBottles {
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
            currentValues {
                vintage
                value
                date
            }
        }
    }
`;

export const GET_WINERIES = gql`
    {
        getWineries {
            _id
            name
        }
    }
`;

export const GET_WINE_STYLES = gql`
    {
        getWineStyles {
            _id
            name
            category
        }
    }
`;

export const GET_ALLOWED_COUNTRIES = gql`
    {
        getAllowedCountries
    }
`;

export const GET_USER_REVIEWS = gql`
    {
        getUserReviews {
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
            rating
            content
            isPublic
        }
    }
`;

export const GET_BOTTLE_REVIEWS = gql`
    query getBottleReviews($bottle: ID!) {
        getBottleReviews(bottle: $bottle) {
            avgRating
            ratingsCount
            reviews {
                _id
                user {
                    _id
                    username
                }
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
                rating
                content
                isPublic
            }
        }
    }
`;