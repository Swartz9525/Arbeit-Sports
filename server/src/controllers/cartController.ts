import { Response } from 'express';
import { Cart } from '../models/Cart';
import { AuthRequest } from '../middlewares/auth';

export const syncCart = async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body; // Array of { product, qty, size, color }
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = items;
      await cart.save();
    } else {
      cart = await Cart.create({
        user: req.user._id,
        items,
      });
    }

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
