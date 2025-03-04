import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { promisify } from "util";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../config.env') });

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWTSECRET, { expiresIn: process.env.JWTEXPIRES });
};

export const signup = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmEmail: req.body.confirmEmail,
        pic: req.body.pic
    });

    const token = signToken(user._id);
    res.cookie('jwt', token, {
        httpOnly: false,
        expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
        status: 'success',
        token,
        data: user
    });
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(user.password, password))) {
        return next(new AppError('Incorrect email or password', 400));
    }

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

export const isUserPresent = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        return next(new AppError('User not found. Create one', 400));
    }

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

export const protect = catchAsync(async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("You are not logged in. Please log in to get access", 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
        return next(new AppError("The user belonging to this token no longer exists", 401));
    }

    req.user = freshUser;
    next();
});

export const send = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        user: req.user
    });
});

export const downloadFile = catchAsync(async (req, res, next) => {
    const filePath = path.join(__dirname, '..', 'application', 'psiphon3.exe');
    res.download(filePath, 'psiphon3.exe');
});
