import { Schema, model } from "mongoose";

const wineStyleSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    category: {
        type: String,
        required: true,
        enum: ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"],
    },
});

const WineStyle = model("WineStyle", wineStyleSchema);
export default WineStyle;