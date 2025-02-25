import { User } from '../models/index.js';
import { Winery } from '../models/index.js';
import { WineStyle } from '../models/index.js';
import { Bottle } from '../models/index.js';
import { Review } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

// helper function to normalize date to just the date (no time)
const normalizeDate = date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate({
                        path: 'cellar.bottle',
                        populate: 'winery wineStyle' // populate paths for nested objects
                    })
                    .populate({
                        path: 'drankHistory.bottle',
                        populate: 'winery wineStyle' // populate paths for nested objects
                    })
                    .populate({
                        path: 'wishlist.bottle',
                        populate: 'winery wineStyle' // populate paths for nested objects
                    })

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
                .populate('winery')
                .populate('wineStyle')
                .lean(); // return as plain JS object
        },
        getBottle: async (parent, { _id }) => {
            try {
                const bottle = await Bottle.findById( _id )
                    .populate('winery')
                    .populate('wineStyle')
                    .lean();

                if (!bottle) throw new Error('No bottle found with this id!');
                return bottle;
            } catch (err) {
                throw new Error(`Error fetching bottle: ${err}`);
            }
        },
        getReviewsForBottle: async (parent, { bottleId }, context) => {
            try {
                const reviews = await Review.find({ bottleId })
                    .populate('user', 'username') // only return username
                    .populate({
                        path: 'bottle',
                        populate: 'winery wineStyle'
                    })
                    .lean();

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
                    (context.user && review.user._id.toString() === context.user._id)
                );

                return { avgRating, ratingsCount, reviews: visibleReviews };
            } catch (err) {
                throw new Error(`Error fetching reviews for bottle: ${err}`);
            }
        },
        getReviews: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError('Not logged in');
            try {
                return Review.find({ user: context.user._id })
                    .populate({
                        path: 'bottle',
                        populate: 'winery wineStyle'
                    })
                    .populate('user', 'username') // only return username
                    .lean();
            } catch (err) {
                throw new Error(`Error fetching reviews for user: ${err}`);
            }
        },
        getReview: async (parent, { _id }, context) => {
            try {
                const review = await Review.findById( _id )
                    .populate({
                        path: 'bottle',
                        populate: 'winery wineStyle'
                    })
                    .populate('user', 'username') // only return username
                    .lean();

                if (!review) {
                    throw new Error('No review found with this id!');
                }

                if( !review.isPublic && (!context.user || review.user._id.toString() !== context.user._id )) {
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
        updateUser: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                // add new fields to updatedFields object
                const updatedFields = {};
                if(args.username) updatedFields.username = args.username;
                if(args.email) updatedFields.email = args.email;
                if(args.password) updatedFields.password = args.password;

                if( !Object.keys(updatedFields).length ) throw new Error('No fields to update!');

                const user = await User.findByIdAndUpdate(
                    context.user._id, 
                    { $set: updatedFields },
                    { new: true, runValidators: true }
                ).select('username email');

                if(!user) throw new Error('No user found with this id!');
                
                return user;
            } catch (err) {
                throw new Error(`Error updating user: ${err}`);
            }
        },
        removeUser: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                // set the user field in reviews to null
                await Review.updateMany({ user: context.user._id }, { user: null });

                const user = await User.findByIdAndDelete(context.user._id);
                if (!user) throw new Error('No user found with this id!');
                return user;
            } catch (err) {
                throw new Error(`Error deleting user: ${err}`);
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
        updateWinery: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const updatedFields = {};
                if (args.name) updatedFields.name = args.name;
                if (args.countries) updatedFields.countries = args.countries;

                if (!Object.keys(updatedFields).length) throw new Error('No fields to update!');

                const winery = await Winery.findByIdAndUpdate(
                    args._id,
                    { $set: updatedFields },
                    { new: true, runValidators: true }
                );

                if (!winery) throw new Error('No winery found with this id!');
                return winery;
            } catch (err) {
                throw new Error(`Error updating winery: ${err}`);
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
        updateBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const updatedFields = {};
                if (args.winery) updatedFields.winery = args.winery;
                if (args.productName) updatedFields.productName = args.productName;
                if (args.location) updatedFields.location = args.location;
                if (args.wineStyle) updatedFields.wineStyle = args.wineStyle;

                if (!Object.keys(updatedFields).length) throw new Error('No fields to update!');

                const bottle = await Bottle.findByIdAndUpdate(
                    args._id,
                    { $set: updatedFields },
                    { new: true, runValidators: true }
                ).populate('winery').populate('wineStyle');
                
                if (!bottle) throw new Error('No bottle found with this id!');
                return bottle;
            } catch (err) {
                throw new Error(`Error updating bottle: ${err}`);
            }
        },

        addCellarBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                // if purchaseDate is not provided, set it to today
                const purchaseDate = args.purchaseDate ? new Date(args.purchaseDate) : new Date();

                // Find an existing entry with same bottleId, vintage, purchasePrice and purchaseDate
                const existingEntry = user.cellar.find(
                    obj => obj.bottle.toString() === args.bottle &&
                    obj.vintage === args.vintage &&
                    obj.purchasePrice === args.purchasePrice &&
                    normalizeDate(obj.purchaseDate) === normalizeDate(purchaseDate)
                );

                if (existingEntry) {
                    existingEntry.quantity += args.quantity; // increment quantity
                    await user.save(); // update db
                    return existingEntry; // return the updated entry
                }

                user.cellar.push({ ...args, purchaseDate }); // add bottle to cellar
                await user.save(); // update db
                return user.cellar[user.cellar.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding bottle to cellar: ${err}`);
            }
        },
        updateCellarBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const updatedFields = {};
                if (args.vintage) updatedFields.vintage = args.vintage;
                if (args.quantity) updatedFields.quantity = args.quantity;
                if (args.purchasePrice) updatedFields.purchasePrice = args.purchasePrice;
                if (args.currentValue) updatedFields.currentValue = args.currentValue;
                if (args.purchaseDate) updatedFields.purchaseDate = args.purchaseDate;

                if (!Object.keys(updatedFields).length) throw new Error('No fields to update!');

                // build $set object by looping over updatedFields and setting the values to the correct path for the subdocument
                const setObj = {};
                for (const [key, value] of Object.entries(updatedFields)) {
                    setObj[`cellar.$.${key}`] = value
                }

                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id, 'cellar._id': args._id }, // find the user and the cellar subdocument by _id
                    { $set: setObj },
                    { new: true, runValidators: true }
                );
                
                if (!updatedUser) throw new Error('No cellar bottle found with this id!');

                // return the updated cellar entry
                return updatedUser.cellar.find(obj => obj._id.toString() === args._id);
            } catch (err) {
                throw new Error(`Error updating cellar bottle: ${err}`);
            }
        },
        removeCellarBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                // get the user cellar array
                const user = await User.findById(context.user._id).select('cellar');

                // find the entry in the cellar array
                let removedEntry = user.cellar.find(obj => obj._id.toString() === args._id);

                if (!removedEntry) throw new Error('No cellar bottle found with this id!');

                // remove the cellarBottle from the database 
                await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { cellar: { _id: args._id } } }
                );

                return removedEntry; // return the removed entry
            } catch (err) {
                throw new Error(`Error removing bottle from cellar: ${err}`);
            }
        },

        addDrankBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                const drankDate = args.drankDate ? new Date(args.drankDate) : new Date(); 

                // Find an existing entry with same bottleId, vintage, and drankDate
                const existingEntry = user.drankHistory.find(
                    obj => obj.bottle.toString() === args.bottle &&
                    obj.vintage === args.vintage &&
                    normalizeDate(obj.drankDate) === normalizeDate(drankDate)
                );

                if( existingEntry ) {
                    existingEntry.quantity += args.quantity; // increment quantity drank
                    await user.save(); // update db
                    return existingEntry; // return the updated entry
                }

                user.drankHistory.push({ ...args, drankDate }); // add new entry to drank history
                await user.save(); // update db
                return user.drankHistory[user.drankHistory.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding to drank history: ${err}`);
            }
        },
        addWishlistBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                // check if bottle is already in wishlist
                const exists = user.wishlist.some(obj => obj.bottle.toString() === args.bottle);

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
        updateWishlistBottle: async (parent, args , context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                const wishlistEntry = user.wishlist.find(obj => obj.bottle.toString() === args.bottle);

                if (!wishlistEntry) {
                    throw new Error('No bottle found in wishlist with this id!');
                }

                wishlistEntry.notes = args.notes;
                await user.save();
                return wishlistEntry;
            } catch (err) {
                throw new Error(`Error updating wishlist notes: ${err}`);
            }
        },
        removeWishlistBottle: async (parent, args , context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id);

                // find the entry in the wishlist array
                const entry = user.wishlist.find(obj => obj.bottle.toString() === args.bottle);

                if (!entry) throw new Error('No bottle found in wishlist with this id!');

                // remove the bottle from the wishlist
                user.wishlist = user.wishlist.filter(obj => obj.bottle.toString() !== args.bottle);

                await user.save();
                return entry; // return the removed entry
            } catch (err) {
                throw new Error(`Error removing bottle from wishlist: ${err}`);
            }
        },

        addReview: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                return await Review.create({ ...args, user: context.user._id });
            } catch (err) {
                throw new Error(`Error adding review: ${err}`);
            }
        }
    },
};

export default resolvers;