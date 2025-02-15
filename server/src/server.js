import express from 'express';
import path from 'node:path';
import db from './config/connection.js';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './utils/auth.js';

const __dirname = path.resolve();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    // enable introspection for dev environment (disabled by default in v4.11)
    introspection: process.env.NODE_ENV !== 'production',
});

const startApolloServer = async () => {
    // start apollo server
    await server.start();

    // connect to database
    await db();

    const PORT = process.env.PORT || 3001;
    const app = express();

    // middleware
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // apollo server middleware
    app.use('/graphql', expressMiddleware(server,
        { context: authenticateToken}
    ));

    // serve static assets in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        });
    }

    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
        console.log(`GraphQL server ready at http://localhost:${PORT}/graphql`);
    });
}

startApolloServer();
