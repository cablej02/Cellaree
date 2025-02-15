import { User } from '../models/index.js';
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