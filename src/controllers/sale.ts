import { Request, Response } from "express";
import { prismaCilent } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createSale = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  const stock = await prismaCilent.stock.findUnique({
    where: { productId },
  });

  if (!stock || stock.quantity < quantity) {
    return res.status(400).json({
      message: "Estoque insuficiente para realizar a venda.",
    });
  }

  const product = await prismaCilent.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundException(
      "Produto não encontrado",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }

  const totalPrice = product.price * quantity;

  const sale = await prismaCilent.sale.create({
    data: {
      productId,
      quantity,
      totalPrice,
    },
  });

  await prismaCilent.stock.update({
    where: { productId },
    data: {
      quantity: stock.quantity - quantity,
    },
  });

  res.json(sale);
};

export const listSales = async (req: Request, res: Response) => {
  const { name, startDate, endDate } = req.query;

  const filters: any = {};

  if (name) {
    filters.product = {
      name: {
        contains: String(name),
      },
    };
  }

  if (startDate || endDate) {
    filters.saleDate = {
      ...(startDate && { gte: new Date(startDate as string) }),
      ...(endDate && { lte: new Date(endDate as string) }),
    };
  }

  try {
    const count = await prismaCilent.sale.count({
      where: filters,
    });

    const sales = await prismaCilent.sale.findMany({
      where: filters,
      include: {
        product: true,
      },
    });

    const totalSales = await prismaCilent.sale.aggregate({
      where: filters,
      _sum: {
        totalPrice: true,
        quantity: true,
      },
    });

    res.json({
      count,
      totalSales: totalSales._sum.totalPrice || 0,
      totalProductsSold: totalSales._sum.quantity || 0,
      data: sales,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar Sales." });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const sale = await prismaCilent.sale.findUnique({
      where: { id: +req.params.id },
      include: {
        product: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(
        "Venda não encontrada",
        ErrorCode.SALE_NOT_FOUND
      );
    }

    res.json(sale);
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new NotFoundException(
      "Erro ao buscar a venda",
      ErrorCode.SALE_NOT_FOUND
    );
  }
};

export const deleteSale = async (req: Request, res: Response) => {
  try {
    const sale = await prismaCilent.sale.findUnique({
      where: { id: +req.params.id },
    });

    if (!sale) {
      throw new NotFoundException(
        "Venda não encontrada",
        ErrorCode.SALE_NOT_FOUND
      );
    }

    await prismaCilent.stock.update({
      where: { productId: sale.productId },
      data: {
        quantity: {
          increment: sale.quantity,
        },
      },
    });

    const deletedSale = await prismaCilent.sale.delete({
      where: { id: +req.params.id },
    });

    res.json(deletedSale);
  } catch (error) {
    throw new NotFoundException(
      "Erro ao deletar a venda",
      ErrorCode.SALE_NOT_FOUND
    );
  }
};
