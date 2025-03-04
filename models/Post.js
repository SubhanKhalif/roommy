import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    rent: { type: Number, required: true },
    authorName: { type: String, required: true },  // Added author name
    authorPic: { type: String, required: true }    // Added author profile picture
}, { timestamps: true });

export default mongoose.model("Post", PostSchema);
