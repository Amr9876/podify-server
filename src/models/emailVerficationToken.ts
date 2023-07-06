import { ObjectId, Schema, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

interface EmailVerficationTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const emailVerficationTokenSchema = new Schema<
  EmailVerficationTokenDocument,
  {},
  Methods
>({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

emailVerficationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    this.token = await hash(this.token, 10);
  }

  next();
});

emailVerficationTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);

  return result;
};

export default model(
  "EmailVerficationToken",
  emailVerficationTokenSchema
) as Model<EmailVerficationTokenDocument, {}, Methods>;
