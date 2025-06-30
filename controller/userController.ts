import jwt from "jsonwebtoken";
import config from "../config/config";
import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import { User } from '@prisma/client';
import { boolean } from "joi";
import { AppError } from "root/util/error";
import prisma from '../prisma';
import { generateUserToken } from "root/middleware/auth";


const User = prisma.user;
const jwtSecret = config.jwtSecret;
const jwtExpiration = config.jwtExpires

const createSendToken = (
    user: User,
    status: "success" | "failed",
    statusCode: number,
    res: Response,
    message: string
) => {
    const payload = {
        id: user.id,
        email: user.email,
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration });
    res.status(statusCode).json({
        status,
        message,
        token,
        data: {
            user,
        },
    });
};
export const comparePassword = async (
    password: string,
    userPassword: string
): Promise<boolean> => {
    return await bcrypt.compare(password, userPassword);
};
export const register = async(req:Request, res:Response) => {
    const { name, email, password, storeId } = req.body;
    if (![name, email, password, storeId].every(boolean)){
        throw new AppError(400, "All Fields Required")
    };
    const existingUser = await User.findFirst({
        where: {
            email,
        }
    });
    if (existingUser){
        throw new AppError(400, "User already exists")
    };
    const encryptedPassword = await bcrypt.hash(password,12);
    const newUser = await User.create({
        data: {
            name,
            email,
            password:encryptedPassword,
            storeId
        }
    });
    return createSendToken(
        newUser,
        "success",
        201,
        res,
        "User Registered Successfully"
    )
};
export const login = async(req: Request, res: Response) => {
    const { email, password} = req.body;
    if(![email, password].every(boolean)){
        throw new AppError(400,"email and password required");
    };
    const validUser = await User.findFirst({
        where: {
            email,
        }
    });
    if(!validUser){
        throw new AppError(404, " user not found");
    };
    const isPasswordCorrect = await comparePassword(password,validUser.password)
    if(!isPasswordCorrect){
        throw new AppError(401, " Incorrect Password, Please Try Again")
    };
    return createSendToken(
        validUser,
        "success",
        200,
        res,
        "Login Successful"
    );
};
