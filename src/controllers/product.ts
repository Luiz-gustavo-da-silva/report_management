import { Request, Response } from "express";
import { prismaCilent } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createProduct = async (req: Request, res: Response) => {
  const product = await prismaCilent.product.create({
    data: {
      ...req.body,
    },
  });

  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = req.body;

    const updatedProduct = await prismaCilent.product.update({
      where: {
        id: +product.id,
      },
      data: product,
    });

    res.json(updatedProduct);
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = +req.params.id;

    const product = await prismaCilent.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(
        "Produto não encontrado",
        ErrorCode.PRODUCT_NOT_FOUND
      );
    }

    const sale = await prismaCilent.sale.findFirst({
      where: { productId },
    });

    if (sale) {
      throw new NotFoundException(
        "O produto não pode ser deletado. Existe uma venda associada a esse produto!",
        ErrorCode.PRODUCT_IN_SALE
      );
    }

    const deletedProduct = await prismaCilent.product.delete({
      where: { id: productId },
    });

    res.json(deletedProduct);
  } catch (error) {
    if (error instanceof NotFoundException) {
      res
        .status(404)
        .json({ message: error.message, errorCode: error.errorCode });
    } else {
      console.error(error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
};

export const listProduct = async (req: Request, res: Response) => {
  const { name, category, minPrice, maxPrice } = req.query;

  const filters: any = {};

  if (name) {
    filters.name = {
      contains: String(name),
    };
  }

  if (category) {
    filters.category = {
      contains: String(category),
    };
  }

  if (minPrice) {
    filters.price = {
      ...filters.price,
      gte: parseFloat(String(minPrice)),
    };
  }

  if (maxPrice) {
    filters.price = {
      ...filters.price,
      lte: parseFloat(String(maxPrice)),
    };
  }

  try {
    const count = await prismaCilent.product.count({
      where: filters,
    });

    const products = await prismaCilent.product.findMany({
      where: filters,
    });

    res.json({
      count,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
};

export const listProductId = async (req: Request, res: Response) => {
  const products = await prismaCilent.product.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prismaCilent.product.findFirstOrThrow({
      where: {
        id: +req.params.id,
      },
    });

    res.json(product);
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};
