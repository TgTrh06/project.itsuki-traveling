import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN || "6ce30c1d28adc9226555f292a15ed823";

export const mailtrapClient = new MailtrapClient({
    // endpoint: "https://send.api.mailtrap.io/",
    token: TOKEN,
});

export const sender = {
    email: "hello@demomailtrap.co",
    name: "Itsuki No Tabi",
};