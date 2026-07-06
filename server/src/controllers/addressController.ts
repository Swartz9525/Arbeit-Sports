import { Response } from 'express';
import { Address } from '../models/Address';
import { AuthRequest } from '../middlewares/auth';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { type, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      // Set all other user addresses to not default
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      type,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: !!isDefault,
    });

    res.status(201).json(address);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const { type, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address.type = type ?? address.type;
    address.fullName = fullName ?? address.fullName;
    address.phone = phone ?? address.phone;
    address.addressLine1 = addressLine1 ?? address.addressLine1;
    address.addressLine2 = addressLine2 ?? address.addressLine2;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.postalCode = postalCode ?? address.postalCode;
    address.country = country ?? address.country;
    address.isDefault = isDefault !== undefined ? !!isDefault : address.isDefault;

    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
