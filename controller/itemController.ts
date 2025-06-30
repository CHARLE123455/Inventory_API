import { Item,Log,User } from '@prisma/client';
import { AppError } from '../util/error';
import config from '../config/config';
import prisma from '../prisma';
import { Request, Response } from 'express';
import uploadImageToCloudinary from '../service/imageUploadService';


const Item = prisma.item;
const Log = prisma.log;
const User = prisma.user;

export const createItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, price, quantity, categoryId, storeId } = req.body;
  const imageFile = req.file;
  const isAuthorized = await User.findUnique({
    where: { id: userId },
  });

  if (!isAuthorized) {
    throw new AppError(403, 'Unauthorized to create item');
  }

  if (![name, price, quantity, categoryId, storeId].every(Boolean)) {
    throw new AppError(400, 'All fields are required');
  }

  let imageUrl: string | undefined;
  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }

  const item = await Item.create({
    data: {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      categoryId,
      storeId,
      imageUrl,
    },
  });

  await Log.create({
    data: {
      action: 'PURCHASE',
      details: `Created item: ${name}`,
      itemId: item.id,
      storeId,
      quantity,
    },
  });

  res.status(201).json({ status: 'success', item });
};

export const getAllItems = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(403, 'Unauthorized');

  const items = await prisma.item.findMany();
  res.status(200).json({ status: 'success', items });
};

export const updateItemQuantity = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  const user = await User.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(403, 'Unauthorized');

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new AppError(404, 'Item not found');

  const updatedItem = await Item.update({
    where: { id },
    data: { quantity },
  });

  await prisma.log.create({
    data: {
      action: 'UPDATE',
      details: `Updated quantity of item: ${item.name}`,
      itemId: id,
      storeId: item.storeId,
      quantity,
    },
  });

  res.status(200).json({ status: 'success', updatedItem });
};

export const sellItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantitySold, purchaser } = req.body;

  const user = await User.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(403, 'Unauthorized');

  const item = await Item.findUnique({ where: { id } });
  if (!item) throw new AppError(404, 'Item not found');

  if (item.quantity < quantitySold) {
    throw new AppError(400, 'Insufficient quantity. Kindly restock.');
  }

  const updatedItem = await Item.update({
    where: { id },
    data: { quantity: item.quantity - quantitySold },
  });

  await Log.create({
    data: {
      action: 'SELL',
      details: `Sold ${quantitySold} of ${item.name} to ${purchaser}`,
      itemId: id,
      storeId: item.storeId,
      quantity: quantitySold,
      purchaser,
    },
  });

  res.status(200).json({ status: 'success', updatedItem });
};

export const swapItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { itemId, quantity, fromStoreId, toStoreId, direction } = req.body;

  const user = await User.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(403, 'Unauthorized');

  const item = await Item.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError(404, 'Item not found');

  if (direction === 'outgoing') {
    if (item.storeId !== fromStoreId) {
      throw new AppError(400, 'Item does not belong to the store');
    }
    if (item.quantity < quantity) {
      throw new AppError(400, 'Insufficient quantity');
    }

    await Item.update({
      where: { id: itemId },
      data: { quantity: item.quantity - quantity },
    });

    const newLog = await Log.create({
      data: {
        action: 'SWAP_OUTGOING',
        details: `Transferred ${quantity} of ${item.name} to store ${toStoreId}`,
        itemId,
        storeId: fromStoreId,
        quantity,
        toStoreId,
      },
    });

    return res.status(200).json({ status: 'success', message: 'Product transferred to another store', data:{newLog} });
  }

  if (direction === 'incoming') {
    await prisma.item.update({
      where: { id: itemId },
      data: { quantity: item.quantity + quantity },
    });

    const newLog = await Log.create({
      data: {
        action: 'SWAP_INCOMING',
        details: `Received ${quantity} of ${item.name} from store ${fromStoreId}`,
        itemId,
        storeId: toStoreId,
        quantity,
        fromStoreId,
      },
    });

    return res.status(200).json({ status: 'success', message: 'Product received from another store', data:{ newLog } });
  }

  throw new AppError(400, "Invalid direction (must be 'incoming' or 'outgoing')");
};

