import express from 'express';
import { getAllUsers, updateUserRole, deleteUser, getAllOrders, approveOrder, cancelOrder, assignShipper } from '../../controllers/admin/adminController.js';
import { checkAdmin } from '../../middleware/authMiddleware.js';

const routerAdmin = express.Router();

// Admin routes
routerAdmin.get('/users', checkAdmin, getAllUsers);
routerAdmin.put('/user/role', checkAdmin, updateUserRole);
routerAdmin.delete('/user', checkAdmin, deleteUser);

// Order management routes
routerAdmin.get('/orders', checkAdmin, getAllOrders);
routerAdmin.put('/order/:orderId/status', checkAdmin, approveOrder);
routerAdmin.post('/orders/:orderId/cancel', checkAdmin, cancelOrder);
routerAdmin.put('/order/:orderId/assign', checkAdmin, assignShipper);

export default routerAdmin;