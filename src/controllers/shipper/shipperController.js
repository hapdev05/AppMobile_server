import { db } from '../../config/firebase.js';

// Cập nhật vị trí của shipper cho một đơn hàng
const updateShipperLocation = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp vị trí (latitude và longitude)'
            });
        }

        const orderRef = db.ref(`orders/${orderId}`);
        const snapshot = await orderRef.once('value');
        const orderData = snapshot.val();

        if (!orderData) {
            return res.status(404).json({
                error: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra xem shipper có được phân công cho đơn hàng này không
        if (Number(orderData.shipperId) !== Number(req.user.idUser)) {
            return res.status(403).json({
                error: 'Bạn không được phân công cho đơn hàng này'
            });
        }

        // Cập nhật vị trí shipper
        await orderRef.update({
            shipperLocation: {
                latitude,
                longitude,
                updatedAt: Date.now()
            }
        });

        res.status(200).json({
            message: 'Đã cập nhật vị trí thành công'
        });
    } catch (error) {
        console.error('Error updating shipper location:', error);
        res.status(500).json({
            error: error.message || 'Không thể cập nhật vị trí'
        });
    }
};

// Cập nhật vị trí của shipper định kỳ (mỗi phút)
const updateShipperLocationPeriodic = async (req, res) => {
    try {
        console.log('Received location update request with body:', JSON.stringify(req.body));
        
        // Handle both formats: {latitude, longitude} or {location: {lat, long}}
        let latitude, longitude;
        
        if (req.body.location) {
            // Format from client: {location: {lat, long}}
            latitude = req.body.location.lat;
            longitude = req.body.location.long;
        } else {
            // Original format: {latitude, longitude}
            latitude = req.body.latitude;
            longitude = req.body.longitude;
        }
        
        const timestamp = req.body.timestamp;

        console.log('Processed location data:', { latitude, longitude, timestamp });

        if (!latitude || !longitude) {
            console.log('Missing location data');
            return res.status(400).json({
                error: 'Vui lòng cung cấp vị trí (latitude/lat và longitude/long)'
            });
        }

        // Lấy thông tin user từ middleware
        const email = req.user.email;
        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const shipperId = req.user.idUser;
        
        console.log('Updating location for user:', encodedEmail, 'with ID:', shipperId);
        
        // Tạo dữ liệu vị trí
        const locationData = {
            latitude,
            longitude,
            updatedAt: timestamp ? new Date(timestamp).getTime() : Date.now()
        };
        
        console.log('Location data to be saved:', locationData);
        
        // Không cần cập nhật vị trí hiện tại của shipper vào một đơn hàng cụ thể
        // vì chúng ta sẽ cập nhật cho tất cả các đơn hàng được gán cho shipper này
        
        console.log('Preparing to update location for all assigned orders');
        
        // Cập nhật vị trí shipper cho tất cả các đơn hàng đang được shipper này giao
        const ordersRef = db.ref('orders');
        const snapshot = await ordersRef.once('value');
        const orders = snapshot.val();
        
        // Khởi tạo mảng để lưu các promise cập nhật vị trí
        const updatePromises = [];
        
        if (orders) {
            console.log('Checking orders for shipper ID:', shipperId);
            
            Object.entries(orders).forEach(([orderId, orderData]) => {
                console.log(`Checking order ${orderId} - shipperId: ${orderData.shipperId}, status: ${orderData.status}`);
                // Kiểm tra nếu đơn hàng được giao bởi shipper này và đang trong trạng thái đang giao hoặc đã duyệt
                if (Number(orderData.shipperId) === Number(shipperId) && 
                    (orderData.status === 'delivering' || orderData.status === 'approved' || orderData.status === 'Đang giao' || orderData.status === 'Đang vận chuyển')) {
                    console.log('Updating location for order:', orderId);
                    const orderRef = db.ref(`orders/${orderId}`);
                    // Cập nhật vị trí shipper trong đơn hàng với đúng cấu trúc
                    updatePromises.push(orderRef.update({
                        shipperLocation: {
                            latitude: locationData.latitude,
                            longitude: locationData.longitude,
                            updatedAt: locationData.updatedAt
                        }
                    }));
                }
            });
            
            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
                console.log('Updated location for', updatePromises.length, 'orders');
            } else {
                console.log('No orders found for this shipper with appropriate status');
            }
        }

        // Trả về kết quả thành công
        let updatedCount = 0;
        if (orders) {
            updatedCount = updatePromises ? updatePromises.length : 0;
        }
        
        res.status(200).json({
            message: 'Đã cập nhật vị trí shipper thành công',
            updatedOrders: updatedCount,
            location: {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                updatedAt: locationData.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating shipper location:', error);
        res.status(500).json({
            error: error.message || 'Không thể cập nhật vị trí shipper'
        });
    }
};

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

export { getAssignedOrders, updateOrderStatus, getOrderDetails, updateShipperLocation, updateShipperLocationPeriodic };