import User from "#/models/user";
import { CreateUser, VerifyEmailRequest } from "#/@types/userTypes";
import { RequestHandler } from "express";
import { formatProfile, generateToken } from "#/utils/helper";
import {
  sendForgetPasswordLink,
  sendPassResetSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import EmailVerficationToken from "#/models/emailVerficationToken";
import PasswordResetToken from "#/models/passwordResetToken";
import { isValidObjectId } from "mongoose";
import crypto from "crypto";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "#/utils/constants";
import jwt from "jsonwebtoken";
import { RequestWithFiles } from "#/middlewares/fileParser";
import cloudinary from "#/cloud";
import formidable from "formidable";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists)
    return res.status(403).json({ message: "Email is arleady in use!" });

  const user = await User.create({ name, email, password });

  const token = generateToken();

  await EmailVerficationToken.create({
    owner: user._id.toString(),
    token,
  });

  await sendVerificationMail(token, {
    name,
    email,
  });

  res.status(201).json({ user: { id: user._id.toString(), email, name } });
};

export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { token, userId } = req.body;

  console.log({ token, userId });

  const verificationToken = await EmailVerficationToken.findOne({
    owner: userId,
  });

  if (!verificationToken)
    return res.status(403).json({ error: "Invalid token!!" });

  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "Invalid Token!" });

  await User.findByIdAndUpdate(userId, { verified: true });

  await EmailVerficationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: "Your email is verified." });
};

export const sendReVerificationEmail: RequestHandler = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ message: "Invalid Request" });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ message: "Invalid Request" });

  if (user.verified)
    return res.status(422).json({ message: "You are arleady verified!" });

  await EmailVerficationToken.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();

  await EmailVerficationToken.create({
    owner: userId,
    token,
  });

  await sendVerificationMail(token, {
    name: user.name,
    email: user.email,
  });

  res.json({ message: "Please check you're mail!" });
};

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(403).json({ message: "Invalid Request" });

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "Account not found!" });

  await PasswordResetToken.findOneAndDelete({
    owner: user._id.toString(),
  });

  const token = crypto.randomBytes(36).toString("hex");

  await PasswordResetToken.create({
    owner: user._id.toString(),
    token,
  });

  const resetLink =
    window.location.origin +
    `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id.toString()}`;

  await sendForgetPasswordLink({ email, link: resetLink });

  res.json({ message: "Check your mail box" });
};

export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Unauthorized access!" });

  const matched = await user.comparePassword(password);
  if (matched)
    return res
      .status(422)
      .json({ error: "The new password must be different!" });

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id.toString() });

  await sendPassResetSuccessEmail(user.name, user.email);

  res.json({ message: "Password resets successfully." });
};

export const signIn: RequestHandler = async (req, res) => {
  const { password, email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(403).json({ error: "Email/Password mismatch!" });

  const matched = await user.comparePassword(password);

  if (!matched)
    return res.status(403).json({ error: "Email/Password mismatch!" });

  const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET);

  user.tokens.push(token);

  await user.save();

  res.json({
    profile: formatProfile(user),
    token,
  });
};

export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;
  const avatar = req.files?.avatar as formidable.File;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("Something went wrong, User not found");

  if (typeof name !== "string")
    return res.status(422).json({ error: "Invalid name" });

  if (name.trim().length < 3)
    return res
      .status(422)
      .json({ error: "Name must be more than 3 characters" });

  user.name = name;

  if (avatar) {
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      }
    );

    user.avatar = {
      url: secure_url,
      publicId: public_id,
    };
  }

  await user.save();

  res.json({ profile: formatProfile(user) });
};

export const logOut: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;

  const token = req.token;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("Something went wrong, user not found!");

  if (fromAll === "yes") user.tokens = [];
  else user.tokens = user.tokens.filter((t) => t !== token);

  await user.save();

  res.json({ success: true });
};
