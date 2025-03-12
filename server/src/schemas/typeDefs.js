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
        country: String
        location: String
        wineStyle: WineStyle
    }

    type Winery {
        _id: ID
        name: String
    }

    type WineStyle {
        _id: ID
        name: String
        category: String
    }

    type CellarBottle {
        _id: ID
        bottle: Bottle
        vintage: Int
        quantity: Int
        purchasePrice: Float
        currentValue: Float
        purchaseDate: String
        notes: String
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
        rating: Int
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

    type DrinkBottleResponse {
        cellar: [CellarBottle]
        drankHistory: [DrankBottle]
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
        getBottleReviews(bottle: ID!): BottleReviews
        getUserReviews: [Review]
        getReview(_id: ID!): Review
        getAllowedCountries: [String]
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        updateUser(username: String, email: String, password: String!): User
        updatePassword(currentPassword: String!, newPassword: String!): String
        removeUser: User

        addWinery(name: String!): Winery
        updateWinery(_id: ID!, name: String!): Winery

        addBottle(winery: ID!, productName: String!, country:String!, location: String, wineStyle: ID!): Bottle
        updateBottle(_id: ID!, winery: ID, productName: String, country:String, location: String, wineStyle: ID): Bottle

        addCellarBottle(bottle: ID!, vintage: Int, quantity: Int!, purchasePrice: Float, purchaseDate: String, notes: String): CellarBottle
        updateCellarBottle(_id: ID!, vintage: Int, quantity: Int, purchasePrice: Float, currentValue: Float, purchaseDate: String, notes: String): CellarBottle
        removeCellarBottle(_id: ID!): CellarBottle
        drinkCellarBottle(_id: ID!, quantity: Int!, drankDate: String): DrinkBottleResponse

        addDrankBottle(bottle: ID!, vintage: Int, drankDate: String, quantity: Int!): DrankBottle
        updateDrankBottle(_id: ID!, vintage: Int, quantity: Int, drankDate: String): DrankBottle
        removeDrankBottle(_id: ID!): DrankBottle

        addWishlistBottle(bottle: ID!): WishlistBottle
        updateWishlistBottle(_id: ID!, notes: String!): WishlistBottle
        removeWishlistBottle(_id: ID!): WishlistBottle

        addReview(bottle: ID!, vintage: Int, rating: Int!, content: String, isPublic: Boolean!): Review
        updateReview(_id: ID!, vintage: Int, rating: Int!, content: String, isPublic: Boolean): Review
        removeReview(_id: ID!): Review
    }
`;

export default typeDefs;