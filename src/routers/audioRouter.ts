import {
  createAudio,
  getLatestUploads,
  updateAudio,
} from "#/controllers/audioController";
import { isVerified, mustAuth } from "#/middlewares/authMiddleware";
import fileParser from "#/middlewares/fileParser";
import { validate } from "#/middlewares/validator";
import { AudioValidationSchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  mustAuth,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  createAudio
);

router.patch(
  "/:audioId",
  mustAuth,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  updateAudio
);

router.get("/latest", getLatestUploads);

export default router;
