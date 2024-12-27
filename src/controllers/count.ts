import { prismaCilent } from "..";
import { Request, Response } from "express";

export const getTotalSales = async (req: Request, res: Response) => {
    try {
        const totalSales = await prismaCilent.sale.aggregate({
            _sum: {
                totalPrice: true,
            },
        });

        res.json({
            totalSales: totalSales._sum.totalPrice || 0,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao calcular o total de vendas.",
        });
    }
};