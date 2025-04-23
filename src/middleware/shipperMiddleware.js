import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';
import dotenv from 'dotenv';

// Cấu hình dotenv
dotenv.config();

const checkShipper = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization header'
            });
        }

        // Lấy token từ header
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }
        
        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Lấy email từ token đã giải mã
            const email = decoded.email;
            if (!email) {
                return res.status(401).json({
                    error: 'Invalid token: email not found'
                });
            }
            
            // Kiểm tra user trong database
            const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
            const userRef = db.ref(`users/${encodedEmail}`);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val();

            if (!userData || userData.role !== 'shipper') {
                return res.status(403).json({
                    error: 'Permission denied. Shipper access required.'
                });
            }
            
            // Lưu thông tin user vào request để sử dụng trong các middleware tiếp theo
            req.user = {
                email: email,
                role: userData.role,
                uid: userData.firebaseUid
            };
            
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                error: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export { checkShipper };