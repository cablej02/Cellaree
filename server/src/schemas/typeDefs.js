import { gql } from 'graphql-tag';

export const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        cellar: [CellarBottle]
        drankHistory: [DrankBottle]
        wishlist: [WishlistBottle]
    }

    type WishlistBottle {
        _id: ID
        bottle: Bottle
        notes: String
        addedDate: String
    }

    type Bottle {
        _id: ID
        winery: Winery
        productName: String
        location: String
        wineStyle: WineStyle
    }

    type Winery {
        _id: ID
        name: String
        countries: [String]
    }

    type WineStyle {
        _id: ID
        name: String
    }

    type CellarBottle {
        _id: ID
        bottle: Bottle
        vintage: Int
        quantity: Int
        purchasePrice: Float
        currentValue: Float
        purchaseDate: String
    }

    type DrankBottle {
        _id: ID
        bottle: Bottle
        vintage: Int
        quantity: Int
        drankDate: String
    }

    type Review {
        _id: ID
        user: ReviewUser
        bottle: Bottle
        vintage: Int
        rating: Float
        content: String
        isPublic: Boolean
    }

    type ReviewUser {
        _id: ID
        username: String
    }

    type BottleReviews {
        avgRating: Float
        ratingsCount: Int
        reviews: [Review]
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        me: User
        getWineries: [Winery]
        getWinery(_id: ID!): Winery
        getWineStyles: [WineStyle]
        getWineStyle(_id: ID!): WineStyle
        getBottles(page: Int, limit: Int): [Bottle]
        getBottle(_id: ID!): Bottle
        getReviewsForBottle(bottle: ID!): BottleReviews
        getReviews: [Review]
        getReview(_id: ID!): Review
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        updateUser(username: String, email: String, password: String): User
        removeUser: User

        addWinery(name: String!, countries: [String]!): Winery
        updateWinery(_id: ID!, name: String, countries: [String]): Winery

        addBottle(winery: ID!, productName: String!, location: String, wineStyle: ID!): Bottle
        updateBottle(_id: ID!, winery: ID, productName: String, location: String, wineStyle: ID): Bottle

        addCellarBottle(bottle: ID!, vintage: Int, quantity: Int!, purchasePrice: Float, purchaseDate: String): CellarBottle
        updateCellarBottle(_id: ID!, vintage: Int, quantity: Int, purchasePrice: Float, currentValue: Float, purchaseDate: String): CellarBottle
        removeCellarBottle(_id: ID!): CellarBottle

        addDrankBottle(bottle: ID!, vintage: Int, drankDate: String, quantity: Int!): DrankBottle
        updateDrankBottle(_id: ID!, vintage: Int, quantity: Int, drankDate: String): DrankBottle
        removeDrankBottle(_id: ID!): DrankBottle

        addWishlistBottle(bottle: ID!): WishlistBottle
        updateWishlistBottle(_id: ID!, notes: String!): WishlistBottle
        removeWishlistBottle(_id: ID!): WishlistBottle

        addReview(bottle: ID!, vintage: Int, rating: Float, content: String, isPublic: Boolean): Review
        updateReview(_id: ID!, vintage: Int, rating: Float, content: String, isPublic: Boolean): Review
        removeReview(_id: ID!): Review
    }
`;

export default typeDefs;