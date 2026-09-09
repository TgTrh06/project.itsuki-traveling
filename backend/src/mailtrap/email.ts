import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
} from "./email.template.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";
import { logger } from "../utils/logger.js";

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        });

        logger.info("verification_email_sent", { recipientDomain: email.split("@")[1] });
    } catch (error) {
        logger.error("verification_email_failed", { errorMessage: error instanceof Error ? error.message : String(error) });
        
        throw new Error(`Error sending verification email: ${error}`);
    }
};

export const sendWelcomeEmail = async (email: string, _name: string) => {
    const recipient = [{ email }];

    try {
        await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Itsuki no Tabi",
            text:  "Congrats for joining Itsuki's Journey!",
            category: "Welcome",
        });
    } catch (error) {
        logger.error("welcome_email_failed", { errorMessage: error instanceof Error ? error.message : String(error) });
        
        throw new Error(`Error sending welcome email: ${error}`);
    }
};

export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
    const recipient = [{ email }];

    try {
        await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        });
        logger.info("password_reset_email_sent", { recipientDomain: email.split("@")[1] });
    } catch (error) {
        logger.error("password_reset_email_failed", { errorMessage: error instanceof Error ? error.message : String(error) });

        throw new Error(`Error sending password reset email: ${error}`);
    }
};

export const sendResetSuccessEmail = async (email: string) => {
    const recipient = [{ email }];

    try {
        await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset successfully",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
        });
        logger.info("password_reset_success_email_sent", { recipientDomain: email.split("@")[1] });
    } catch (error) {
        logger.error("password_reset_success_email_failed", { errorMessage: error instanceof Error ? error.message : String(error) });

        throw new Error(`Error sending password reset success email ${error}`);
    }
};
