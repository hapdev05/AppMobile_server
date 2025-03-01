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

const createUser = async (userName, firebaseUid, email, password) => {
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

export default createUser;