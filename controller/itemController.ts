import { PrismaClient } from '@prisma/client';
import { AppError } from '../util/error';
import config from '../config/config';

const prisma = new PrismaClient();
const Item = prisma.item;

export interface CreateItemRequest {
    name: string;
    price: number;
    quantity: number;
    categoryId: string;
    image?: string;
  }

export const createItem = async(req: Request, res: Response) => {
    const { name, price, quantity, categoryId, image } = req.body as unknown as CreateItemRequest;

}