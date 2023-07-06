import mongoose from "mongoose";
import { MONGO_URI } from "#/utils/constants";

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGO_URI, { dbName: "podify" })
  .then(() => console.log("Database Connected 🔥"))
  .catch((error) => console.log(error));
