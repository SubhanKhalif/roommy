import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    rent: { type: Number, required: true },
    media: { type: String, default: null },  // Media URL (image/video)
    authorName: { type: String, required: true, trim: true },
    authorPic: { type: String, required: true, trim: true }
}, { timestamps: true });

export default mongoose.model("Post", PostSchema);
