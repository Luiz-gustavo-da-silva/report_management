import { Request, Response } from "express";
import { prismaCilent } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const listStock = async (req: Request, res: Response) => {
  const { name, category, belowQuantity, aboveQuantity } = req.query;

  const filters: any = {};

  if (name) {
    filters.product = {
      name: {
        contains: String(name),
      },
    };
  }

  if (category) {
    filters.product = {
      ...filters.product,
      category: {
        equals: String(category),
      },
    };
  }

  if (belowQuantity) {
    filters.quantity = {
      lte: Number(belowQuantity),
    };
  }

  if (aboveQuantity) {
    filters.quantity = {
      ...filters.quantity,
      gte: Number(aboveQuantity),
    };
  }

  try {
    const count = await prismaCilent.stock.count({
      where: filters,
    });

    const stocks = await prismaCilent.stock.findMany({
      where: filters,
      include: {
        product: true,
      },
    });

    res.json({
      count,
      data: stocks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar stock." });
  }
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