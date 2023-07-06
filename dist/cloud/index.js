"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: constants_1.CLOUD_NAME,
    api_key: constants_1.CLOUD_KEY,
    api_secret: constants_1.CLOUD_SECRET,
    secure: true,
});
exports.default = cloudinary_1.v2;
