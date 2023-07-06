"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestUploads = exports.updateAudio = exports.createAudio = void 0;
const cloud_1 = __importDefault(require("../cloud"));
const audio_1 = __importDefault(require("../models/audio"));
const createAudio = async (req, res) => {
    const { title, about, category } = req.body;
    const poster = req.files?.poster;
    const audioFile = req.files?.file;
    const ownerId = req.user.id;
    if (!audioFile)
        return res.status(422).json({ message: "Audio file is missing!" });
    const audioRes = await cloud_1.default.uploader.upload(audioFile.filepath, {
        resource_type: "video",
    });
    const newAudio = new audio_1.default({
        title,
        about,
        category,
        owner: ownerId,
        file: { url: audioRes.secure_url, publicId: audioRes.public_id },
    });
    if (poster) {
        const posterRes = await cloud_1.default.uploader.upload(poster.filepath, {
            width: 300,
            height: 300,
            crop: "thumb",
            gravity: "face",
        });
        newAudio.poster = {
            url: posterRes.secure_url,
            publicId: posterRes.public_id,
        };
    }
    await newAudio.save();
    res.status(201).json({
        audio: {
            id: newAudio._id.toString(),
            title,
            about,
            category,
            file: newAudio.file.url,
            poster: newAudio.poster?.url,
        },
    });
};
exports.createAudio = createAudio;
const updateAudio = async (req, res) => {
    const { title, about, category } = req.body;
    const poster = req.files?.poster;
    const ownerId = req.user.id;
    const { audioId } = req.params;
    if (!audioId)
        return res.status(404).json({ message: "Audio Id was not found" });
    const audio = await audio_1.default.findOneAndUpdate({ owner: ownerId, _id: audioId }, { title, about, category }, { new: true });
    if (!audio)
        return res.status(404).json({ message: "Audio was not found" });
    if (poster) {
        if (audio.poster?.publicId) {
            await cloud_1.default.uploader.destroy(audio.poster?.publicId);
        }
        const posterRes = await cloud_1.default.uploader.upload(poster.filepath, {
            width: 300,
            height: 300,
            crop: "thumb",
            gravity: "face",
        });
        audio.poster = { url: posterRes.secure_url, publicId: posterRes.public_id };
        await audio.save();
    }
    res.status(201).json({
        audio: {
            id: audio._id.toString(),
            title,
            about,
            category,
            file: audio.file.url,
            poster: audio.poster?.url,
        },
    });
};
exports.updateAudio = updateAudio;
const getLatestUploads = async (req, res) => {
    const list = await audio_1.default.find()
        .sort("-createdAt")
        .limit(10)
        .populate("owner");
    const audios = list.map((item) => ({
        id: item._id,
        title: item.title,
        about: item.about,
        category: item.category,
        file: item.file.url,
        poster: item.poster?.url,
        owner: { name: item.owner.name, id: item.owner._id },
    }));
    res.json({ audios });
};
exports.getLatestUploads = getLatestUploads;
