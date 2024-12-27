import { Router } from 'express'
import { errorHandler } from '../error-handler'
import authMiddleware from '../middlewares/auth';
import { createSale, deleteSale, getSaleById, listSales } from '../controllers/sale';

const saleRoutes: Router = Router()

saleRoutes.post('/', [authMiddleware], errorHandler(createSale));
saleRoutes.get('/', [authMiddleware], errorHandler(listSales));
saleRoutes.get('/:id', [authMiddleware], errorHandler(getSaleById));
saleRoutes.delete('/:id', [authMiddleware], errorHandler(deleteSale));

export default saleRoutes