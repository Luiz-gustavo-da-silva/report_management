import { Router } from 'express'
import { errorHandler } from '../error-handler'
import authMiddleware from '../middlewares/auth';
import { createProduct, deleteProduct, getProductById, listProduct, updateProduct } from '../controllers/product';

const productRoutes: Router = Router()

productRoutes.post('/', [authMiddleware], errorHandler(createProduct));
productRoutes.put('/:id', [authMiddleware], errorHandler(updateProduct));
productRoutes.delete('/:id', [authMiddleware], errorHandler(deleteProduct));
productRoutes.get('/', [authMiddleware], errorHandler(listProduct));
productRoutes.get('/:id', [authMiddleware], errorHandler(getProductById));

export default productRoutes