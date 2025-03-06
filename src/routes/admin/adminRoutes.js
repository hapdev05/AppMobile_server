import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../../controllers/admin/adminController.js';
import { checkAdmin } from '../../middleware/authMiddleware.js';

const routerAdmin = express.Router();

// Admin routes
routerAdmin.get('/users', checkAdmin, getAllUsers);
routerAdmin.put('/user/role', checkAdmin, updateUserRole);
routerAdmin.delete('/user', checkAdmin, deleteUser);

export default routerAdmin;