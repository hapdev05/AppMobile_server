import express from 'express';
import { getAssignedOrders, updateOrderStatus, getOrderDetails, updateShipperLocation, updateShipperLocationPeriodic } from '../../controllers/shipper/shipperController.js';
import { checkShipper } from '../../middleware/shipperMiddleware.js';

const router = express.Router();

// Lấy danh sách đơn hàng được phân công
router.get('/orders', checkShipper, getAssignedOrders);

// Cập nhật trạng thái đơn hàng
router.put('/orders/:orderId/status', checkShipper, updateOrderStatus);

// Xem chi tiết đơn hàng
router.get('/orders/:orderId', checkShipper, getOrderDetails);

// Cập nhật vị trí shipper cho một đơn hàng cụ thể
router.put('/orders/:orderId/location', checkShipper, updateShipperLocation);

// Cập nhật vị trí shipper định kỳ (mỗi phút)
router.put('/location/current', checkShipper, updateShipperLocationPeriodic);

export default router;