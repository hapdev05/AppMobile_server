import admin from "../../config/firebase.js"
import createUser from "../../models/auth/userModel.js"

const register = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: userName
        });
        await createUser(userName, userRecord.uid, email, password);
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
}

export default register