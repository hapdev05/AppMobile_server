import { db } from "../../config/firebase.js"

const encodeEmail = (email) => {
    return email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
};

const getNextUserId = async () => {
    const counterRef = db.ref('counters/userId');
    const snapshot = await counterRef.once('value');
    const currentId = snapshot.val() || 0;
    const nextId = currentId + 1;
    await counterRef.set(nextId);
    return nextId;
};

const createUser = async (userName, firebaseUid, email, password, role = 'customer') => {
    try {
        const idUser = await getNextUserId();
        const encodedEmail = encodeEmail(email);
        const userRef = db.ref(`users/${encodedEmail}`);

        const userData = {
            idUser: idUser,
            firebaseUid: firebaseUid,
            userName: userName,
            email: email,
            password: password,
            role: role, // Mặc định là customer
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await userRef.set(userData);
        console.log("Create account successful");
        return userData;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

const loginUser = {
    async findByUsernameAndPassword(username, password) {
        try {
            const usersRef = db.ref('users');
            const snapshot = await usersRef.once('value');
            const users = snapshot.val();
            
            if (!users) {
                throw new Error('Invalid username or password');
            }

            for (const key in users) {
                const user = users[key];
                if (user.userName === username && user.password === password) {
                    return user;
                }
            }
            
            throw new Error('Invalid username or password');
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
};

const updateUserRole = async (email, newRole) => {
    try {
        const encodedEmail = encodeEmail(email);
        const userRef = db.ref(`users/${encodedEmail}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();

        if (!userData) {
            throw new Error('User not found');
        }

        await userRef.update({ role: newRole });
        return { ...userData, role: newRole };
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

const getAllUsers = async () => {
    try {
        const usersRef = db.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val();
        
        if (!users) {
            return [];
        }

        return Object.values(users);
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export default { createUser, loginUser, updateUserRole, getAllUsers };