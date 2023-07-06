"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudios = exports.getPlaylistByProfile = exports.removePlaylist = exports.updatePlaylist = exports.createPlaylist = void 0;
const audio_1 = __importDefault(require("../models/audio"));
const playlist_1 = __importDefault(require("../models/playlist"));
const mongoose_1 = require("mongoose");
const createPlaylist = async (req, res) => {
    const { title, resId, visibility } = req.body;
    const ownerId = req.user.id;
    if (resId) {
        const audio = await audio_1.default.findById(resId);
        if (!audio)
            return res.status(404).json({ message: "Audio not found!" });
    }
    const newPlaylist = new playlist_1.default({ title, visibility, owner: ownerId });
    if (resId)
        newPlaylist.items = [resId];
    await newPlaylist.save();
    res.status(201).json({
        playlist: {
            id: newPlaylist._id,
            title: newPlaylist.title,
            visibility: newPlaylist.visibility,
        },
    });
};
exports.createPlaylist = createPlaylist;
const updatePlaylist = async (req, res) => {
    const { id, item, title, visibility } = req.body;
    const playlist = await playlist_1.default.findOneAndUpdate({ _id: id, owner: req.user.id }, { title, visibility }, { new: true });
    if (!playlist)
        return res.status(404).json({ message: "Playlist was not found" });
    if (item) {
        const audio = await audio_1.default.findById(item);
        if (!audio)
            return res.status(404).json({ message: "Playlist was not found" });
        await playlist_1.default.findByIdAndUpdate(playlist._id, {
            $addToSet: { items: item },
        });
    }
    res.status(201).json({
        playlist: {
            id: playlist._id,
            title: playlist.title,
            visibility: playlist.visibility,
        },
    });
};
exports.updatePlaylist = updatePlaylist;
const removePlaylist = async (req, res) => {
    const { playlistId, resId, all } = req.query;
    if (!(0, mongoose_1.isValidObjectId)(playlistId))
        return res.status(422).json({ message: "Invalid playlist id!" });
    if (all === "yes") {
        const playlist = await playlist_1.default.findOneAndDelete({
            _id: playlistId,
            owner: req.user.id,
        });
        if (!playlist)
            return res.status(404).json({ message: "Playlist not found" });
    }
    if (resId) {
        if (!(0, mongoose_1.isValidObjectId)(resId))
            return res.status(422).json({ message: "Invalid audio id!" });
        const playlist = await playlist_1.default.findOneAndUpdate({
            _id: playlistId,
            owner: req.user.id,
        }, {
            $pull: { items: resId },
        });
        if (!playlist)
            return res.status(404).json({ message: "Playlist not found" });
    }
    res.json({ success: true });
};
exports.removePlaylist = removePlaylist;
const getPlaylistByProfile = async (req, res) => {
    const { pageNo = "0", limit = "20" } = req.query;
    const data = await playlist_1.default.find({
        owner: req.user.id,
        visibility: { $ne: "auto" },
    })
        .skip(parseInt(pageNo) * parseInt(limit))
        .limit(parseInt(limit))
        .sort("-createdAt");
    const playlist = data.map((item) => {
        return {
            id: item._id,
            title: item.title,
            itemsCount: item.items.length,
            visibility: item.visibility,
        };
    });
    res.json({ playlist });
};
exports.getPlaylistByProfile = getPlaylistByProfile;
const getAudios = async (req, res) => {
    const { playlistId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(playlistId))
        return res.status(422).json({ message: "Invalid playlist id!" });
    const playlist = await playlist_1.default.findOne({
        owner: req.user.id,
        _id: playlistId,
    }).populate({
        path: "items",
        populate: {
            path: "owner",
            select: "name",
        },
    });
    if (!playlist)
        return res.json({ list: [] });
    const audios = playlist.items.map((item) => {
        return {
            id: item._id,
            title: item.title,
            category: item.category,
            file: item.file.url,
            poster: item.poster?.url,
            owner: { name: item.owner.name, id: item.owner._id },
        };
    });
    res.json({
        list: {
            id: playlist._id,
            title: playlist.title,
            audios,
        },
    });
};
exports.getAudios = getAudios;
