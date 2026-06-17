import User from '../users/user.model.js'
import { hash, verify } from 'argon2'
import { generarJWT } from "../../helpers/JWT-generate.js"

export const register = async (req, res) => {
    try {
        const data = req.body
        console.log("Registration attempt with data:", data)

        // Lista de correos que tienen rol de ADMIN
        const adminEmails = [
            'direccionacademica@sanjudastadeo.edu.gt',
            'basicos@sanjudastadeo.edu.gt',
            'academica@sanjudastadeo.edu.gt',
            'deportes@sanjudastadeo.edu.gt',
            'javierovalle@sanjudastadeo.edu.gt',
            'westindiaz552@gmail.com',
            'Eduaguilar522@gmail.com',
            'carloseq2007@gmali.com',
            'chavezzetino@gmail.com',
            'julianalbizures19@gmail.com',
            'bekerdiaz668@gmail.com'
        ]

        // Lista de correos de gmail permitidos como excepción
        const allowedGmailEmails = [
            'westindiaz552@gmail.com',
            'Eduaguilar522@gmail.com',
            'carloseq2007@gmali.com',
            'chavezzetino@gmail.com',
            'julianalbizures19@gmail.com',
            'bekerdiaz668@gmail.com'
        ]

        const emailLower = data.email.toLowerCase()

        // Validar que el correo tenga el dominio @sanjudastadeo.edu.gt o esté en la lista de excepciones de gmail
        const isSanJudasEmail = emailLower.endsWith('@sanjudastadeo.edu.gt')
        const isAllowedGmail = allowedGmailEmails.includes(emailLower)

        if (!isSanJudasEmail && !isAllowedGmail) {
            return res.status(403).json({
                message: 'Solo se permiten correos institucionales @sanjudastadeo.edu.gt'
            })
        }

        let profilePicture = req.fileRelativePath || 'perfil/default-avatar.png'
        console.log("Profile picture path:", profilePicture)
        const encryptedPassword = await hash(data.password)

        // Determinar el rol basado en si el correo está en la lista de admins
        const role = adminEmails.includes(emailLower) ? 'ADMIN_ROLE' : 'USER_ROLE'

        const newUser = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email,
            password: encryptedPassword,
            profilePicture,
            role
        })
        return res.status(200).json({
            message: "Usuario registrado correctamente",
            userDetails: {
                User: newUser.username,
                email: newUser.email,
                role: newUser.role
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
