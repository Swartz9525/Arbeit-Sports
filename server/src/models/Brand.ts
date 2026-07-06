import mongoose, { Schema } from 'mongoose';

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    logo: String,
    description: String,
  },
  { timestamps: true }
);

brandSchema.index({ slug: 1 });

export const Brand = mongoose.model('Brand', brandSchema);
