import express from 'express';
import { getAllUsers, updateUserRole, deleteUser, getAllOrders } from '../../controllers/admin/adminController.js';
import { checkAdmin } from '../../middleware/authMiddleware.js';

const routerAdmin = express.Router();

// Admin routes
routerAdmin.get('/users', checkAdmin, getAllUsers);
routerAdmin.put('/user/role', checkAdmin, updateUserRole);
routerAdmin.delete('/user', checkAdmin, deleteUser);

// Order management routes
routerAdmin.get('/orders', checkAdmin, getAllOrders);

export default routerAdmin;