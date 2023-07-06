"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formidable_1 = __importDefault(require("formidable"));
const fileParser = (req, res, next) => {
    if (!req.headers["content-type"]?.startsWith("multipart/form-data;"))
        return res.status(422).json({ message: "content type must be form-data!" });
    const form = (0, formidable_1.default)({ multiples: false });
    form.parse(req, (err, fields, files) => {
        if (err)
            return next(err);
        req.body = fields;
        req.files = files;
        next();
    });
};
exports.default = fileParser;
