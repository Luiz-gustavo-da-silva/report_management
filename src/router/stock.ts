import { Router } from 'express'
import { errorHandler } from '../error-handler'
import authMiddleware from '../middlewares/auth';
import { addToStock, deleteStock, getStockById, listStock, updateStock } from '../controllers/stock';

const stockRoutes: Router = Router()

stockRoutes.post('/', [authMiddleware], errorHandler(addToStock));
stockRoutes.put('/update', [authMiddleware], errorHandler(updateStock));
stockRoutes.delete('/:id', [authMiddleware], errorHandler(deleteStock));
stockRoutes.get('/', [authMiddleware], errorHandler(listStock));
stockRoutes.get('/:id', [authMiddleware], errorHandler(getStockById));

export default stockRoutes