import multer from "multer";
import path from "path";
import Post from "../models/Post.js";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get file extension
    const fileName = `${Date.now()}-${file.originalname}`; // Unique filename
    cb(null, fileName);
  }
});

// File filter to allow only images/videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

export const upload = multer({ storage, fileFilter });

// Create a new post with media upload
export const createPost = [
  upload.single("media"),
  async (req, res) => {
    try {
      const { title, location, rent, description } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Handle media file if uploaded
      const mediaUrl = req.file 
        ? `${process.env.API_URL || "http://localhost:4000"}/uploads/${req.file.filename}`
        : null;

      const post = await Post.create({
        title,
        location,
        rent,
        description,
        media: mediaUrl,
        user: req.user._id,
        authorName: req.user.name,
        authorPic: req.user.pic
      });

      res.status(201).json({
        status: 'success',
        data: {
          post
        }
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ 
        status: 'error',
        message: error.message || "Server error" 
      });
    }
  }
];

// Fetch all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "name email pic location");
        res.status(200).json({
            status: 'success',
            data: {
                posts
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ 
            status: 'error',
            message: error.message || "Server error" 
        });
    }
};

// Update an existing post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPost = await Post.findOneAndUpdate(
            { _id: id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedPost) {
            return res.status(404).json({ 
                status: 'fail',
                message: "Post not found or unauthorized" 
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                post: updatedPost
            }
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ 
            status: 'error',
            message: error.message || "Server error" 
        });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await Post.findOneAndDelete({ _id: id, user: req.user._id });
        
        if (!deletedPost) {
            return res.status(404).json({ 
                status: 'fail',
                message: "Post not found or unauthorized" 
            });
        }
        res.status(200).json({
            status: 'success',
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ 
            status: 'error',
            message: error.message || "Server error" 
        });
    }
};

// Fetch posts created by a specific user
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if userId is valid
        if (!userId) {
            return res.status(400).json({ 
                status: 'fail', 
                message: "User ID is required" 
            });
        }

        const posts = await Post.find({ user: userId }).populate("user", "name email pic location");

        res.status(200).json({
            status: 'success',
            data: { posts }
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message || "Server error" 
        });
    }
};
