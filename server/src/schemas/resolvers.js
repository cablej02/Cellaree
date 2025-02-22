import { get } from 'mongoose';
import { User } from '../models/index.js';
import { Winery } from '../models/index.js';
import { WineStyle } from '../models/index.js';
import { Bottle } from '../models/index.js';
import { UserBottle } from '../models/index.js';
import { Review } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
        getWineries: async () => {
            return Winery.find();
        },
        getWinery: async (parent, { _id }) => {
            return Winery.findById( _id );
        },
        getWineStyles: async () => {
            return WineStyle.find();
        },
        getWineStyle: async (parent, { _id }) => {
            return WineStyle.findById( _id );
        },
        getBottles: async (parent, { page = 1, limit = 10 }) => {
            return Bottle.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('winery')
                .populate('style');
        },
        getBottle: async (parent, { _id }) => {
            return Bottle.findById( _id ).populate('winery').populate('style');
        },
        getUserBottles: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            return UserBottle.find({ userId: context.user._id });
        },
        getUserBottle: async (parent, { _id }, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            const userBottle = await UserBottle.findById( _id );

            if (!userBottle || userBottle.userId.toString() !== context.user._id) {
                throw new AuthenticationError("You can't view another user's bottles!");
            }

            return userBottle;
        },
        getReviewsForBottle: async (parent, { bottleId }) => {
            return Review.find({ bottleId });
        },
        getReviewsByUser: async (parent, args, context) => {
            return Review.find({ userId: context.user._id });
        },
        getReview: async (parent, { _id }) => {
            return Review.findById( _id );
        },
    },

    Mutation: {
        // login via email or username
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ $or: [{ username: email }, { email: email }] });

            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }

            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(user.username, user.email, user._id);

            return { token, user };
        },
    },
};

export default resolvers;