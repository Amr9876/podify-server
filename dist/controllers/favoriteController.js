"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsFavorite = exports.getFavorites = exports.toggleFavorite = void 0;
const audio_1 = __importDefault(require("../models/audio"));
const favorite_1 = __importDefault(require("../models/favorite"));
const mongoose_1 = require("mongoose");
const toggleFavorite = async (req, res) => {
    const { audioId } = req.query;
    let status;
    if (!(0, mongoose_1.isValidObjectId)(audioId))
        return res.status(422).json({ message: "Audio id is invalid!" });
    const audio = await audio_1.default.findById(audioId);
    if (!audio)
        return res.status(404).json({ message: "Resources not found" });
    const arleadyExists = await favorite_1.default.findOne({
        owner: req.user.id,
        items: audioId,
    });
    if (arleadyExists) {
        await favorite_1.default.updateOne({ owner: req.user.id }, { $pull: { items: audioId } });
        status = "removed";
    }
    else {
        const favorite = await favorite_1.default.findOne({ owner: req.user.id });
        if (favorite) {
            await favorite_1.default.updateOne({ owner: req.user.id }, {
                $addToSet: { items: audioId },
            });
        }
        else {
            await favorite_1.default.create({ owner: req.user.id, items: [audioId] });
        }
        status = "added";
    }
    if (status === "added") {
        await audio_1.default.findByIdAndUpdate(audioId, {
            $addToSet: { likes: req.user.id },
        });
    }
    if (status === "removed") {
        await audio_1.default.findByIdAndUpdate(audioId, {
            $pull: { likes: req.user.id },
        });
    }
    res.json({ status });
};
exports.toggleFavorite = toggleFavorite;
const getFavorites = async (req, res) => {
    const ownerId = req.user.id;
    const { limit = "20", pageNo = "0" } = req.query;
    const favorites = await favorite_1.default.aggregate([
        { $match: { owner: ownerId } },
        {
            $project: {
                audioIds: {
                    $slice: [
                        "$items",
                        parseInt(limit) * parseInt(pageNo),
                        parseInt(limit),
                    ],
                },
            },
        },
        { $unwind: "$audioIds" },
        {
            $lookup: {
                from: "audios",
                localField: "audioIds",
                foreignField: "_id",
                as: "audioInfo",
            },
        },
        { $unwind: "$audioInfo" },
        {
            $lookup: {
                from: "users",
                localField: "audioInfo.owner",
                foreignField: "_id",
                as: "ownerInfo",
            },
        },
        { $unwind: "$ownerInfo" },
        {
            $project: {
                _id: 0,
                id: "$audioInfo._id",
                title: "$audioInfo.title",
                about: "$audioInfo.about",
                category: "$audioInfo.category",
                file: "$audioInfo.file.url",
                poster: "$audioInfo.poster.url",
                owner: { name: "$ownerInfo.name", id: "$ownerInfo._id" },
            },
        },
    ]);
    res.json({ audios: favorites });
};
exports.getFavorites = getFavorites;
const getIsFavorite = async (req, res) => {
    const audioId = req.query.audioId;
    if (!(0, mongoose_1.isValidObjectId)(audioId))
        return res.status(422).json({ error: "Invalid audio id!" });
    const favorite = await favorite_1.default.findOne({
        owner: req.user.id,
        items: audioId,
    });
    res.json({ result: favorite ? true : false });
};
exports.getIsFavorite = getIsFavorite;
