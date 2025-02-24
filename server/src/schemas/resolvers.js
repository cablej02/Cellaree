import { User } from '../models/index.js';
import { Winery } from '../models/index.js';
import { WineStyle } from '../models/index.js';
import { Bottle } from '../models/index.js';
import { Review } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

const resolvers = {
    Bottle: {
        winery: async (parent) => Winery.findById(parent.wineryId),
        style: async (parent) => WineStyle.findById(parent.wineStyleId)
    },

    // Wishlist: {
    //     bottle: async (parent) => {
    //         return await Bottle.findById(parent.bottleId);
    //     }
    // },

    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
        getWineries: async () => Winery.find().lean(),
        getWinery: async (parent, { _id }) => {
            try {
                const winery = await Winery.findById( _id );
                if(!winery) throw new Error('No winery found with this id!');
                return winery;
            } catch (err) {
                throw new Error(`Error fetching Winery: ${err}`);
            }
        },
        getWineStyles: async () => WineStyle.find().lean(),
        getWineStyle: async (parent, { _id }) => {
            try {
                const style = await WineStyle.findById( _id );
                if (!style) throw new Error('No style found with this id!');
                return style;
            } catch (err) {
                throw new Error(`Error fetching WineStyle: ${err}`);
            }
        },
        getBottles: async (parent, { page = 1, limit = 10 }) => {
            return Bottle.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('wineryId')
                .populate('wineStyleId')
                .lean(); // return as plain JS object
        },
        getBottle: async (parent, { _id }) => {
            try {
                const bottle = await Bottle.findById( _id )
                    .populate('wineryId')
                    .populate('wineStyleId')
                    .lean();

                if (!bottle) throw new Error('No bottle found with this id!');
                return bottle;
            } catch (err) {
                throw new Error(`Error fetching bottle: ${err}`);
            }
        },
        getReviewsForBottle: async (parent, { bottleId }, context) => {
            try {
                const reviews = await Review.find({ bottleId });

                // if no reviews, return null for avgRating
                if (!reviews.length) {
                    return { avgRating: null, ratingsCount: 0, reviews: [] };
                }

                // calculate average rating
                const ratingsCount = reviews.length;
                const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
                const avgRating =  totalScore / ratingsCount;
                

                // filter for public reviews or the user's own reviews
                const visibleReviews = reviews.filter(review => 
                    review.isPublic || 
                    (context.user && review.userId.toString() === context.user._id)
                );

                return { avgRating, ratingsCount, reviews: visibleReviews };
            } catch (err) {
                throw new Error(`Error fetching reviews for bottle: ${err}`);
            }
        },
        getReviewsByUser: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Not logged in');
            try {
                return Review.find({ userId: context.user._id });
            } catch (err) {
                throw new Error(`Error fetching reviews for user: ${err}`);
            }
        },
        getReview: async (parent, { _id }, context) => {
            try {
                const review = await Review.findById( _id );

                if (!review) {
                    throw new Error('No review found with this id!');
                }

                if( !review.isPublic && (!context.user || review.userId.toString() !== context.user._id )) {
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
        addWinery: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Must be logged in to add a Winery!");

            try {
                return Winery.create(args);
            } catch (err) {
                throw new Error(`Error creating winery: ${err}`);
            }
        },
        addBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Must be logged in to add a bottle!");

            try {
                return Bottle.create(args);
            } catch (err) {
                throw new Error(`Error creating bottle: ${err}`);
            }
        },
        addCellarBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                // Find an existing entry with same bottleId, vintage, and purchaseDate
                const existingEntry = user.cellar.find(
                    obj => obj.bottleId.toString() === args.bottleId &&
                    obj.vintage === args.vintage &&
                    new Date(obj.purchaseDate).toDateString() === new Date(args.purchaseDate).toDateString()
                );

                if (exists) {
                    existingEntry.quantity += args.quantity; // increment quantity
                    await user.save(); // update db
                    return existingEntry; // return the updated entry
                }

                
                user.cellar.push(args); // add bottle to cellar
                await user.save(); // update db
                return user.cellar[user.cellar.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding bottle to cellar: ${err}`);
            }
        },
        addDrankBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                // Find an existing entry with same bottleId, vintage, and drankDate
                const existingEntry = user.cellar.find(
                    obj => obj.bottleId.toString() === args.bottleId &&
                    obj.vintage === args.vintage &&
                    new Date(obj.drankDate).toDateString() === new Date(args.drankDate).toDateString()
                );

                if( existingEntry ) {
                    existingEntry.quantity += args.quantity; // increment quantity drank
                    await user.save(); // update db
                    return existingEntry; // return the updated entry
                }

                user.drank.push(args); // add new entry to drank history
                await user.save(); // update db
                return user.drank[user.drank.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding to drank history: ${err}`);
            }
        },
        addWishlistBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                // check if bottle is already in wishlist
                const exists = user.wishlist.some(
                    obj => obj.bottleId.toString() === args.bottleId &&
                    obj.vintage === args.vintage
                );

                if ( exists ) {
                    throw new Error('This bottle is already in your wishlist!');
                }

                
                user.wishlist.push(args); // add bottle to wishlist
                await user.save(); // update db
                return user.wishlist[user.wishlist.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding to wishlist: ${err}`);
            }
        },
        addReview: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                return await Review.create({ ...args, userId: context.user._id });
            } catch (err) {
                throw new Error(`Error adding review: ${err}`);
            }
        }
    },
};

export default resolvers;