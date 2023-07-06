"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audioController_1 = require("../controllers/audioController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileParser_1 = __importDefault(require("../middlewares/fileParser"));
const validator_1 = require("../middlewares/validator");
const validationSchema_1 = require("../utils/validationSchema");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/create", authMiddleware_1.mustAuth, authMiddleware_1.isVerified, fileParser_1.default, (0, validator_1.validate)(validationSchema_1.AudioValidationSchema), audioController_1.createAudio);
router.patch("/:audioId", authMiddleware_1.mustAuth, authMiddleware_1.isVerified, fileParser_1.default, (0, validator_1.validate)(validationSchema_1.AudioValidationSchema), audioController_1.updateAudio);
router.get("/latest", audioController_1.getLatestUploads);
exports.default = router;
