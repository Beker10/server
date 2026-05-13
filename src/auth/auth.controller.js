import User from '../users/user.model.js'
import { hash, verify } from 'argon2'
import { generarJWT } from "../../helpers/JWT-generate.js"

export const register = async (req, res) => {
    try {
        const data = req.body
        console.log("Registration attempt with data:", data)

        let profilePicture = req.fileRelativePath || 'perfil/default-avatar.png'
        console.log("Profile picture path:", profilePicture)
        const encryptedPassword = await hash(data.password)

        const newUser = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email,
            password: encryptedPassword,
            profilePicture
        })
        return res.status(200).json({
            message: "Usuario registrado correctamente",
            userDetails: {
                User: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al registrar el usuario',
            err: error.message
        })
    }
}
export const login = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // Check if the input is an email or username
        // The frontend might send { username: "email@example.com", password: "..." }
        // or { email: "email@example.com", ... }
        // We need to handle both cases robustly.

        const loginIdentifier = (username || email || '').trim();
        const lowerIdentifier = loginIdentifier.toLowerCase();

        const user = await User.findOne({
            $or: [{ email: lowerIdentifier }, { username: lowerIdentifier }],
        });

        if (!user) {
            console.log("Login failed: User not found for", lowerIdentifier);
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            console.log("Login failed: Invalid password for user ID:", user.id);
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = await generarJWT(user.id, user.email);

        return res.status(200).json({
            message: "inicio e sesión exitoso",
            userDetails: {
                username: user.username,
                token: token,
                profilePicture: user.profilePicture,
                uid: user.id,
                role: user.role
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error del servidor",
            error: error.message,
        });
    }
};
