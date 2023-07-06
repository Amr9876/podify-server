import {
  getFavorites,
  toggleFavorite,
  getIsFavorite,
} from "#/controllers/favoriteController";
import { isVerified, mustAuth } from "#/middlewares/authMiddleware";
import { Router } from "express";

const router = Router();

router.post("/", mustAuth, isVerified, toggleFavorite);
router.get("/", mustAuth, getFavorites);
router.get("/is-fav", mustAuth, getIsFavorite);

export default router;
