import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    // Check expiration date
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({ message: 'Coupon has expired or is not active yet' });
    }

    // Check usage limits
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Validate min amount
    const orderAmount = Number(amount || 0);
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} is required to use this coupon`,
      });
    }

    // Compute discount value
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = parseFloat(((coupon.discountValue / 100) * orderAmount).toFixed(2));
    } else {
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      message: 'Coupon applied successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, startDate, endDate, usageLimit } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit,
    });
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
