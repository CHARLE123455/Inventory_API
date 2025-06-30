import config from "../config/config";
import { Request, Response } from "express";
import { AppError } from "../util/error";
import prisma from '../prisma';
import { Store } from '@prisma/client';
import { boolean } from "joi";

const Store = prisma.store;
export const createStore = async (req: Request, res: Response) => {
        const { name, address } = req.body;
        if(![name,address].every(boolean)){
            throw new AppError(400, "All fields required")
        }
        const newStore = await Store.create({
            data: {
                name,
                address
            },
        });
        return res.status(201).json({
            status: "success",
            message: "store created",
            data:{
                newStore
            }
        })
        
};
export const getStore = async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await Store.findUnique({
        where: { id },
        include: { users: true, items: true, categories: true, logs: true },
    });
    if (!store) {
        throw new AppError(404, "Store not found");
    }
    return res.status(200).json({
        status: "success",
        data: { store }
    });
};

export const updateStore = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, address } = req.body;
    if(![name, address].every(boolean)){
        throw new AppError(400, "All fields required");
    }
    const updatedStore = await Store.update({
        where: { id },
        data: { name, address },
    });
    return res.status(200).json({
        status: "success",
        message: "store updated",
        data: { updatedStore }
    });
};

export const deleteStore = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Store.delete({ where: { id } });
    return res.status(204).json({
        status: "success",
        message: "store deleted"
    });
};

export const getAllStores = async (req: Request, res: Response) => {
    const stores = await Store.findMany({
        include: { users: true, items: true, categories: true, logs: true },
    });
    return res.status(200).json({
        status: "success",
        data: { stores }
    });
};