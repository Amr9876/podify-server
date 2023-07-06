"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = exports.isVerified = exports.mustAuth = exports.isValidPassResetToken = void 0;
const passwordResetToken_1 = __importDefault(require("../models/passwordResetToken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../utils/constants");
const user_1 = __importDefault(require("../models/user"));
const helper_1 = require("../utils/helper");
const isValidPassResetToken = async (req, res, next) => {
    const { token, userId } = req.body;
    const resetToken = await passwordResetToken_1.default.findOne({ owner: userId });
    if (!resetToken)
        return res
            .status(403)
            .json({ error: "Unauthorized access, invalid token!" });
    const matched = await resetToken.compareToken(token);
    if (!matched)
        return res
            .status(403)
            .json({ error: "Unauthorized access, invalid token!" });
    next();
};
exports.isValidPassResetToken = isValidPassResetToken;
const mustAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization)
        return res
            .status(403)
            .json({ messsage: "Authorization bearer token is required" });
    const token = authorization.split(" ")[1];
    if (!token)
        return res
            .status(403)
            .json({ messsage: "Authorization bearer token is required" });
    const payload = jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
    const id = payload.userId;
    const user = await user_1.default.findOne({ _id: id, tokens: token });
    if (!user)
        return res.status(403).json({ messsage: "Unauthorized request!" });
    req.user = (0, helper_1.formatProfile)(user);
    req.token = token;
    next();
};
exports.mustAuth = mustAuth;
const isVerified = (req, res, next) => {
    if (!req.user.verified)
        return res.status(403).json({ error: "Please verify your email account!" });
    next();
};
exports.isVerified = isVerified;
const isAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    const token = authorization?.split(" ")[1];
    if (token) {
        const payload = jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
        const id = payload.userId;
        const user = await user_1.default.findOne({ _id: id, tokens: token });
        if (!user)
            return res.status(403).json({ messsage: "Unauthorized request!" });
        req.user = (0, helper_1.formatProfile)(user);
        req.token = token;
    }
    next();
};
exports.isAuth = isAuth;
