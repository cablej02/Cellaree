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
        getWineries: async () => Winery.find(),
        getWinery: async (parent, { _id }) => {
            try {
                const winery = await Winery.findById( _id );

                if(!winery){
                    throw new Error('No winery found with this id!');
                }

                return winery;
            } catch (err) {
                throw new Error(`Error fetching Winery: ${err}`);
            }
        },
        getWineStyles: async () => WineStyle.find(),
        getWineStyle: async (parent, { _id }) => {
            try {
                const style = await WineStyle.findById( _id );

                if (!style) {
                    throw new Error('No style found with this id!');
                }

                return style;
            } catch (err) {
                throw new Error(`Error fetching WineStyle: ${err}`);
            }
        },
        getBottles: async (parent, { page = 1, limit = 10 }) => {
            return Bottle.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('winery')
                .populate('style');
        },
        getBottle: async (parent, { _id }) => {
            try {
                const bottle = await Bottle.findById( _id ).populate('winery').populate('style');

                if (!bottle) {
                    throw new Error('No bottle found with this id!');
                }

                return bottle;
            } catch (err) {
                throw new Error(`Error fetching bottle: ${err}`);
            }
        },
        getUserBottles: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            return UserBottle.find({ userId: context.user._id });
        },
        getUserBottle: async (parent, { _id }, context) => {
            try {
                if (!context.user) throw new AuthenticationError("Not logged in");

                const userBottle = await UserBottle.findById( _id );

                if (!userBottle || userBottle.userId.toString() !== context.user._id) {
                    throw new AuthenticationError("You can't view another user's bottles!");
                }

                return userBottle;
            } catch (err) {
                throw new Error(`Error fetching user bottle: ${err}`);
            }
        },
        getReviewsForBottle: async (parent, { bottleId }, context) => {
            try {
                const reviews = await Review.find({ bottleId });

                // calculate average rating
                const reviewCount = reviews.length;
                const totalScore = reviews.reduce((sum, review) => acc + review.rating, 0);
                const avgRating = reviewCount > 0 ? totalScore / reviewCount : 0;

                // filter for public reviews or the user's own reviews
                const visibleReviews = reviews.filter(review => 
                    review.isPublic || 
                    (context.user && review.userId.toString() === context.user._id)
                );

                return { avgRating, reviews: visibleReviews };
            } catch (err) {
                throw new Error(`Error fetching reviews: ${err}`);
            }
        },
        getReviewsByUser: async (parent, args, context) => {
            return Review.find({ userId: context.user._id });
        },
        getReview: async (parent, { _id }, context) => {
            try {
                const review = await Review.findById( _id );

                if (!review) {
                    throw new Error('No review found with this id!');
                }

                if( !review.isPublic && review.userId.toString() !== context.user._id ) {
                    throw new AuthenticationError("You can't view this review!");
                }

                return review;
            } catch (err) {
                throw new Error(`Error fetching review: ${err}`);
            }
        },
    },

    Mutation: {
        // login via email or username
        login: async (parent, { email, password }) => {
            try {
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
            } catch (err) {
                throw new AuthenticationError('Error logging in');
            }
        },

        addUser: async (parent, {username, email, password}) => {
            try {
                const user = await User.create({username, email, password});
                const token = signToken(user.username, user.email, user._id);

                return { token, user };
            } catch (err) {
                throw new Error(`Error creating user: ${err}`);
            }
        },
        addWinery: async (parent, args) => {
            try {
                return Winery.create(args);
            } catch (err) {
                throw new Error(`Error creating winery: ${err}`);
            }
        },
        addBottle: async (parent, args) => {
            try {
                return Bottle.create(args);
            } catch (err) {
                throw new Error(`Error creating bottle: ${err}`);
            }
        },
        addUserBottleToCellar: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                return UserBottle.create({ ...args, userId: context.user._id });
            } catch (err) {
                throw new Error(`Error adding bottle to cellar: ${err}`);
            }
        },
        addBottleToDrankHistory: async (parent, { _id, date, quantity }, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const userBottle = await UserBottle.findById( _id );

                if (!userBottle || userBottle.userId.toString() !== context.user._id) {
                    throw new AuthenticationError("You can't add to another user's bottles!");
                }

                userBottle.drankHistory.push({ date, quantity });
                return userBottle.save();
            } catch (err) {
                throw new Error(`Error adding to drank history: ${err}`);
            }
        }
    },
};

export default resolvers;