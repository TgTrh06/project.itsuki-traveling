import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";
import { Plan } from '../models/plan.model.js';
import mongoose from 'mongoose';
import { logger } from "../utils/logger.js";
import type { PlanFields, PlanItemFields } from "../types/models.js";

const MAX_ITEMS = 50;

type PlanExportItem = Omit<PlanItemFields, "_id"> & { _id?: string };
type PlanExportRecord = {
  user?: { _id?: unknown; email?: string; name?: string };
  updatedAt?: Date;
  items?: PlanExportItem[];
};

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected error";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const queryString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const queryNumber = (value: unknown, fallback: number) => {
  const parsed = Number(queryString(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

function sanitizeItem(raw: unknown): PlanItemFields | null {
  const source = asRecord(raw);
  if (!source) return null;

  // required id (string)
  if (source._id == null) return null;
  const item: PlanItemFields = { _id: String(source._id) };

  if (source.title != null) item.title = String(source.title);

  const location = asRecord(source.location);
  if (location) {
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    const loc: NonNullable<PlanItemFields["location"]> = {};
    if (!Number.isNaN(lat)) loc.lat = lat;
    if (!Number.isNaN(lng)) loc.lng = lng;
    if (location.address) loc.address = String(location.address);
    if (Object.keys(loc).length) item.location = loc;
  }

  if (asRecord(source.meta)) item.meta = source.meta;

  return item;
}

// Get current user's plan
export const getMyPlan = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    const userId = req.user._id;
    const plan = await Plan.findOne({ user: userId });
    if (!plan) return res.status(200).json({ plan: { items: [] } });
    return res.status(200).json({ plan });
  } catch (error) {
    logger.error("getMyPlan error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};

// Upsert (create or update) plan for current user with validation
export const upsertMyPlan = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    const userId = req.user._id;
    const body = asRecord(req.body);
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (rawItems.length > MAX_ITEMS) {
      return res.status(400).json({ message: `Plan cannot contain more than ${MAX_ITEMS} items` });
    }

    const items: PlanItemFields[] = [];
    for (const raw of rawItems) {
      const it = sanitizeItem(raw);
      if (!it) continue; // skip invalid
      items.push(it);
    }

    const updated = await Plan.findOneAndUpdate(
      { user: userId },
      { $set: { items } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ plan: updated });
  } catch (error) {
    logger.error("upsertMyPlan error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};

// Delete user's plan
export const deleteMyPlan = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    const userId = req.user._id;
    await Plan.deleteOne({ user: userId });
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error("deleteMyPlan error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};

// --- Admin functions ---
// Get all plans (admin) with pagination
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, queryNumber(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, queryNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PlanFields> = {};
    const userId = queryString(req.query.userId);
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId;
    }

    const total = await Plan.countDocuments(filter);
    const plans = await Plan.find(filter).populate('user', '-password').sort({ updatedAt: -1 }).skip(skip).limit(limit);

    return res.status(200).json({ data: plans, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error("getAllPlans error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};

// Get a specific user's plan by userId (admin)
export const getPlanByUserId = async (req: Request, res: Response) => {
  try {
    const userId = queryString(req.params.userId);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const plan = await Plan.findOne({ user: userId }).populate('user', '-password');
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    return res.status(200).json({ plan });
  } catch (error) {
    logger.error("getPlanByUserId error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};

// Export plans as JSON (admin)
export const exportPlans = async (req: Request, res: Response) => {
  try {
    const filter: FilterQuery<PlanFields> = {};
    const userId = queryString(req.query.userId);
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId;
    }

    const plans = await Plan.find(filter).populate('user', '-password').sort({ updatedAt: -1 });

    res.setHeader('Content-Disposition', 'attachment; filename="plans.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(plans));
  } catch (error) {
    logger.error("exportPlans error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};

// Export plans as CSV (admin)
export const exportPlansCSV = async (req: Request, res: Response) => {
  try {
    const filter: FilterQuery<PlanFields> = {};
    const userId = queryString(req.query.userId);
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId;
    }

    const plans = await Plan.find(filter).populate('user', '-password').sort({ updatedAt: -1 });

    // CSV headers
    const headers = [
      'userId',
      'userEmail',
      'userName',
      'planUpdatedAt',
      'itemIndex',
      'itemId',
      'itemTitle',
      'itemLat',
      'itemLng',
      'itemAddress',
      'itemMeta'
    ];

    const rows = [];
    for (const rawPlan of plans) {
      const p = rawPlan.toObject() as unknown as PlanExportRecord;
      const uid = p.user?._id || '';
      const email = p.user?.email || '';
      const name = p.user?.name || '';
      const updatedAt = p.updatedAt ? p.updatedAt.toISOString() : '';
      const items = Array.isArray(p.items) ? p.items : [];
      if (items.length === 0) {
        rows.push([uid, email, name, updatedAt, '', '', '', '', '', '', '']);
      } else {
        items.forEach((it, idx) => {
          const lat = it.location?.lat ?? '';
          const lng = it.location?.lng ?? '';
          const address = it.location?.address ? String(it.location.address).replace(/\r?\n|,/g, ' ') : '';
          const meta = it.meta ? JSON.stringify(it.meta).replace(/\r?\n|,/g, ' ') : '';
          rows.push([uid, email, name, updatedAt, String(idx + 1), it._id || '', it.title || '', lat, lng, address, meta]);
        });
      }
    }

    // Build CSV string
    const csv = [headers.join(',')]
      .concat(rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')))
      .join('\n');

    res.setHeader('Content-Disposition', 'attachment; filename="plans.csv"');
    res.setHeader('Content-Type', 'text/csv');
    return res.status(200).send(csv);
  } catch (error) {
    logger.error("exportPlansCSV error", { error: messageOf(error) });
    return res.status(500).json({ message: messageOf(error) });
  }
};
