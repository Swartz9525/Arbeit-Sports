import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      default: 0,
    },
    images: {
      type: [String],
      required: [true, 'Product images are required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock quantity is required'],
      default: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    threeDModelUrl: {
      type: String,
      default: '', // Store path or link to 3D model if needed (like shoe/ball)
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to optimize querying, filtering and sorting performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
export const Review = mongoose.model('Review', reviewSchema);
