import express from "express";
import { 
    createPost, 
    getAllPosts, 
    updatePost, 
    deletePost,
    getUserPosts 
} from "../controllers/postController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// Create a new post
router.post("/create", protect, createPost);

// Fetch all posts
router.get("/", getAllPosts);

// Update a post
router.put("/:id", protect, updatePost);

// Delete a post
router.delete("/:id", protect, deletePost);

// Fetch posts by a specific user
router.get("/:userId", protect, getUserPosts);

export default router;
