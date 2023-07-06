"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const passwordResetTokenSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now(),
    },
});
passwordResetTokenSchema.pre("save", async function (next) {
    if (this.isModified("token")) {
        this.token = await (0, bcrypt_1.hash)(this.token, 10);
    }
    next();
});
passwordResetTokenSchema.methods.compareToken = async function (token) {
    const result = await (0, bcrypt_1.compare)(token, this.token);
    return result;
};
exports.default = (0, mongoose_1.model)("PasswordResetToken", passwordResetTokenSchema);
