import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config'
import prisma from '../prisma';
import { User } from '@prisma/client';



declare global {
    namespace Express {
        interface Request {
            user: User;
        }
    }
}

const jwtSecret = config.jwtSecret;
const jwtExpiration = config.jwtExpires


export const generateUserToken = <T extends { id: string }>(user: T) => {
    return jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: jwtExpiration || '1d',
    });
};

export const authenticateUserToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret) as { id: string };

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

