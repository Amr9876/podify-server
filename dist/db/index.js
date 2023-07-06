"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../utils/constants");
mongoose_1.default.set("strictQuery", true);
mongoose_1.default
    .connect(constants_1.MONGO_URI, { dbName: "podify" })
    .then(() => console.log("Database Connected 🔥"))
    .catch((error) => console.log(error));
