import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { User } from '../models/User';

const isProduction = process.env.NODE_ENV === 'production';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Read access token from cookie or Auth header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    // Attempt automatic refresh token rotation if refresh token is in cookie
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (user && user.refreshToken === refreshToken) {
          // Re-generate access token
          const newAccessToken = generateAccessToken(user._id.toString(), user.role);
          
          // Set new access token cookie
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 mins
          });

          req.user = user;
          return next();
        }
      } catch (err) {
        // Refresh token failed, user must login again
      }
    }

    return res.status(401).json({ message: 'Not authorized, token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    // Access token expired, attempt refresh token auth
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (user && user.refreshToken === refreshToken) {
          const newAccessToken = generateAccessToken(user._id.toString(), user.role);
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000,
          });
          req.user = user;
          return next();
        }
      } catch (err) {
        // Fail through
      }
    }
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, administrator only' });
  }
};
