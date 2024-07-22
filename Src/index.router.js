import { categoryRouter } from "./Modules/Category/category.router.js";
import subcategoryRouter from "./Modules/subcategory/subcategory.router.js";
import brandRouter from "./Modules/brand/brand.router.js"
import productRouter from "./Modules/product/product.router.js"
import userRouter from "./Modules/user/user.router.js"
import cartRouter from "./Modules/cart/cart.router.js"
import couponRouter from './Modules/coupon/coupon.router.js';
import orderRouter from './Modules/order/order.router.js'
import reviewRouter from './Modules/reviews/reviews.router.js'
import morgan from "morgan";

const bootstrap = (app, express) => {

  app.use((req,res,next)=>{
    if(req.originalUrl=='/order/webhook')
    {
      next();
    }
    else
    {
      express.json() (req,res,next);
    }
  })
  app.use(morgan('short'))
  //Setup API Routing
  app.use("/category", categoryRouter);
  app.use("/subcategory", subcategoryRouter);
  app.use(`/brand`, brandRouter);
  app.use(`/product`, productRouter);
  app.use(`/user`, userRouter);
  app.use('/cart', cartRouter);
  app.use('/coupon',couponRouter);
  app.use('/order',orderRouter);
  app.use(`/review`, reviewRouter);
  

  app.get("*", (req, res) => {
    res.status(404).json({ Message: "Invalid routing." });
  });
};

export default bootstrap;
