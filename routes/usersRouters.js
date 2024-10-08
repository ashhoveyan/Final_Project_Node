import { Router } from 'express';

import validate from '../middlewares/validate.js';
import authenticate from '../middlewares/auth.js';
import fileUpload    from "../middlewares/fileUpload.js";

import userSchema from '../schemas/usersSchema.js';
import userController from '../controllers/usersController.js';

const router = Router();

//apis

router.post("/registration",
	fileUpload.single('avatar'),
	validate(userSchema.registration,'body'),
	userController.registration
);

router.get('/activate',
	validate(userSchema.activate,'query'),
	userController.activate
);

router.post("/login",
	validate(userSchema.login,'body'),
	userController.login
);

router.get("/profile",
	authenticate,
	userController.userProfile
);

router.post('/password/recovery',
	userController.recoveryPassword
);

router.put('/password/update',
	userController.updatePassword
);

router.get('/statistics',
	userController.usersList
)

export default router;
