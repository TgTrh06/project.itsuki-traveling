import { unlink } from "node:fs/promises";
import type { RequestHandler } from "express";
import { fileTypeFromFile } from "file-type";
import { imageSizeFromFile } from "image-size/fromFile";
import { AppError } from "./error.middleware.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxWidth = 6000;
const maxHeight = 6000;
const maxPixels = 25_000_000;

async function removeFile(path: string) {
  await unlink(path).catch(() => undefined);
}

export const validateUploadedImage: RequestHandler = async (req, _res, next) => {
  if (!req.file) return next();

  try {
    const [type, dimensions] = await Promise.all([
      fileTypeFromFile(req.file.path),
      imageSizeFromFile(req.file.path),
    ]);

    if (!type || !allowedMimeTypes.has(type.mime) || type.mime !== req.file.mimetype) {
      throw new AppError("Only valid JPEG, PNG, WebP, or GIF images are allowed.", 415, "INVALID_IMAGE_TYPE");
    }

    const { width, height } = dimensions;
    if (!width || !height || width > maxWidth || height > maxHeight || width * height > maxPixels) {
      throw new AppError(
        `Image dimensions must not exceed ${maxWidth}×${maxHeight} pixels or ${maxPixels.toLocaleString()} total pixels.`,
        400,
        "INVALID_IMAGE_DIMENSIONS",
      );
    }

    next();
  } catch (error) {
    await removeFile(req.file.path);
    next(error);
  }
};
