import express from 'express';
import { createOrder } from '../../controllers/order/orderController.js';
import jwt from 'jsonwebtoken';
import { db } from '../../config/firebase.js';

const router = express.Router();

// Middleware để xác thực và lấy thông tin người dùng
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        if (!email) {
            return res.status(401).json({
                error: 'Invalid token: email not found'
            });
        }

        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const userRef = db.ref(`users/${encodedEmail}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();

        if (!userData) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        req.user = userData;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            error: 'Invalid token'
        });
    }
};

// Route để tạo đơn hàng mới
router.post('/', authenticateUser, createOrder);

export default router;