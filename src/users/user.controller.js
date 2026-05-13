import User from './user.model.js'
import { hash, verify } from 'argon2'
import { deleteImageFromCloudinary } from '../../helpers/delete-cloudinary-image.js';

export const updateProfile = async (req, res) => {
    try {
        const { uid } = req;
        const { username } = req.body;
        let profilePicture = req.fileRelativePath;

        const updateData = {};
        if (username) updateData.username = username;
        
        if (profilePicture) {
            const user = await User.findById(uid);
            if (user && user.profilePicture) {
                await deleteImageFromCloudinary(user.profilePicture);
            }
            updateData.profilePicture = profilePicture;
        }

        const user = await User.findByIdAndUpdate(uid, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({
            message: "Perfil actualizado correctamente",
            userDetails: {
                username: user.username,
                profilePicture: user.profilePicture,
                role: user.role,
                uid: user._id
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el perfil',
            error: error.message
        });
    }
}

export const updateEmail = async (req, res) => {
    try {
        const { uid } = req;
        const { newEmail, currentPassword } = req.body;

        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const validPassword = await verify(user.password, currentPassword);
        if (!validPassword) {
            return res.status(401).json({ message: "Contraseña actual incorrecta" });
        }

        user.email = newEmail;
        await user.save();

        return res.status(200).json({
            message: "Email actualizado correctamente",
            email: user.email
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el email',
            error: error.message
        });
    }
}

export const sendVerificationCode = async (req, res) => {
    try {
        const { uid } = req;
        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = code;
        user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        // SIMULACIÓN de envío de correo
        console.log(`-----------------------------------------------`);
        console.log(`CÓDIGO DE VERIFICACIÓN PARA ${user.email}: ${code}`);
        console.log(`-----------------------------------------------`);

        return res.status(200).json({
            message: "Código de verificación enviado a tu correo registrado"
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al enviar el código',
            error: error.message
        });
    }
}

export const changePasswordWithCode = async (req, res) => {
    try {
        const { uid } = req;
        const { code, newPassword } = req.body;

        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (user.resetCode !== code || user.resetCodeExpires < new Date()) {
            return res.status(400).json({ message: "Código inválido o expirado" });
        }

        user.password = await hash(newPassword);
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar la contraseña',
            error: error.message
        });
    }
}

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json({ users: [] });

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).limit(10).select('username email name surname');

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error al buscar usuarios',
            error: error.message
        });
    }
}

export const verifyCurrentPassword = async (req, res) => {
    try {
        const { uid } = req;
        const { currentPassword } = req.body;

        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const validPassword = await verify(user.password, currentPassword);
        if (!validPassword) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        return res.status(200).json({
            message: "Contraseña verificada"
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al verificar la contraseña',
            error: error.message
        });
    }
}

export const changePasswordDirect = async (req, res) => {
    try {
        const { uid } = req;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const validPassword = await verify(user.password, currentPassword);
        if (!validPassword) {
            return res.status(401).json({ message: "Contraseña actual incorrecta" });
        }

        user.password = await hash(newPassword);
        await user.save();

        return res.status(200).json({
            message: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar la contraseña',
            error: error.message
        });
    }
}
