import userModel from '../models/auth/userModel.js';

const checkAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization header'
            });
        }

        // Lấy email từ token (giả sử bạn đã có logic xử lý token)
        const email = req.user.email;
        
        // Kiểm tra user trong database
        const encodedEmail = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
        const userRef = db.ref(`users/${encodedEmail}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();

        if (!userData || userData.role !== 'admin') {
            return res.status(403).json({
                error: 'Permission denied. Admin access required.'
            });
        }

        req.user = userData;
        next();
    } catch (error) {
        console.error('Error in admin middleware:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export { checkAdmin };
