import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { AuthRequest } from '../middlewares/auth';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = '1',
      limit = '10',
    } = req.query;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sort mapping
    let sortBy: any = { createdAt: -1 };
    if (sort === 'priceAsc') sortBy = { price: 1 };
    else if (sort === 'priceDesc') sortBy = { price: -1 };
    else if (sort === 'rating') sortBy = { rating: -1 };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query)
      .sort(sortBy)
      .limit(limitNumber)
      .skip(skip)
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, images, category, brand, stock, sizes, colors, threeDModelUrl } = req.body;
    const product = await Product.create({
      name,
      price,
      description,
      images,
      category,
      brand,
      stock,
      sizes,
      colors,
      threeDModelUrl,
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, price, description, images, category, brand, stock, sizes, colors, threeDModelUrl } = req.body;

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    product.images = images ?? product.images;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.stock = stock ?? product.stock;
    product.sizes = sizes ?? product.sizes;
    product.colors = colors ?? product.colors;
    product.threeDModelUrl = threeDModelUrl ?? product.threeDModelUrl;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r: any) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRelatedProducts = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4).lean();
    res.json(related);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingProducts = async (req: Request, res: Response) => {
  try {
    const trending = await Product.find({}).sort({ rating: -1, numReviews: -1 }).limit(4).lean();
    res.json(trending);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNewArrivals = async (req: Request, res: Response) => {
  try {
    const newArrivals = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();
    res.json(newArrivals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import { uploadToCloudinary } from '../utils/cloudinary';
export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = await uploadToCloudinary(req.file.buffer);
    res.status(201).json({ imageUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
