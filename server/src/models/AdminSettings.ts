import mongoose, { Schema } from 'mongoose';

const adminSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

adminSettingsSchema.index({ key: 1 });

export const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
