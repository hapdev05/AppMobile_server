import express from 'express';
import { createOrder } from '../../controllers/order/orderController.js';

const router = express.Router();

// Route để tạo đơn hàng mới
router.post('/', createOrder);

export default router;