import Users from '../models/Users.js';

const checkAdmin = async (req, res, next) => {

    try {
        const user = req.user;
        const userIsExists = await Users.findByPk(user.id);

        if (!user ) {
            return res.status(401).json({
                message: 'Unauthorized: User is not authenticated',
            })
        }
        console.log(user)
        if (!userIsExists || userIsExists.type !== 'admin') {
            return res.status(403).json({
                message: 'Forbidden: User does not have admin privileges'
            })
        }
        next()

    }catch(error) {
        console.error('Error in checkAdmin middleware:', error);
        return res.status(500).json(
            { message: 'Internal Server Error' }
        );
    }

}

export default checkAdmin;