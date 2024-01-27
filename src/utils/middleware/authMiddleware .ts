import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
interface AuthRequest extends Request {
  user?: JwtPayload;
}
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is sent as a Bearer token
    const secretKey = process.env.SECRET_KEY;
    if (!token) {
      return res
        .status(401)
        .json({ error: 'Access denied. No token provided.' });
    }
    const decoded: any = jwt.verify(token, secretKey, {
      algorithms: ['HS256'],
    });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
