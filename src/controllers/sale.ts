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
  const count = await prismaCilent.sale.count();

  const sales = await prismaCilent.sale.findMany({
    take: 5,
    skip: +req.query.offset || 0,
    include: {
      product: true,
    },
  });

  res.json({
    count,
    data: sales,
  });
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
