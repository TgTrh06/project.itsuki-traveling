import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function port(value: string | undefined): number {
  const parsed = Number(value ?? "5000");
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be a valid TCP port number");
  }
  return parsed;
}

export function getEnv() {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return Object.freeze({
    NODE_ENV: nodeEnv,
    PORT: port(process.env.PORT),
    MONGO_URI: required("MONGO_URI"),
    JWT_SECRET: required("JWT_SECRET"),
    MAILTRAP_TOKEN: required("MAILTRAP_TOKEN"),
    CLIENT_ORIGINS: (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  });
}

export const isProduction = () => (process.env.NODE_ENV ?? "development") === "production";
