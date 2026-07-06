import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || 'supersecretjwtsecretkeychangeinproduction') as string;
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtsecretkeychangeinproduction') as string;

export const generateAccessToken = (userId: string, role: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '15m') as any,
  };
  return jwt.sign({ id: userId, role }, JWT_SECRET, options);
};

export const generateRefreshToken = (userId: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any,
  };
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
};
