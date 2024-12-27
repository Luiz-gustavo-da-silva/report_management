import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import stockRoutes from "./stock";

const rootRouter: Router = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/product', productRoutes)
rootRouter.use('/stock', stockRoutes)

export default rootRouter