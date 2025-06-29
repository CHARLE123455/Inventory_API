import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config'

declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

const jwtSecret = config.jwtSecret;
const jwtExpiration = config.jwtExpires

interface JwtPayload {
    id: string;
}

export const generateUserToken = <T extends { id: string }>(user: T) => {
    return jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: jwtExpiration || '1d',
    });
};

export const authenticateUserToken = (req: Request,res: Response,next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
            .status(401)
            .json({ message: 'Invalid authorization header format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        if (!decoded.id) throw new Error('Invalid payload');

        req.id = decoded.id;
        next();
    } catch {
        return res
            .status(403)
            .json({ message: 'Invalid or expired token' });
    }
};
