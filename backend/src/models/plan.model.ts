import mongoose from 'mongoose';

const PlanItemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // keep article/destination id as string
    title: String,
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    meta: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const PlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [PlanItemSchema],
  },
  { timestamps: true }
);

export const Plan = mongoose.model('Plan', PlanSchema);
