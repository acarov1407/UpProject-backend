import User from "../models/User.js";
import Project from "../models/Project.js";
import { generateId } from "../helpers/generateId.js";
import { generateJWT } from "../helpers/generateJWT.js";
import { sendRegisterEmail, sendRecoverPasswordEmail } from "../helpers/emails.js";

const register = async (req, res) => {

    const { email } = req.body;

    const existUser = await User.findOne({ email });

    if (existUser) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const user = new User(req.body);
        user.token = generateId();
        await user.save();

        //Confirmation email
        const { email, name, token } = user;
        sendRegisterEmail({ email, name, token })

        return res.json({ msg: 'Usuario creado correctamente, Revisa tu Email para confirmar tu cuenta' });

    } catch (error) {
        console.log(error);
    }

}


const confirmToken = async (req, res) => {
    const { token } = req.params;
    const confirmUser = await User.findOne({ token });

    if (!confirmUser) {
        const error = new Error('Token no válido');
        return res.status(403).json({ msg: error.message });
    }


    try {
        confirmUser.confirmed = true;
        confirmUser.token = '';
        await confirmUser.save();
        return res.json({ msg: "Usuario confirmado correctamente" })
    } catch (error) {
        console.log(error);
    }
}

const recoverPass = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    try {
        user.token = generateId();
        await user.save();
        const { name, email, token } = user;
        sendRecoverPasswordEmail({ name, email, token });
        return res.json({ msg: "Hemos enviado un email con las instrucciones" });
    } catch (error) {
        console.log(error);
    }
}

const checkPassToken = async (req, res) => {
    const { token } = req.params;
    const isValidToken = await User.findOne({ token });

    if (!isValidToken) {
        const error = new Error('Token no válido');
        return res.status(404).json({ msg: error.message });
    }

    return res.json({ msg: "Token válido" });

}

const setNewPass = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
        const error = new Error('Token no válido');
        return res.status(404).json({ msg: error.message });
    }

    user.password = password;
    user.token = '';

    try {
        await user.save();
        return res.json({ msg: "Contraseña modificada correctamente" });
    } catch (error) {
        console.log(error);
    }

}

const auth = async (req, res) => {

    const { email, password } = req.body;
    //Check user exists
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    //Check user is confirmed

    if (!user.confirmed) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message });
    }

    //Check password match
    const passMatch = await user.checkPass(password);
    if (!passMatch) {
        const error = new Error('Contraseña Incorrecta');
        return res.status(403).json({ msg: error.message });
    }

    return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateJWT(user._id)
    })
}

const addFavorite = async (req, res) => {
    const { id } = req.body;

    const project = await Project.findById(id);
    const user = await User.findById(req.user._id);

    if (!user) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    if (!project) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({ msg: error.message });
    }


    if (user?.favorites.includes(project._id)) {
        user.favorites.pull(id);
        await user.save();
        return res.json({ status: 'deleted', data: project._id});
    }

    user.favorites.push(id);
    await user.save();
    return res.json({ status: 'added' , data: project});

}
const getFavorites = async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');

    if (!user) {
        const error = new Error('El usuario no existe');
        return res.status(403).json({ msg: error.message });
    }

    return res.json(user.favorites);
}

const profile = async (req, res) => {
    const { user } = req;

    return res.json(user);
}

export {
    register,
    auth,
    confirmToken,
    recoverPass,
    checkPassToken,
    setNewPass,
    profile,
    getFavorites,
    addFavorite
}