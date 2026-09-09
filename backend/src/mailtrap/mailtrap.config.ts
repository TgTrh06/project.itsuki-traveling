import { MailtrapClient } from "mailtrap";
import { getEnv } from "../config/env.js";

export const mailtrapClient = new MailtrapClient({
    token: getEnv().MAILTRAP_TOKEN,
});

export const sender = {
    email: "hello@demomailtrap.co",
    name: "Itsuki No Tabi",
};
