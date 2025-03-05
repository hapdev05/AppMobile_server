import admin from "../../config/firebase.js"
import userModel from "../../models/auth/userModel.js"

const register = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: userName
        });
        await userModel.createUser(userName, userRecord.uid, email, password);
        res.status(201).json({
            message: "Create account successful!",
            user: {
                uid: userRecord.uid,
                email: email,
                userName: userName
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({
            error: error.message || 'Failed to create user'
        });
    } 
};

const login = async (req, res) => {
    const { userName, password } = req.body;
    if(!userName || !password) {
        return res.status(400).json({
            error: 'Username and password are required'
        });
    }
    try {
        const userLogin = await userModel.loginUser.findByUsernameAndPassword(userName, password);
        res.status(200).json({
            message: "Login successful!",
            user: userLogin
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(401).json({
            error: 'Invalid credentials'
        });
    }
};

// Admin functions
const updateUserRole = async (req, res) => {
    try {
        const { email, newRole } = req.body;
        const { role } = req.user; // Từ middleware checkAdmin

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

const getAllUsers = async (req, res) => {
    try {
        const { role } = req.user; // Từ middleware checkAdmin

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

export default { register, login, updateUserRole, getAllUsers };