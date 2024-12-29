import { Request, Response } from "express";
import { prismaCilent } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const listStock = async (req: Request, res: Response) => {
  const count = await prismaCilent.stock.count();

  const stocks = await prismaCilent.stock.findMany({
    take: 5,
    skip: +req.query.offset || 0,
    include: {
      product: true,
    },
  });

  res.json({
    count,
    data: stocks,
  });
};

export const addToStock = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  const existingStock = await prismaCilent.stock.findUnique({
    where: { productId },
  });

  if (existingStock) {
    return res.status(400).json({
      message:
        "Produto já está no estoque. Atualize a quantidade em vez disso.",
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
    throw new NotFoundException(
      "Produto no estoque não encontrado",
      ErrorCode.STOCK_NOT_FOUND
    );
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const sale = await prismaCilent.sale.findFirst({
      where: { productId: +req.params.id },
    });

    if (sale) {
      throw new NotFoundException(
        "O stock não pode ser deletado. Existe uma venda associada a esse produto!",
        ErrorCode.PRODUCT_IN_SALE
      );
    }

    const stock = await prismaCilent.stock.delete({
      where: { productId: +req.params.id },
    });

    res.json(stock);
  } catch (error) {
    if (error instanceof NotFoundException) {
      res
        .status(404)
        .json({ message: error.message, errorCode: error.errorCode });
    } else {
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
};

export const getStockById = async (req: Request, res: Response) => {
  try {
    const stock = await prismaCilent.stock.findUnique({
      where: { productId: +req.params.id },
      include: {
        product: true,
      },
    });

    res.json(stock);
  } catch (error) {
    throw new NotFoundException(
      "Produto no estoque não encontrado",
      ErrorCode.STOCK_NOT_FOUND
    );
  }
};