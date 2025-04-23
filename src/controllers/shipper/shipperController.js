import { db } from '../../config/firebase.js';

// Lấy danh sách đơn hàng được phân công cho shipper
const getAssignedOrders = async (req, res) => {
    try {
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.once('value');
        const orders = snapshot.val();

        if (!orders) {
            return res.status(200).json({
                orders: []
            });
        }

        // Lấy thông tin user từ bảng users
        const email = req.user.email;
        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const userRef = db.ref(`users/${encodedEmail}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.idUser) {
            return res.status(403).json({
                error: 'User information not found'
            });
        }
        console.log('User Data:', userData.idUser, typeof userData.idUser);
        
        const assignedOrders = Object.entries(orders)
            .filter(([_, orderData]) => {
                console.log('Order ShipperId:', orderData.shipperId, typeof orderData.shipperId);
                return Number(orderData.shipperId) === Number(userData.idUser);
            })
            .map(([orderId, orderData]) => ({
                orderId,
                ...orderData
            }));
        console.log('Assigned Orders:', assignedOrders);
            
        res.status(200).json({
            orders: assignedOrders
        });
    } catch (error) {
        console.error('Error getting assigned orders:', error);
        res.status(500).json({
            error: error.message || 'Failed to get assigned orders'
        });
    }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                error: 'Status is required'
            });
        }

        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        const orderData = snapshot.val();

        if (!orderData) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        // Lấy thông tin user từ bảng users
        const email = req.user.email;
        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const userRef = db.ref(`users/${encodedEmail}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.idUser) {
            return res.status(403).json({
                error: 'User information not found'
            });
        }

        // Kiểm tra xem đơn hàng có được phân công cho shipper với shipperId = idUser không
        if (!orderData.shipperId || orderData.shipperId !== userData.idUser) {
            return res.status(403).json({
                error: 'You are not assigned to this order'
            });
        }

        await orderRef.update({ status: status });
        res.status(200).json({
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            error: error.message || 'Failed to update order status'
        });
    }
};

// Xem chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        const orderData = snapshot.val();

        if (!orderData) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        // Lấy thông tin user từ bảng users
        const email = req.user.email;
        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const userRef = db.ref(`users/${encodedEmail}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.idUser) {
            return res.status(403).json({
                error: 'User information not found'
            });
        }

        // Kiểm tra xem đơn hàng có được phân công cho shipper với shipperId = idUser không
        if (!orderData.shipperId || orderData.shipperId !== userData.idUser) {
            return res.status(403).json({
                error: 'You are not assigned to this order'
            });
        }

        res.status(200).json({
            order: {
                orderId,
                ...orderData
            }
        });
    } catch (error) {
        console.error('Error getting order details:', error);
        res.status(500).json({
            error: error.message || 'Failed to get order details'
        });
    }
};

export { getAssignedOrders, updateOrderStatus, getOrderDetails };