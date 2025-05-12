import { db } from '../../config/firebase.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const getNextOrderId = async () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const orderId = `${timestamp}-${randomStr}`;

    // Kiểm tra xem orderId đã tồn tại chưa
    const orderRef = db.ref(`orders/${orderId}`);
    const snapshot = await orderRef.once('value');
    
    if (snapshot.exists()) {
        // Nếu đã tồn tại, thử lại với một randomStr mới
        return getNextOrderId();
    }

    return orderId;
};

const saveImage = async (base64String) => {
    try {
        const imgDir = path.join(process.cwd(), 'src', 'data', 'img');
        
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }

        // Tạo tên file duy nhất
        const fileName = `${uuidv4()}.jpg`;
        const filePath = path.join(imgDir, fileName);

        // Xử lý và lưu ảnh
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);

        return `data/img/${fileName}`;
    } catch (error) {
        throw new Error(`Failed to save image: ${error.message}`);
    }
};

const createOrder = async (req, res) => {
    try {
        const {
            description,
            orderName,
            packagePhotos,
            price,
            recipient,
            sender
        } = req.body;

        const username = req.user.userName; // Lấy username từ thông tin người dùng đã xác thực

        // Validate required fields
        const missingFields = [];
        if (!orderName) missingFields.push('orderName');
        if (!price) missingFields.push('price');
        if (!recipient) missingFields.push('recipient');
        if (!sender) missingFields.push('sender');

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate recipient and sender information
        if (!recipient.name || !recipient.phone || !recipient.address ||
            !sender.name || !sender.phone || !sender.address ) {
            return res.status(400).json({
                error: 'Missing recipient or sender information'
            });
        }

        const orderId = await getNextOrderId();
        const orderRef = db.ref(`orders/${orderId}`);

        // Xử lý và lưu các ảnh
        let savedPhotos = [];
        if (packagePhotos) {
            // Chuyển đổi packagePhotos thành mảng nếu nó là chuỗi
            const photosArray = typeof packagePhotos === 'string' ? [packagePhotos] : packagePhotos;
            
            if (Array.isArray(photosArray) && photosArray.length > 0) {
                try {
                    savedPhotos = await Promise.all(
                        photosArray.map(photo => saveImage(photo))
                    );
                } catch (error) {
                    console.error('Error processing photos:', error);
                    return res.status(400).json({
                        error: 'Invalid photo format. Photos must be base64 encoded images.'
                    });
                }
            }
        }

        // Chuyển đổi đường dẫn ảnh thành URL đầy đủ
        const fullPhotos = savedPhotos.map(photo => 
    
            photo.startsWith('http') ? photo : `https://605a-2001-ee0-4b49-c580-797a-942-f6d6-e6f2.ngrok-free.app/${photo}`
        );

        const orderData = {
            orderId,
            description,
            orderName,
            packagePhotos: fullPhotos,
            price,
            recipient,
            sender,
            username,
            status: 'Chờ xác nhận',
            createdAt: new Date().toISOString(),
            shipperLocation: {
                latitude: null,
                longitude: null,
                updatedAt: null
            }
        };

        await orderRef.set(orderData);

        res.status(201).json({
            message: 'Order created successfully',
            order: orderData
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            error: error.message || 'Failed to create order'
        });
    }
};

export { createOrder };