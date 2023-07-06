"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favoriteController_1 = require("../controllers/favoriteController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.mustAuth, authMiddleware_1.isVerified, favoriteController_1.toggleFavorite);
router.get("/", authMiddleware_1.mustAuth, favoriteController_1.getFavorites);
router.get("/is-fav", authMiddleware_1.mustAuth, favoriteController_1.getIsFavorite);
exports.default = router;
