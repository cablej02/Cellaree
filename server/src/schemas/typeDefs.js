import { gql } from 'graphql-tag';

export const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        wishlist: [Wishlist]
        userBottles: [UserBottle]
    }

    type Wishlist {
        bottleId: Bottle
        vintage: Int
        notes: String
    }

    type Bottle {
        _id: ID
        winery: Winery
        productName: String
        location: String
        style: WineStyle
    }

    type Winery {
        _id: ID
        name: String
    }

    type WineStyle {
        _id: ID
        name: String
    }

    type UserBottle {
        _id: ID
        userId: User
        bottleId: Bottle
        vintage: Int
        quantity: Int
        purchasePrice: Float
        currentValue: Float
        purchaseDate: String
        drankHistory: [DrankHistory]
    }

    type DrankHistory {
        date: Date
        quantity: Int
    }

    type Review {
        _id: ID
        userId: User
        bottleId: Bottle
        vintage: Int
        rating: Float
        content: String
        isPublic: Boolean
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
        getBottles: [Bottle]
        getBottle(_id: ID!): Bottle
        getUserBottles(userId: ID!): [UserBottle]
        getUserBottle(_id: ID!): UserBottle
        getReviewsForBottle(bottleId: ID!): [Review]
        getReviewsByUser(userId: ID!): [Review]
        getReview(_id: ID!): Review
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addWinery(name: String!, country: [String]!): Winery
        addBottle(winery: ID!, productName: String!, location: String, style: ID!): Bottle
        addUserBottleToCellar(bottleId: ID!, vintage: Int, quantity: Int!, purchasePrice: Float, purchaseDate: String): UserBottle
        addBottleToDrankHistory(userBottleId: ID!, date: Date!, quantity: Int!): UserBottle
        addBottleToWishlist(bottleId: ID!, vintage: Int, notes: String): User
        addReview(bottleId: ID!, vintage: Int, rating: Float, content: String, isPublic: Boolean): Review
    }
`;

export default typeDefs;