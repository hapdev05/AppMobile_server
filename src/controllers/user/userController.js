import { db } from '../../config/firebase.js';

// Lấy thông tin người dùng và thống kê đơn hàng
const getUserInfo = async (req, res) => {
    try {
        const { username, role } = req.user;
        
        // Lấy tất cả đơn hàng
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.once('value');
        const orders = snapshot.val();
        
        // Nếu không có đơn hàng nào
        if (!orders) {
            return res.status(200).json({
                username: role === 'customer' ? req.user.username : req.user.email,
                pendingOrders: 0,
                completedOrders: 0,
                totalOrders: 0
            });
        }
        
        // Xử lý dựa trên vai trò người dùng
        if (role === 'customer') {
            const { username } = req.user;
            
            // Lọc đơn hàng của khách hàng
            const customerOrders = Object.values(orders).filter(order => order.username === username);
            
            // Đếm số đơn hàng theo trạng thái
            const pendingOrders = customerOrders.filter(order => 
                order.status !== 'delivered' && 
                order.status !== 'completed' && 
                order.status !== 'Đã giao' && 
                order.status !== 'Hoàn thành'
            ).length;
            
            const completedOrders = customerOrders.filter(order => 
                order.status === 'delivered' || 
                order.status === 'completed' || 
                order.status === 'Đã giao' || 
                order.status === 'Hoàn thành'
            ).length;
            
            return res.status(200).json({
                username,
                pendingOrders,
                completedOrders,
                totalOrders: customerOrders.length
            });
        } else if (role === 'shipper') {
            const { idUser } = req.user;
            
            // Lọc đơn hàng của shipper
            const shipperOrders = Object.values(orders).filter(order => 
                Number(order.shipperId) === Number(idUser)
            );
            
            // Đếm số đơn hàng theo trạng thái
            const deliveringOrders = shipperOrders.filter(order => 
                order.status === 'delivering' || 
                order.status === 'approved' || 
                order.status === 'Đang giao' || 
                order.status === 'Đang vận chuyển'
            ).length;
            
            const completedOrders = shipperOrders.filter(order => 
                order.status === 'delivered' || 
                order.status === 'completed' || 
                order.status === 'Đã giao' || 
                order.status === 'Hoàn thành'
            ).length;
            
            return res.status(200).json({
                username: req.user.username,
                deliveringOrders,
                completedOrders,
                totalOrders: shipperOrders.length
            });
        } else {
            return res.status(403).json({
                error: 'Vai trò không hợp lệ'
            });
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            error: error.message || 'Không thể lấy thông tin người dùng'
        });
    }
};

export { getUserInfo };