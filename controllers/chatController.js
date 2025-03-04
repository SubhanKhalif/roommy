import Chat from '../models/chatModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import { ObjectId } from 'mongodb';

export const acessChat = catchAsync(async (req, res, next) => {
    const { userId } = req.body;
    const objectId = req.user._id;
    const stringId = objectId.toString();
    req.user._id = stringId;

    if (!userId) {
        return next(new AppError("Something went wrong", 400));
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate('users', '-password').populate('latestMessage');

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email'
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).json(FullChat);
        } catch (err) {
            next(new AppError("Something went wrong", 400));
        }
    }
});

export const fetchChats = catchAsync(async (req, res, next) => {
    try {
        const data = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', "-password")
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        const populatedData = await User.populate(data, {
            path: 'latestMessage.sender',
            select: "name pic email"
        });

        res.status(200).json({
            status: 'success',
            data: populatedData
        });
    } catch (err) {
        next(new AppError("Something went wrong", 400));
    }
});

export const createGroupChat = catchAsync(async (req, res, next) => {
    if (!req.body.users || !req.body.name) {
        return next(new AppError('Please Fill all the fields', 400));
    }

    const users = JSON.parse(req.body.users);
    if (users.length < 2) {
        return next(new AppError("Group should require at least 3 users", 400));
    }
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fgroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).json({
            status: 'success',
            fgroupChat
        });
    } catch (error) {
        next(new AppError(error, 400));
    }
});

export const renameGroup = catchAsync(async (req, res, next) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    ).populate('users', '-password').populate('groupAdmin', '-password');

    if (!updatedChat) {
        return next(new AppError("Something went wrong", 400));
    }

    res.status(200).json({
        status: 'success',
        updatedChat
    });
});

export const AddPersonGroup = catchAsync(async (req, res, next) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    ).populate('users', '-password').populate('groupAdmin', '-password');

    if (!added) {
        return next(new AppError("User not added", 400));
    }

    res.status(200).json({
        status: 'success',
        added
    });
});

export const RemovePersonGroup = catchAsync(async (req, res, next) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    ).populate('users', '-password').populate('groupAdmin', '-password');

    if (!removed) {
        return next(new AppError("User not added", 400));
    }

    res.status(200).json({
        status: 'success',
        removed
    });
});

export const DeleteChat = catchAsync(async (req, res, next) => {
    const { chatId } = req.body;
    const user = await Chat.findByIdAndDelete(chatId);

    res.status(204).json({
        status: 'success',
        user
    });
});