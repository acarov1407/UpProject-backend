import express from "express";
import {
    register,
    auth,
    confirmToken,
    recoverPass,
    checkPassToken,
    setNewPass,
    profile,
    getFavorites,
    addFavorite
} from "../controllers/userController.js";

import checkAuth from "../middleware/checkAuth.js";

const userRouter = express.Router();

userRouter.post('/', register);
userRouter.post('/login', auth);
userRouter.get('/confirm/:token', confirmToken);
userRouter.post('/recover-password', recoverPass);
userRouter.route('/recover-password/:token').get(checkPassToken).post(setNewPass);
userRouter.get('/profile', checkAuth, profile);
userRouter.get('/favorites', checkAuth, getFavorites);
userRouter.post('/favorites', checkAuth, addFavorite);
export default userRouter;