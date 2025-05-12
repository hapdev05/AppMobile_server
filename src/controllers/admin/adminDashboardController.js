import { db } from '../../config/firebase.js';
import userModel from '../../models/auth/userModel.js';

// Lấy tổng số người dùng và tổng số đơn hàng cho dashboard admin
const getDashboardStats = async (req, res) => {
    try {
        const { role } = req.user;
        
        // Kiểm tra quyền admin
        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        // Lấy tổng số người dùng
        const users = await userModel.getAllUsers();
        const totalUsers = users.length;

        // Lấy số đơn hàng chờ xử lý
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.once('value');
        const orders = snapshot.val();
        
        // Lọc đơn hàng có trạng thái 'pending'
        let pendingOrders = 0;
        if (orders) {
            pendingOrders = Object.values(orders).filter(order => order.status === 'Chờ xác nhận').length;
        }

        // Trả về kết quả
        res.status(200).json({
            totalUsers,
            pendingOrders
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            error: error.message || 'Không thể lấy thông tin thống kê'
        });
    }
};

export { getDashboardStats };