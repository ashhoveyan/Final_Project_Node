import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

const { SECRET_FOR_JWT} = process.env;


const auth = async (req, res, next) => {

    const token = req.headers.authorization;
    console.log('Token received by server:', token)

    if (!token) {
        return res.status(401).json({message: 'Unauthorized!'})
    }

    try {
        const decryptedData = jwt.verify(token, SECRET_FOR_JWT)

        console.log(decryptedData);

        const user = await Users.findByPk(decryptedData.id, {raw: true});

        if (!user) {
            res.status(401).json({
                message: 'User not found',
            });
            return;
        }

        req.user = user;
        next()
    } catch (error) {
        console.error(error.message)
        return res.status(501).json({message: error.message});

    }
}
export default auth