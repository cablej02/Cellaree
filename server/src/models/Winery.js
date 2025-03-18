import { Schema, model } from 'mongoose';
import { normalizeText } from '../../../shared/utils/formatting.js';

const winerySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: false,
            trim: true,
        },
        name_normalized: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
    },
    { timestamps: true }
);

winerySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.name_normalized = normalizeText(this.name);
    }
    next();
});

winerySchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();

    if (update.name) update.name_normalized = normalizeText(update.name);
    if (update.$set?.name) update.$set.name_normalized = normalizeText(update.$set.name);

    next();
});

const Winery = model('Winery', winerySchema);
export default Winery;