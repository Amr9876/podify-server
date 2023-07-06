import { PopulateFavList } from "#/@types/audioTypes";
import cloudinary from "#/cloud";
import { RequestWithFiles } from "#/middlewares/fileParser";
import Audio from "#/models/audio";
import { categoriesTypes } from "#/utils/audio_category";
import { RequestHandler } from "express";
import formidable from "formidable";

interface CreateAndUpdateAudioRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    category: categoriesTypes;
  };
}

export const createAudio: RequestHandler = async (
  req: CreateAndUpdateAudioRequest,
  res
) => {
  const { title, about, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const audioFile = req.files?.file as formidable.File;
  const ownerId = req.user.id;

  if (!audioFile)
    return res.status(422).json({ message: "Audio file is missing!" });

  const audioRes = await cloudinary.uploader.upload(audioFile.filepath, {
    resource_type: "video",
  });

  const newAudio = new Audio({
    title,
    about,
    category,
    owner: ownerId,
    file: { url: audioRes.secure_url, publicId: audioRes.public_id },
  });

  if (poster) {
    const posterRes = await cloudinary.uploader.upload(poster.filepath, {
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

export const updateAudio: RequestHandler = async (
  req: CreateAndUpdateAudioRequest,
  res
) => {
  const { title, about, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const ownerId = req.user.id;
  const { audioId } = req.params;

  if (!audioId)
    return res.status(404).json({ message: "Audio Id was not found" });

  const audio = await Audio.findOneAndUpdate(
    { owner: ownerId, _id: audioId },
    { title, about, category },
    { new: true }
  );

  if (!audio) return res.status(404).json({ message: "Audio was not found" });

  if (poster) {
    if (audio.poster?.publicId) {
      await cloudinary.uploader.destroy(audio.poster?.publicId);
    }

    const posterRes = await cloudinary.uploader.upload(poster.filepath, {
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

export const getLatestUploads: RequestHandler = async (req, res) => {
  const list = await Audio.find()
    .sort("-createdAt")
    .limit(10)
    .populate<PopulateFavList>("owner");

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
