import { Plan } from '../models/plan.model.js';
import mongoose from 'mongoose';

const MAX_ITEMS = 50;

function sanitizeItem(raw) {
  const item = {};
  if (raw == null || typeof raw !== 'object') return null;

  // required id (string)
  if (raw._id == null) return null;
  item._id = String(raw._id);

  if (raw.title != null) item.title = String(raw.title);

  if (raw.location && typeof raw.location === 'object') {
    const lat = Number(raw.location.lat);
    const lng = Number(raw.location.lng);
    const loc = {};
    if (!Number.isNaN(lat)) loc.lat = lat;
    if (!Number.isNaN(lng)) loc.lng = lng;
    if (raw.location.address) loc.address = String(raw.location.address);
    if (Object.keys(loc).length) item.location = loc;
  }

  if (raw.meta && typeof raw.meta === 'object') item.meta = raw.meta;

  return item;
}

// Get current user's plan
export const getMyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const plan = await Plan.findOne({ user: userId });
    if (!plan) return res.status(200).json({ plan: { items: [] } });
    return res.status(200).json({ plan });
  } catch (error) {
    console.error('getMyPlan error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Upsert (create or update) plan for current user with validation
export const upsertMyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];

    if (rawItems.length > MAX_ITEMS) {
      return res.status(400).json({ message: `Plan cannot contain more than ${MAX_ITEMS} items` });
    }

    const items = [];
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
    console.error('upsertMyPlan error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete user's plan
export const deleteMyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    await Plan.deleteOne({ user: userId });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('deleteMyPlan error', error);
    return res.status(500).json({ message: error.message });
  }
};

// --- Admin functions ---
// Get all plans (admin) with pagination
export const getAllPlans = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
    }

    const total = await Plan.countDocuments(filter);
    const plans = await Plan.find(filter).populate('user', '-password').sort({ updatedAt: -1 }).skip(skip).limit(limit);

    return res.status(200).json({ data: plans, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('getAllPlans error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get a specific user's plan by userId (admin)
export const getPlanByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const plan = await Plan.findOne({ user: userId }).populate('user', '-password');
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    return res.status(200).json({ plan });
  } catch (error) {
    console.error('getPlanByUserId error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Export plans as JSON (admin)
export const exportPlans = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
    }

    const plans = await Plan.find(filter).populate('user', '-password').sort({ updatedAt: -1 });

    res.setHeader('Content-Disposition', 'attachment; filename="plans.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(plans));
  } catch (error) {
    console.error('exportPlans error', error);
    return res.status(500).json({ message: error.message });
  }
};

// Export plans as CSV (admin)
export const exportPlansCSV = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
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
    for (const p of plans) {
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
    console.error('exportPlansCSV error', error);
    return res.status(500).json({ message: error.message });
  }
};
