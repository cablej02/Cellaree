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
        bottleId: Bottle
        vintage: Int
        notes: String
        addedDate: String
    }

    type Bottle {
        _id: ID
        wineryId: Winery
        productName: String
        location: String
        wineStyleId: WineStyle
    }

    type Winery {
        _id: ID
        name: String
    }

    type WineStyle {
        _id: ID
        name: String
    }

    type CellarBottle {
        _id: ID
        bottleId: Bottle
        vintage: Int
        quantity: Int
        purchasePrice: Float
        currentValue: Float
        purchaseDate: String
    }

    type DrankBottle {
        _id: ID
        bottleId: Bottle
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
        getReviewsForBottle(bottleId: ID!): BottleReviews
        getReviews: [Review]
        getReview(_id: ID!): Review
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addWinery(name: String!, country: [String]!): Winery
        addBottle(wineryId: ID!, productName: String!, location: String, wineStyleId: ID!): Bottle
        addCellarBottle(bottleId: ID!, vintage: Int, quantity: Int!, purchasePrice: Float, purchaseDate: String): CellarBottle
        addDrankBottle(bottleId: ID!, vintage: Int, drankDate: String, quantity: Int!): DrankBottle
        addWishlistBottle(bottleId: ID!, vintage: Int, notes: String): WishlistBottle
        addReview(bottleId: ID!, vintage: Int, rating: Float, content: String, isPublic: Boolean): Review
    }
`;

export default typeDefs;