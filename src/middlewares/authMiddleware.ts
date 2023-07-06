import { RequestHandler } from "express";
import PasswordResetToken from "#/models/passwordResetToken";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "#/utils/constants";
import User from "#/models/user";
import { formatProfile } from "#/utils/helper";

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetToken.findOne({ owner: userId });

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

export const mustAuth: RequestHandler = async (req, res, next) => {
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

  const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

  const id = payload.userId as string;

  const user = await User.findOne({ _id: id, tokens: token });

  if (!user) return res.status(403).json({ messsage: "Unauthorized request!" });

  req.user = formatProfile(user);
  req.token = token;

  next();
};

export const isVerified: RequestHandler = (req, res, next) => {
  if (!req.user.verified)
    return res.status(403).json({ error: "Please verify your email account!" });

  next();
};

export const isAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization?.split(" ")[1];

  if (token) {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const id = payload.userId as string;

    const user = await User.findOne({ _id: id, tokens: token });

    if (!user)
      return res.status(403).json({ messsage: "Unauthorized request!" });

    req.user = formatProfile(user);
    req.token = token;
  }

  next();
};
