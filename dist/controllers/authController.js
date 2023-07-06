"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOut = exports.updateProfile = exports.signIn = exports.updatePassword = exports.grantValid = exports.generateForgetPasswordLink = exports.sendReVerificationEmail = exports.verifyEmail = exports.create = void 0;
const user_1 = __importDefault(require("../models/user"));
const helper_1 = require("../utils/helper");
const mail_1 = require("../utils/mail");
const emailVerficationToken_1 = __importDefault(require("../models/emailVerficationToken"));
const passwordResetToken_1 = __importDefault(require("../models/passwordResetToken"));
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("../utils/constants");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloud_1 = __importDefault(require("../cloud"));
const create = async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await user_1.default.findOne({ email });
    if (userExists)
        return res.status(403).json({ message: "Email is arleady in use!" });
    const user = await user_1.default.create({ name, email, password });
    const token = (0, helper_1.generateToken)();
    await emailVerficationToken_1.default.create({
        owner: user._id.toString(),
        token,
    });
    await (0, mail_1.sendVerificationMail)(token, {
        name,
        email,
    });
    res.status(201).json({ user: { id: user._id.toString(), email, name } });
};
exports.create = create;
const verifyEmail = async (req, res) => {
    const { token, userId } = req.body;
    console.log({ token, userId });
    const verificationToken = await emailVerficationToken_1.default.findOne({
        owner: userId,
    });
    if (!verificationToken)
        return res.status(403).json({ error: "Invalid token!!" });
    const matched = await verificationToken.compareToken(token);
    if (!matched)
        return res.status(403).json({ error: "Invalid Token!" });
    await user_1.default.findByIdAndUpdate(userId, { verified: true });
    await emailVerficationToken_1.default.findByIdAndDelete(verificationToken._id);
    res.json({ message: "Your email is verified." });
};
exports.verifyEmail = verifyEmail;
const sendReVerificationEmail = async (req, res) => {
    const { userId } = req.body;
    if (!(0, mongoose_1.isValidObjectId)(userId))
        return res.status(403).json({ message: "Invalid Request" });
    const user = await user_1.default.findById(userId);
    if (!user)
        return res.status(403).json({ message: "Invalid Request" });
    if (user.verified)
        return res.status(422).json({ message: "You are arleady verified!" });
    await emailVerficationToken_1.default.findOneAndDelete({
        owner: userId,
    });
    const token = (0, helper_1.generateToken)();
    await emailVerficationToken_1.default.create({
        owner: userId,
        token,
    });
    (0, mail_1.sendVerificationMail)(token, {
        name: user.name,
        email: user.email,
    });
    res.json({ message: "Please check you're mail!" });
};
exports.sendReVerificationEmail = sendReVerificationEmail;
const generateForgetPasswordLink = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(403).json({ message: "Invalid Request" });
    const user = await user_1.default.findOne({ email });
    if (!user)
        return res.status(404).json({ error: "Account not found!" });
    await passwordResetToken_1.default.findOneAndDelete({
        owner: user._id.toString(),
    });
    const token = crypto_1.default.randomBytes(36).toString("hex");
    await passwordResetToken_1.default.create({
        owner: user._id.toString(),
        token,
    });
    const resetLink = window.location.origin +
        `${constants_1.PASSWORD_RESET_LINK}?token=${token}&userId=${user._id.toString()}`;
    (0, mail_1.sendForgetPasswordLink)({ email, link: resetLink });
    res.json({ message: "Check your mail box" });
};
exports.generateForgetPasswordLink = generateForgetPasswordLink;
const grantValid = async (req, res) => {
    res.json({ valid: true });
};
exports.grantValid = grantValid;
const updatePassword = async (req, res) => {
    const { password, userId } = req.body;
    const user = await user_1.default.findById(userId);
    if (!user)
        return res.status(403).json({ error: "Unauthorized access!" });
    const matched = await user.comparePassword(password);
    if (matched)
        return res
            .status(422)
            .json({ error: "The new password must be different!" });
    user.password = password;
    await user.save();
    await passwordResetToken_1.default.findOneAndDelete({ owner: user._id.toString() });
    (0, mail_1.sendPassResetSuccessEmail)(user.name, user.email);
    res.json({ message: "Password resets successfully." });
};
exports.updatePassword = updatePassword;
const signIn = async (req, res) => {
    const { password, email } = req.body;
    const user = await user_1.default.findOne({ email });
    if (!user)
        return res.status(403).json({ error: "Email/Password mismatch!" });
    const matched = await user.comparePassword(password);
    if (!matched)
        return res.status(403).json({ error: "Email/Password mismatch!" });
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, constants_1.JWT_SECRET);
    user.tokens.push(token);
    await user.save();
    res.json({
        profile: (0, helper_1.formatProfile)(user),
        token,
    });
};
exports.signIn = signIn;
const updateProfile = async (req, res) => {
    const { name } = req.body;
    const avatar = req.files?.avatar;
    const user = await user_1.default.findById(req.user.id);
    if (!user)
        throw new Error("Something went wrong, User not found");
    if (typeof name !== "string")
        return res.status(422).json({ error: "Invalid name" });
    if (name.trim().length < 3)
        return res
            .status(422)
            .json({ error: "Name must be more than 3 characters" });
    user.name = name;
    if (avatar) {
        if (user.avatar?.publicId) {
            await cloud_1.default.uploader.destroy(user.avatar.publicId);
        }
        const { secure_url, public_id } = await cloud_1.default.uploader.upload(avatar.filepath, {
            width: 300,
            height: 300,
            crop: "thumb",
            gravity: "face",
        });
        user.avatar = {
            url: secure_url,
            publicId: public_id,
        };
    }
    await user.save();
    res.json({ profile: (0, helper_1.formatProfile)(user) });
};
exports.updateProfile = updateProfile;
const logOut = async (req, res) => {
    const { fromAll } = req.query;
    const token = req.token;
    const user = await user_1.default.findById(req.user.id);
    if (!user)
        throw new Error("Something went wrong, user not found!");
    if (fromAll === "yes")
        user.tokens = [];
    else
        user.tokens = user.tokens.filter((t) => t !== token);
    await user.save();
    res.json({ success: true });
};
exports.logOut = logOut;
