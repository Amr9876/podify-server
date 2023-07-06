"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: Object,
        url: String,
        publicId: String,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    favorites: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Audio",
        },
    ],
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    followings: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    tokens: [String],
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await (0, bcrypt_1.hash)(this.password, 10);
    }
    next();
});
userSchema.methods.comparePassword = async function (password) {
    const result = await (0, bcrypt_1.compare)(password, this.password);
    return result;
};
exports.default = (0, mongoose_1.model)("User", userSchema);
