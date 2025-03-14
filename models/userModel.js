import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
        type: String,
        required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    gender: {
        type: String,
    }
});

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    const { data } = await axios.get(`https://api.genderize.io?name=${this.name.split(' ')[0]}`);
    this.gender = data.gender;

    const menImgList = [
        'https://i.ibb.co/d2qRfFh/9434619.jpg',
        'https://i.ibb.co/GF5K0Zx/9439678.jpg',
        'https://i.ibb.co/LQvJbv1/27470334-7309681.jpg'
    ];
    const womenImgList = [
        'https://i.ibb.co/4fSJHhf/27470349-7309670.jpg',
        'https://i.ibb.co/KrCfzc3/27470336-7294793.jpg',
        'https://i.ibb.co/WHQPSRX/7309700.jpg'
    ];

    const randomNumber = Math.floor(Math.random() * 3);
    if (this.pic === 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg') {
        this.pic = this.gender === 'male' ? menImgList[randomNumber] : womenImgList[randomNumber];
    }
});

userSchema.methods.correctPassword = async function(passwordDB, typedPassword) {
    return await bcrypt.compare(typedPassword, passwordDB);
};

const User = mongoose.model('User', userSchema);
export default User;