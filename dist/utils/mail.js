"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPassResetSuccessEmail = exports.sendForgetPasswordLink = exports.sendVerificationMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const constants_1 = require("../utils/constants");
const template_1 = require("../mail/template");
const path_1 = __importDefault(require("path"));
const generateMailTransporter = () => {
    const transport = nodemailer_1.default.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: constants_1.MAILTRAP_USER,
            pass: constants_1.MAILTRAP_PASS,
        },
    });
    return transport;
};
const sendVerificationMail = async (token, profile) => {
    const transport = generateMailTransporter();
    const { name, email } = profile;
    const welcomeMessage = `Hi ${name}, welcome to Podify! There are so much things we do for verified users. Use the given OTP to verify your email.`;
    await transport.sendMail({
        to: email,
        from: "",
        subject: "Welcome to Podify",
        html: (0, template_1.generateTemplate)({
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
                path: path_1.default.join(__dirname, "../mail/logo.png"),
                cid: "logo",
            },
            {
                filename: "welcome.png",
                path: path_1.default.join(__dirname, "../mail/welcome.png"),
                cid: "welcome",
            },
        ],
    });
};
exports.sendVerificationMail = sendVerificationMail;
const sendForgetPasswordLink = async (options) => {
    const transport = generateMailTransporter();
    const { link, email } = options;
    const message = "We just received a request that you forgot your password. No problem you can use the link below and create a brand new password.";
    await transport.sendMail({
        to: email,
        from: "",
        subject: "Reset Password Link",
        html: (0, template_1.generateTemplate)({
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
                path: path_1.default.join(__dirname, "../mail/logo.png"),
                cid: "logo",
            },
            {
                filename: "forget_password.png",
                path: path_1.default.join(__dirname, "../mail/forget_password.png"),
                cid: "forget_password",
            },
        ],
    });
};
exports.sendForgetPasswordLink = sendForgetPasswordLink;
const sendPassResetSuccessEmail = async (name, email) => {
    const transport = generateMailTransporter();
    const message = `Dear ${name} we just updated your new password. You can now sign in with your new password`;
    await transport.sendMail({
        to: email,
        from: "",
        subject: "Password Reset successfully",
        html: (0, template_1.generateTemplate)({
            title: "Password Reset successfully",
            message,
            logo: "cid:logo",
            banner: "cid:forget_password",
            link: `${window.location.origin}${constants_1.SIGN_IN_URL}`,
            btnTitle: "Log in",
        }),
        attachments: [
            {
                filename: "logo.png",
                path: path_1.default.join(__dirname, "../mail/logo.png"),
                cid: "logo",
            },
            {
                filename: "forget_password.png",
                path: path_1.default.join(__dirname, "../mail/forget_password.png"),
                cid: "forget_password",
            },
        ],
    });
};
exports.sendPassResetSuccessEmail = sendPassResetSuccessEmail;
