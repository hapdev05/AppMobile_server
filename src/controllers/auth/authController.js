import admin from "../../config/firebase.js"
import user from "../../models/auth/userModel.js"

const register = async(req,res) =>{
    try {
        const {idUser, email, password} = req.body;
        const userRecord = await admin.auth().user({
            idUser,
            email,
            password,
            displayName: email
        })
        const userData = await user(userRecord.idUser,email,password)
        res.status(201).json({message: "Create account successful!",user: userData})
    } catch (error) {
        res.status(400).json({error: error.message})
    } 
}
export default register