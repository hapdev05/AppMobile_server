import express from 'express';
import { getCustomerOrders, getCustomerOrderDetails } from '../../controllers/customer/customerController.js';
import { checkCustomer } from '../../middleware/customerMiddleware.js';

const router = express.Router();

// Lấy danh sách đơn hàng của khách hàng
router.get('/orders', checkCustomer, getCustomerOrders);

// Lấy chi tiết đơn hàng của khách hàng
router.get('/orders/:orderId', checkCustomer, getCustomerOrderDetails);

export default router;