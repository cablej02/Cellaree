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
        getWineries: async () => Winery.find().sort({name:1}).lean(),
        getWinery: async (parent, { _id }) => {
            try {
                const winery = await Winery.findById( _id );
                if(!winery) throw new Error('No winery found with this id!');
                return winery;
            } catch (err) {
                throw new Error(`Error fetching Winery: ${err}`);
            }
        },
        getWineStyles: async () => WineStyle.find().sort({name:1}).lean(),
        getWineStyle: async (parent, { _id }) => {
            try {
                const style = await WineStyle.findById( _id );
                if (!style) throw new Error('No style found with this id!');
                return style;
            } catch (err) {
                throw new Error(`Error fetching WineStyle: ${err}`);
            }
        },
        getBottles: async (parent, { page = 1, limit = 0 }) => {
            const result = Bottle.find()
                .populate('winery')
                .populate('wineStyle')
                .lean(); // return as plain JS object

            if (limit > 0) {
                result.skip((page - 1) * limit).limit(limit);
            }
            
            return result;
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

        getAllowedCountries: async () => {
            return Bottle.schema.path('country').enumValues;
        }
    },

    Mutation: {
        // login via email or username
        login: async (parent, { email, password }) => {
            try {
                const user = await User.findOne({ $or: [{ username_lower: email.toLowerCase() }, { email: email.toLowerCase() }] });

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
                const user = await User.findById(context.user._id).select('username email password');

                if(!user) throw new Error('No user found with this id!');

                // check if the current password is correct
                const validPassword = await user.isCorrectPassword(args.password);
                console.log(validPassword, typeof validPassword); //TODO remove this
                if (!validPassword) throw new AuthenticationError('Incorrect password!');

                // add new fields to updatedFields object
                const updatedFields = {};
                if(args.username) updatedFields.username = args.username;
                if(args.email) updatedFields.email = args.email;

                if( !Object.keys(updatedFields).length ) throw new Error('No fields to update!');

                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    { $set: updatedFields },
                    { new: true, runValidators: true }
                ).select('username email');

                return updatedUser;
            } catch (err) {
                throw new Error(`Error updating user: ${err}`);
            }
        },
        updatePassword: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id).select('password');

                if (!user) throw new Error('No user found with this id!');

                // check if the current password is correct
                const validPassword = await user.isCorrectPassword(args.currentPassword);
                console.log(validPassword, typeof validPassword); //TODO remove this
                if (!validPassword) throw new AuthenticationError('Incorrect password!');

                await User.findByIdAndUpdate(
                    user._id,
                    { $set: { password: args.newPassword } },
                    { new: true }
                );

                return 'Password updated Successfully!';
            } catch (err) {
                throw new Error(`Error updating password: ${err}`);
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
                const newBottle = await Bottle.create(args);
                return await Bottle.findById(newBottle._id).populate('winery').populate('wineStyle');
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
                if (args.country) updatedFields.country = args.country;
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
                const user = await User.findById(context.user._id).select('cellar');

                if(!user) throw new Error('No user found with this id!');

                // if purchaseDate is not provided, set it to today
                const purchaseDate = args.purchaseDate ? new Date(args.purchaseDate) : new Date();

                // Find an existing entry with same bottleId, vintage, purchasePrice and purchaseDate
                const existingEntry = user.cellar.find(
                    obj => obj.bottle.toString() === args.bottle &&
                    obj.vintage === args.vintage &&
                    obj.purchasePrice === args.purchasePrice &&
                    normalizeDate(obj.purchaseDate) === normalizeDate(purchaseDate)
                );

                // if entry exists, increment quantity
                if (existingEntry) {
                    // update the quantity of the existing entry
                    existingEntry.quantity += args.quantity;

                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id, 'cellar._id': existingEntry._id },
                        { $set: {"cellar.$": existingEntry } }, // update the existing subdoc
                        { new: true, runValidators: true, select: 'cellar' }
                    ).populate({
                        path: 'cellar.bottle',
                        populate: 'winery wineStyle'
                    })

                    // return the updated entry with the new quantity
                    return updatedUser.cellar.find(entry => entry._id.toString() === existingEntry._id.toString()); 
                }

                // create a new entry and add it to the cellar array
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $push: { cellar: { ...args, purchaseDate } } },
                    { new: true, runValidators: true, select: 'cellar' }
                ).populate({
                    path: 'cellar.bottle',
                    populate: 'winery wineStyle'
                });

                return updatedUser.cellar[updatedUser.cellar.length - 1]; // return the last item in the cellar array
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
                ).populate({
                    path: 'cellar.bottle',
                    populate: 'winery wineStyle'
                });
                
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
        drinkCellarBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id)
                    .select('cellar drankHistory')
                    .populate({
                        path: 'cellar.bottle',
                        populate: 'winery wineStyle'
                    }).populate({
                        path: 'drankHistory.bottle',
                        populate: 'winery wineStyle'
                    });
                
                if(!user) throw new Error('No user found with this id!');
                
                // find the cellar entry
                const cellarEntry = user.cellar.find(obj => obj._id.toString() === args._id);
                if (!cellarEntry) throw new Error('No cellar bottle found with this id!');

                // Validate quantity
                if(args.quantity > cellarEntry.quantity) {
                    throw new Error("You can't drink more than you have!");
                }

                // add the bottle to the drankHistory array
                const drankDate = args.drankDate ? new Date(args.drankDate) : new Date();

                // Find an existing entry with same bottleId, vintage, and drankDate
                const existingDrankEntry = user.drankHistory.find(
                    obj => obj.bottle.toString() === cellarEntry.bottle.toString() &&
                    obj.vintage === args.vintage &&
                    normalizeDate(obj.drankDate) === normalizeDate(drankDate)
                );

                if( existingDrankEntry ) {
                    existingDrankEntry.quantity += args.quantity; // increment quantity drank
                } else {
                    // create a new entry and add it to the drankHistory array
                    user.drankHistory.push({
                        bottle: cellarEntry.bottle,
                        vintage: cellarEntry.vintage,
                        quantity: args.quantity,
                        drankDate
                    })
                }

                // update quantity or remove from cellar
                if(cellarEntry.quantity > args.quantity) {
                    cellarEntry.quantity -= args.quantity;
                } else{
                    user.cellar = user.cellar.filter(obj => obj._id.toString() !== args._id);
                }

                await user.save();
                return { cellar: user.cellar, drankHistory: user.drankHistory};
            } catch (err) {
                throw new Error(`Error drinking bottle: ${err}`);
            }
        },

        addDrankBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id).select('drankHistory');

                if(!user) throw new Error('No user found with this id!');

                const drankDate = args.drankDate ? new Date(args.drankDate) : new Date(); 

                // Find an existing entry with same bottleId, vintage, and drankDate
                const existingEntry = user.drankHistory.find(
                    obj => obj.bottle.toString() === args.bottle &&
                    obj.vintage === args.vintage &&
                    normalizeDate(obj.drankDate) === normalizeDate(drankDate)
                );

                if( existingEntry ) {
                    existingEntry.quantity += args.quantity; // increment quantity drank

                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id, 'drankHistory._id': existingEntry._id },
                        { $set: { 'drankHistory.$': existingEntry } }, // update the existing subdoc
                        { new: true, runValidators: true, select: 'drankHistory' }
                    ).populate({
                        path: 'drankHistory.bottle',
                        populate: 'winery wineStyle'
                    })

                    // return the updated entry with the new quantity
                    return updatedUser.drankHistory.find(entry => entry._id.toString() === existingEntry._id.toString()); 
                }

                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $push: { drankHistory: { ...args, drankDate } } },
                    { new: true, runValidators: true, select: 'drankHistory' }
                ).populate({
                    path: 'drankHistory.bottle',
                    populate: 'winery wineStyle'
                });

                return updatedUser.drankHistory[updatedUser.drankHistory.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding to drank history: ${err}`);
            }
        },
        updateDrankBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const updatedFields = {};
                if (args.vintage) updatedFields.vintage = args.vintage;
                if (args.quantity) updatedFields.quantity = args.quantity;
                if (args.drankDate) updatedFields.drankDate = args.drankDate;

                if (!Object.keys(updatedFields).length) throw new Error('No fields to update!');

                // build $set object by looping over updatedFields and setting the values to the correct path for the subdocument
                const setObj = {};
                for (const [key, value] of Object.entries(updatedFields)) {
                    setObj[`drankHistory.$.${key}`] = value
                }

                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id, 'drankHistory._id': args._id }, // find the user and the drankHistory subdocument by _id
                    { $set: setObj },
                    { new: true, runValidators: true }
                ).populate({
                    path: 'drankHistory.bottle',
                    populate: 'winery wineStyle'
                });

                if (!updatedUser) throw new Error('No drank bottle found with this id!');

                // return the updated drank entry
                return updatedUser.drankHistory.find(obj => obj._id.toString() === args._id);
            } catch (err) {
                throw new Error(`Error updating drank bottle: ${err}`);
            }
        },
        removeDrankBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                // get the user drankHistory array
                const user = await User.findById(context.user._id).select('drankHistory');

                // find the entry in the drankHistory array
                let removedEntry = user.drankHistory.find(obj => obj._id.toString() === args._id);

                if (!removedEntry) throw new Error('No drank bottle found with this id!');

                // remove the drankBottle from the database 
                await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { drankHistory: { _id: args._id } } } 
                );

                return removedEntry; // return the removed entry
            } catch (err) {
                throw new Error(`Error removing bottle from drank history: ${err}`);
            }
        },

        addWishlistBottle: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id).select('wishlist');

                if(!user) throw new Error('No user found with this id!');

                // check if bottle is already in wishlist
                const exists = user.wishlist.some(obj => obj.bottle.toString() === args.bottle);

                if ( exists ) {
                    throw new Error('This bottle is already in your wishlist!');
                }

                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $push: { wishlist: args } },
                    { new: true, runValidators: true, select: 'wishlist' }
                ).populate({
                    path: 'wishlist.bottle',
                    populate: 'winery wineStyle'
                });

                return updatedUser.wishlist[updatedUser.wishlist.length - 1]; // return the last item
            } catch (err) {
                throw new Error(`Error adding to wishlist: ${err}`);
            }
        },
        updateWishlistBottle: async (parent, args , context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id, 'wishlist._id': args._id }, // find the user and the wishlist subdocument by _id
                    { $set: { 'wishlist.$.notes': args.notes } }, // update the notes field
                    { new: true, runValidators: true }
                ).populate({
                    path: 'wishlist.bottle',
                    populate: 'winery wineStyle'
                });

                if (!updatedUser) throw new Error('No wishlist bottle found with this id!');

                // return the updated wishlist entry
                return updatedUser.wishlist.find(obj => obj._id.toString() === args._id);
            } catch (err) {
                throw new Error(`Error updating wishlist notes: ${err}`);
            }
        },
        removeWishlistBottle: async (parent, args , context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const user = await User.findById(context.user._id).select('wishlist').populate({
                    path: 'wishlist.bottle',
                    populate: 'winery wineStyle'
                })

                const removedEntry = user.wishlist.find(obj => obj._id.toString() === args._id);

                if (!removedEntry) throw new Error('No wishlist entry found in wishlist with this id!');

                await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { wishlist: { _id: args._id } }
                });
                
                return removedEntry; // return the removed entry
            } catch (err) {
                throw new Error(`Error removing bottle from wishlist: ${err}`);
            }
        },

        addReview: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const newReview = await Review.create({ ...args, user: context.user._id });
                return await Review.findById(newReview._id)
                    .populate('user', 'username')
                    .populate({
                        path: 'bottle',
                        populate: 'winery wineStyle'
                    });
            } catch (err) {
                throw new Error(`Error adding review: ${err}`);
            }
        },
        updateReview: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const updatedFields = {};
                if (args.vintage) updatedFields.vintage = args.vintage;
                if (args.rating) updatedFields.rating = args.rating;
                if (args.content) updatedFields.content = args.content;
                if (args.isPublic !== undefined) updatedFields.isPublic = args.isPublic;

                if (!Object.keys(updatedFields).length) throw new Error('No fields to update!');

                const updatedReview = await Review.findOneAndUpdate(
                    { _id: args._id, user: context.user._id },
                    { $set: updatedFields },
                    { new: true, runValidators: true }
                );

                if (!updatedReview) throw new Error('No review found with this id!');
                return updatedReview;
            } catch (err) {
                throw new Error(`Error updating review: ${err}`);
            }
        },
        removeReview: async (parent, args, context) => {
            if (!context.user) throw new AuthenticationError("Not logged in");

            try {
                const removedReview = await Review.findOneAndDelete({ _id: args._id, user: context.user._id });

                if (!removedReview) throw new Error('No review found with this id!');
                return removedReview;
            } catch (err) {
                throw new Error(`Error removing review: ${err}`);
            }
        },
    },
};

export default resolvers;