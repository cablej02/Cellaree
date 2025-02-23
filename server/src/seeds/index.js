import db from "../config/connection.js";
import { User, Bottle, Winery, WineStyle, UserBottle, DrankBottle, Review } from "../models/index.js";

// import seed data
import wineStyleData from './wineStyleData.json' assert { type: "json" };

const seed = async () => {
    try {
        // connect to the database
        await db();

        // parallel delete operations
        console.log("Deleting all documents from collections...");
        await Promise.all([
            Winery.deleteMany({}),
            WineStyle.deleteMany({}),
            Bottle.deleteMany({}),
            User.deleteMany({}),
            UserBottle.deleteMany({}),
            DrankBottle.deleteMany({}),
            Review.deleteMany({})
        ])
        console.log("Deleted all documents from collections");

        console.log("Seeding wine styles...");
        await WineStyle.insertMany(wineStyleData);
        console.log("Wine styles seeded");

        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:",error);
        process.exit(1);
    }
};

seed();