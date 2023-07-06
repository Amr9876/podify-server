import { Router } from "express";
import { validate } from "#/middlewares/validator";
import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndIDValidation,
  UpdatePasswordSchema,
} from "#/utils/validationSchema";
import {
  create,
  verifyEmail,
  sendReVerificationEmail,
  generateForgetPasswordLink,
  grantValid,
  updatePassword,
  signIn,
  updateProfile,
  logOut,
} from "#/controllers/authController";
import { isValidPassResetToken, mustAuth } from "#/middlewares/authMiddleware";
import fileParser from "#/middlewares/fileParser";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationEmail);
router.post("/forget-password", generateForgetPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIDValidation),
  isValidPassResetToken,
  grantValid
);
router.post(
  "/update-password",
  validate(UpdatePasswordSchema),
  isValidPassResetToken,
  updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signIn);
router.get("/is-auth", mustAuth, (req, res) => res.json({ profile: req.user }));
router.post("/update-profile", mustAuth, fileParser, updateProfile);
router.post("/log-out", mustAuth, logOut);

export default router;
