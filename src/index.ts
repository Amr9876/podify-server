import "dotenv/config";
import "express-async-errors";
import "./db";
import "./utils/schedule";
import express from "express";
import authRouter from "./routers/authRouter";
import audioRouter from "./routers/audioRouter";
import favoriteRouter from "./routers/favoriteRouter";
import playlistRouter from "./routers/playlistRouter";
import profileRouter from "./routers/profileRouter";
import historyRouter from "./routers/historyRouter";
import { errorHandler } from "./middlewares/errorMiddleware";

const app = express();
const PORT = process.env.PORT || 8989;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use("/history", historyRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server has started on port ${PORT}`));
