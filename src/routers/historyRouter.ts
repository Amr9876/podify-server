import {
  updateHistory,
  removeHistory,
  getHistories,
  getRecentlyPlayed,
} from "#/controllers/historyController";
import { mustAuth } from "#/middlewares/authMiddleware";
import { validate } from "#/middlewares/validator";
import { UpdateHistorySchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post("/", mustAuth, validate(UpdateHistorySchema), updateHistory);
router.delete("/", mustAuth, removeHistory);
router.get("/", mustAuth, getHistories);
router.get("/recently-played", mustAuth, getRecentlyPlayed);

export default router;
