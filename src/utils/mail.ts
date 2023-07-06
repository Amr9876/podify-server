import nodemailer from "nodemailer";
import { MAILTRAP_PASS, MAILTRAP_USER, SIGN_IN_URL } from "#/utils/constants";
import EmailVerficationToken from "#/models/emailVerficationToken";
import { generateTemplate } from "#/mail/template";
import path from "path";

const generateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });

  return transport;
};

interface Profile {
  name: string;
  email: string;
}

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email } = profile;

  const welcomeMessage = `Hi ${name}, welcome to Podify! There are so much things we do for verified users. Use the given OTP to verify your email.`;

  await transport.sendMail({
    to: email,
    from: "",
    subject: "Welcome to Podify",
    html: generateTemplate({
      title: "Welcome to Podify",
      message: welcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: "https://mailtrap.io/api/accounts/1596809/inboxes/2259660/messages/3522530738/attachments/part/logo?api_token=05c970b332f824fa0c0a8d25faba8032",
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: "https://mailtrap.io/api/accounts/1596809/inboxes/2259660/messages/3522530738/attachments/part/welcome?api_token=05c970b332f824fa0c0a8d25faba8032",
        cid: "welcome",
      },
    ],
  });
};

interface Options {
  email: string;
  link: string;
}

export const sendForgetPasswordLink = async (options: Options) => {
  const transport = generateMailTransporter();

  const { link, email } = options;

  const message =
    "We just received a request that you forgot your password. No problem you can use the link below and create a brand new password.";

  await transport.sendMail({
    to: email,
    from: "",
    subject: "Reset Password Link",
    html: generateTemplate({
      title: "Forget Password",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link,
      btnTitle: "Reset Password",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: "https://mailtrap.io/api/accounts/1596809/inboxes/2259660/messages/3510741212/attachments/part/logo?api_token=05c970b332f824fa0c0a8d25faba8032",
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: "https://mailtrap.io/api/accounts/1596809/inboxes/2259660/messages/3510748104/attachments/part/forget_password?api_token=05c970b332f824fa0c0a8d25faba8032",
        cid: "forget_password",
      },
    ],
  });
};

export const sendPassResetSuccessEmail = async (
  name: string,
  email: string
) => {
  const transport = generateMailTransporter();

  const message = `Dear ${name} we just updated your new password. You can now sign in with your new password`;

  await transport.sendMail({
    to: email,
    from: "",
    subject: "Password Reset successfully",
    html: generateTemplate({
      title: "Password Reset successfully",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: `${window.location.origin}${SIGN_IN_URL}`,
      btnTitle: "Log in",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: "https://mailtrap.io/api/accounts/1596809/inboxes/2259660/messages/3510741212/attachments/part/logo?api_token=05c970b332f824fa0c0a8d25faba8032",
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: "https://mailtrap.io/api/accounts/1596809/inboxes/2259660/messages/3510748104/attachments/part/forget_password?api_token=05c970b332f824fa0c0a8d25faba8032",
        cid: "forget_password",
      },
    ],
  });
};
