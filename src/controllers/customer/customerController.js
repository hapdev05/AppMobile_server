import { db } from '../../config/firebase.js';

// Lấy danh sách đơn hàng của khách hàng
const getCustomerOrders = async (req, res) => {
    try {
        const { username } = req.user;
        // Lấy tất cả đơn hàng
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.once('value');
        const orders = snapshot.val();

        if (!orders) {
            return res.status(200).json([]);
        }            
        // Lọc đơn hàng theo username của khách hàng
        const customerOrders = Object.entries(orders)
            .filter(([_, orderData]) => {
                console.log(orderData.sender);
                
                // Kiểm tra nếu username của người gửi trùng với username của khách hàng
                return orderData.username === username;
            })
            .map(([orderId, orderData]) => {
                return {
                    orderId,
                    ...orderData
                };
            });
            
        res.status(200).json(customerOrders);
        console.log(customerOrders);
        
        
    } catch (error) {
        console.error('Error getting customer orders:', error);
        res.status(500).json({
            error: error.message || 'Không thể lấy danh sách đơn hàng'
        });
    }
};

// Lấy chi tiết đơn hàng của khách hàng
const getCustomerOrderDetails = async (req, res) => {
    try {
        const { username } = req.user;
        const { orderId } = req.params;

        // Lấy thông tin đơn hàng
        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        const orderData = snapshot.val();

        if (!orderData) {
            return res.status(404).json({
                error: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra xem đơn hàng có thuộc về khách hàng này không
        if (orderData.sender && orderData.sender.username === username) {
            return res.status(403).json({
                error: 'Bạn không có quyền xem đơn hàng này'
            });
        }

        res.status(200).json({
            orderId,
            ...orderData
        });
    } catch (error) {
        console.error('Error getting customer order details:', error);
        res.status(500).json({
            error: error.message || 'Không thể lấy chi tiết đơn hàng'
        });
    }
};

// Lấy vị trí shipper của đơn hàng
const getShipperLocation = async (req, res) => {
    try {
        const { orderId } = req.params;
        // Lấy thông tin đơn hàng
        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        const orderData = snapshot.val();
        if (!orderData) {
            return res.status(404).json({
                error: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra xem đơn hàng đã được phân công cho shipper chưa
        if (!orderData.shipperId) {
            return res.status(404).json({
                error: 'Đơn hàng chưa được phân công cho shipper'
            });
        }

        // Lấy ETag từ request header
        const clientETag = req.headers['if-none-match'];
        
        // Tạo ETag từ dữ liệu vị trí hiện tại
        const currentETag = orderData.shipperLocation ? 
            Buffer.from(JSON.stringify(orderData.shipperLocation)).toString('base64') : 
            'no-location';
        
        
        // So sánh ETag
        if (clientETag === currentETag) {
            return res.status(304).end();
        }

        // Kiểm tra xem có thông tin vị trí shipper không
        if (!orderData.shipperLocation || !orderData.shipperLocation.latitude || !orderData.shipperLocation.longitude) {
            res.setHeader('ETag', currentETag);
            return res.status(200).json({
                shipperLocation: null,
                message: 'Chưa có thông tin vị trí shipper'
            });
        }

        // Trả về vị trí mới với ETag
        res.setHeader('ETag', currentETag);
        res.status(200).json({
            shipperLocation: orderData.shipperLocation
        });
    } catch (error) {
        console.error('Error getting shipper location:', error);
        res.status(500).json({
            error: error.message || 'Không thể lấy vị trí shipper'
        });
    }
};

export { getCustomerOrders, getCustomerOrderDetails, getShipperLocation };