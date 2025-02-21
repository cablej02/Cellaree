import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        bottleId: {
            type: Schema.Types.ObjectId,
            ref: "Bottle",
            required: true,
            index: true,
        },
        vintage: {
            type: Number,
            min: 1800,
            max: new Date().getFullYear() + 1
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        content: {
            type: String,
            trim: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Review = model("Review", reviewSchema);
export default Review;