import models from "../models/index.js";
import db from "../config/connection.js";

export default async (modelName, collectionName) => {
    try {
        let modelExists = await models[modelName].db.db.listCollections({ name: collectionName }).toArray();
        if(modelExists.length) {
            await db.dropCollection(collectionName);
            console.log(`${collectionName} collection dropped!`);
        }
    } catch (error) {
        throw error;
    }
};