import User from '../src/users/user.model.js'
import Post from '../src/posts/post.model.js'

export const emailExist = async (email = '') => {
    const existe = await User.findOne({ email })

    if (existe) {
        throw new Error('El email ya está registrado')
    }
}

export const usernameExist = async (username = '') => {
    const existe = await User.findOne({ username })

    if (existe) {
        throw new Error('El nombre de usuario ya está registrado')
    }
}
export const existePost = async (id = '') => {
    const existe = await Post.findOne({ id })

    if (existe) {
        throw new Error(`El post con ID ${id} no existe`)
    }
}