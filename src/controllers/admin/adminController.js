import userModel from '../../models/auth/userModel.js';
import { db } from '../../config/firebase.js';

// Lấy danh sách tất cả users
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        const users = await userModel.getAllUsers();
        res.status(200).json({
            users: users
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(400).json({
            error: error.message || 'Failed to get users'
        });
    }
};

// Cập nhật role của user
const updateUserRole = async (req, res) => {
    try {
        const { email, newRole } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        const updatedUser = await userModel.updateUserRole(email, newRole);
        res.status(200).json({
            message: "User role updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(400).json({
            error: error.message || 'Failed to update user role'
        });
    }
};

// Xóa user
const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const userRef = db.ref(`users/${encodedEmail}`);
        
        // Kiểm tra user tồn tại
        const snapshot = await userRef.once('value');
        if (!snapshot.exists()) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Xóa user
        await userRef.remove();
        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(400).json({
            error: error.message || 'Failed to delete user'
        });
    }
};

// Lấy danh sách tất cả đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.once('value');
        const orders = snapshot.val();

        if (!orders) {
            return res.status(404).json({
                error: 'No orders found'
            });
        }

        // Chuyển đổi object orders thành mảng và thêm orderId vào mỗi đơn hàng
        const ordersArray = Object.entries(orders).map(([orderId, orderData]) => ({
            orderId,
            ...orderData
        }));

        res.status(200).json({
            orders: ordersArray
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({
            error: error.message || 'Failed to get orders'
        });
    }
};

// Duyệt đơn hàng
const approveOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        if (!status) {
            return res.status(400).json({
                error: 'Status is required'
            });
        }

        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        
        if (!snapshot.exists()) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        await orderRef.update({ status: status });
        res.status(200).json({
            message: 'Order status updated successfully'
        })
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({
            error: error.message || 'Failed to approve order'
        });
    }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        
        if (!snapshot.exists()) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        await orderRef.update({ status: 'Đã huỷ' });
        res.status(200).json({
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            error: error.message || 'Failed to cancel order'
        });
    }
};

// Phân công shipper cho đơn hàng
const assignShipper = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { shipperId } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        if (!shipperId) {
            return res.status(400).json({
                error: 'Shipper ID is required'
            });
        }

        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        
        if (!snapshot.exists()) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        await orderRef.update({ shipperId: shipperId });
        res.status(200).json({
            message: 'Shipper assigned successfully'
        });
    } catch (error) {
        console.error('Error assigning shipper:', error);
        res.status(500).json({
            error: error.message || 'Failed to assign shipper'
        });
    }
};

export { getAllUsers, updateUserRole, deleteUser, getAllOrders, approveOrder, cancelOrder, assignShipper };
