import { db } from "../../config/firebase.js"
const user = (idUser,email, password) =>{
    const useRef = db.ref("user/"+ idUser) ;
    useRef.set({
        idUser: idUser,
        email: email,
        password: password
    })
    .then(()=>{
        console.log("Creat account successful");
        
    })
    .catch((erro)=>{
        console.log("erro:" + erro);
        
    })
}
 user(1,"hoang@gmail.com","HoangAnhPhi")

 export default user