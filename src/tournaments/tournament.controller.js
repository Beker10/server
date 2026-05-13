import Tournament from './tournament.model.js';
import Post from '../posts/post.model.js';
import User from '../users/user.model.js';

export const createTournament = async (req, res) => {
    try {
        const { name } = req.body;
        
        const user = await User.findById(req.uid);

        if (!user || user.username !== 'x_gaspar_08') {
             return res.status(403).json({ success: false, message: 'No tienes permisos para crear torneos.' });
        }

        const tournament = new Tournament({ name, createdBy: user._id });
        await tournament.save();

        // Crear publicación en noticias
        const post = new Post({
             title: `Nuevo Torneo Creado: ${name}`,
             content: `Se ha creado el nuevo torneo ${name}. ¡Prepárense para la fase de grupos, octavos, semis y la gran final!`,
             author: user._id
        });
        await post.save();

        res.status(201).json({ success: true, tournament });
    } catch(err) {
        console.error("Error creating tournament:", err);
        res.status(500).json({ success: false, message: 'Error creando torneo', error: err.message });
    }
};

export const getTournaments = async (req, res) => {
   try {
       const tournaments = await Tournament.find().populate('createdBy', 'username');
       res.status(200).json({ success: true, tournaments });
   } catch(err) {
       res.status(500).json({ success: false, message: 'Error obteniendo torneos' });
   }
};
