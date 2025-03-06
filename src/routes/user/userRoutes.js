import express from 'express';
import { getUserInfo } from '../../controllers/user/userController.js';
import { checkCustomer } from '../../middleware/customerMiddleware.js';
import { checkShipper } from '../../middleware/shipperMiddleware.js';

const router = express.Router();

// Route lấy thông tin người dùng và thống kê đơn hàng cho customer
router.get('/customer/info', checkCustomer, getUserInfo);

// Route lấy thông tin người dùng và thống kê đơn hàng cho shipper
router.get('/shipper/info', checkShipper, getUserInfo);

export default router;