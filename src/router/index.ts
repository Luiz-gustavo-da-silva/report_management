import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import stockRoutes from "./stock";
import saleRoutes from "./sale";
import countRoutes from "./count";

const rootRouter: Router = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/product', productRoutes)
rootRouter.use('/stock', stockRoutes)
rootRouter.use('/sale', saleRoutes)
rootRouter.use('/count', countRoutes)

export default rootRouter