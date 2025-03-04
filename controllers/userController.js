import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Chat from '../models/chatModel.js';
import multer from 'multer';

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/user');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload images only', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

export const uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  return Object.keys(obj).reduce((newObj, el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
    return newObj;
  }, {});
};

export const getUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = catchAsync(async (req, res) => {
  const keyword = req.query.search 
    ? { $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]} 
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
});

export const UpdateMe = catchAsync(async (req, res, next) => {
  if (!req.body.name || !req.body.email) {
    return next(new AppError('Empty fields are not allowed', 400));
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

export const UploadPhoto = catchAsync(async (req, res, next) => {
  const data = req.file?.filename;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { pic: data },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// export const AvailableUsersToCreateGroup = catchAsync(async (req, res) => {
//   // Implementation here
// });