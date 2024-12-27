import { Request, Response } from "express";
import { prismaCilent } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const listStock = async (req: Request, res: Response) => {
    
    const count = await prismaCilent.stock.count();

    const stocks = await prismaCilent.stock.findMany({
        take: 5,
        skip: +req.query.offset || 0
    })

    res.json({
        count, data: stocks
    })
};

export const addToStock = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;

    const existingStock = await prismaCilent.stock.findUnique({
        where: { productId },
    });

    if (existingStock) {
        return res.status(400).json({
            message: "Produto já está no estoque. Atualize a quantidade em vez disso.",
        });
    }

    const stock = await prismaCilent.stock.create({
        data: {
            productId,
            quantity,
        },
    });

    res.json(stock);
};

export const updateStock = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;

    try {
        const stock = await prismaCilent.stock.update({
            where: { productId },
            data: { quantity },
        });

        res.json(stock);
    } catch (error) {
        throw new NotFoundException("Produto no estoque não encontrado", ErrorCode.STOCK_NOT_FOUND);
    }
};

export const deleteStock = async (req: Request, res: Response) => {
    try {

        const stock = await prismaCilent.stock.delete({
            where: { productId: +req.params.id },
        });

        res.json(stock);
    } catch (error) {
        throw new NotFoundException("Produto no estoque não encontrado", ErrorCode.STOCK_NOT_FOUND);
    }
};

export const getStockById = async (req: Request, res: Response) => {
    try {

        const stock = await prismaCilent.stock.findUnique({
            where: { productId: +req.params.id },
        });

        res.json(stock);
    } catch (error) {
        throw new NotFoundException("Produto no estoque não encontrado", ErrorCode.STOCK_NOT_FOUND);
    }
};