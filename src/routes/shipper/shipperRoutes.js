import express from 'express';
import { getAssignedOrders, updateOrderStatus, getOrderDetails, updateShipperLocation } from '../../controllers/shipper/shipperController.js';
import { checkShipper } from '../../middleware/shipperMiddleware.js';

const router = express.Router();

// Lấy danh sách đơn hàng được phân công
router.get('/orders', checkShipper, getAssignedOrders);

// Cập nhật trạng thái đơn hàng
router.put('/orders/:orderId/status', checkShipper, updateOrderStatus);

// Xem chi tiết đơn hàng
router.get('/orders/:orderId', checkShipper, getOrderDetails);

// Cập nhật vị trí shipper
router.put('/orders/:orderId/location', checkShipper, updateShipperLocation);

export default router;