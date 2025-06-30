import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config'
import prisma from '../prisma';
import { User } from '@prisma/client';
import { AppError } from '../util/error';



declare global {
    namespace Express {
        interface Request {
            user: User;
        }
    }
}
const User = prisma.user;
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
        throw new AppError(401, "Invalid Auth Header format")
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret) as { id: string };

        const user = await User.findUnique({ 
            where: { 
                id: decoded.id 
            } 
        });

        if (!user){
            throw new AppError(404, "User not found")
        };

        req.user = user;
        next();
    } catch {
        throw new AppError(403, "Invalid or Expired Token")
    }
};

