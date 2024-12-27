import { prismaCilent } from "..";
import { Request, Response } from "express";

export const getTotalSales = async (req: Request, res: Response) => {
    try {
        const totalSales = await prismaCilent.sale.aggregate({
            _sum: {
                totalPrice: true,
                quantity: true,
            },
        });

        const currentDate = new Date();

        res.json({
            totalSales: totalSales._sum.totalPrice || 0,
            totalProductsSold: totalSales._sum.quantity || 0,
            currentDate: currentDate.toISOString(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao calcular o total de vendas.",
        });
    }
};
