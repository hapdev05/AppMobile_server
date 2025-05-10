import express from 'express';
import { getCustomerOrders, getCustomerOrderDetails,getShipperLocation } from '../../controllers/customer/customerController.js';
import { checkCustomer } from '../../middleware/customerMiddleware.js';

const router = express.Router();

// Lấy danh sách đơn hàng của khách hàng
router.get('/orders', checkCustomer, getCustomerOrders);

// Lấy chi tiết đơn hàng của khách hàng
router.get('/orders/:orderId', checkCustomer, getCustomerOrderDetails);

// Lấy vị trí shipper của đơn hàng
router.get('/orders/:orderId/shipper-location', checkCustomer, getShipperLocation);

export default router;