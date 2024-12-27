import { Router } from 'express'
import { errorHandler } from '../error-handler'
import authMiddleware from '../middlewares/auth';
import { getTotalSales } from '../controllers/count';

const countRoutes: Router = Router()

countRoutes.get('/', [authMiddleware], errorHandler(getTotalSales));

export default countRoutes