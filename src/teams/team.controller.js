import Team from './team.model.js';
import TeamMembership from './team-membership.model.js';
import User from '../users/user.model.js';
import { deleteImageFromCloudinary } from '../../helpers/delete-cloudinary-image.js';

// Create a new team
export const createTeam = async (req, res) => {
    try {
        const { name, description, secondaryAdmins, players, tournament } = req.body;
        const userId = req.uid; // From validateJWT
        const logo = req.fileRelativePath; // From processFileUpload

        let parsedSecondaryAdmins = secondaryAdmins;
        let parsedPlayers = players;

        try {
            if (typeof secondaryAdmins === 'string') parsedSecondaryAdmins = JSON.parse(secondaryAdmins);
            if (typeof players === 'string') parsedPlayers = JSON.parse(players);
        } catch (e) {
            console.error("Error parsing JSON fields:", e);
        }

        // Validación: Campos obligatorios
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                msg: 'El nombre del equipo es obligatorio y no puede estar vacío'
            });
        }

        // Validación: Longitud del nombre
        if (name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                msg: 'El nombre del equipo debe tener al menos 3 caracteres'
            });
        }

        if (name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                msg: 'El nombre del equipo no puede exceder los 50 caracteres'
            });
        }

        // Validación: Caracteres especiales permitidos (letras, números, espacios, guiones, guiones bajos)
        const nameRegex = /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑüÜ]+$/;
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({
                success: false,
                msg: 'El nombre del equipo contiene caracteres no permitidos. Solo se permiten letras, números, espacios, guiones y guiones bajos'
            });
        }

        // Validación: Descripción opcional pero con límite
        if (description && description.trim().length > 200) {
            return res.status(400).json({
                success: false,
                msg: 'La descripción no puede exceder los 200 caracteres'
            });
        }

        // Validación: Verificar equipos duplicados (case-insensitive)
        const existingTeam = await Team.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        
        if (existingTeam) {
            return res.status(400).json({
                success: false,
                msg: 'Ya existe un equipo con ese nombre. Por favor, elige un nombre diferente'
            });
        }

        // Validación: Jugadores deben tener foto obligatoria
        if (parsedPlayers && parsedPlayers.length > 0) {
            for (const player of parsedPlayers) {
                if (!player.name || player.name.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        msg: 'Todos los jugadores deben tener un nombre'
                    });
                }
                if (!player.photo || player.photo.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        msg: `El jugador "${player.name}" debe tener una foto obligatoria`
                    });
                }
            }
        }

        // Check if user is already a member of any team (as admin or member)
        console.log('Verificando membresía para usuario:', userId);
        const existingMembership = await TeamMembership.findOne({ user: userId });
        console.log('Membresía existente encontrada:', existingMembership);

        if (existingMembership) {
            return res.status(400).json({
                success: false,
                msg: 'Ya eres miembro de un equipo. Solo puedes pertenecer a un equipo a la vez. Debes salir o ser eliminado de tu equipo actual antes de crear uno nuevo.'
            });
        }

        // 1. Create the Team
        const newTeam = new Team({
            name: name.trim(),
            description: description ? description.trim() : '',
            logo: logo || '',
            secondaryAdmins: parsedSecondaryAdmins || [],
            players: parsedPlayers || [],
            tournament: tournament || undefined
        });
        await newTeam.save();

        // 2. Add creator as ADMIN
        const membership = new TeamMembership({
            team: newTeam._id,
            user: userId,
            role: 'ADMIN'
        });
        await membership.save();

        res.status(201).json({
            success: true,
            msg: '¡Equipo creado exitosamente! 🎉 Tu equipo ha sido registrado en el sistema y ya está listo para participar.',
            team: newTeam
        });

    } catch (error) {
        console.error("Error creating team:", error);
        
        if (error.name === 'ValidationError') {
            // Extraer mensajes de validación específicos
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                msg: 'Error de validación: ' + errorMessages.join(', '),
                errors: error.message
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Error al crear el equipo. Por favor, intenta nuevamente más tarde.',
            error: error.message
        });
    }
};

// Update an existing team
export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, description, secondaryAdmins, players, pts, jj, pg, pe, pp, dg, tournament } = req.body;
        const logo = req.fileRelativePath;

        let parsedSecondaryAdmins = secondaryAdmins;
        let parsedPlayers = players;

        try {
            if (typeof secondaryAdmins === 'string') parsedSecondaryAdmins = JSON.parse(secondaryAdmins);
            if (typeof players === 'string') parsedPlayers = JSON.parse(players);
        } catch (e) {
            console.error("Error parsing JSON fields:", e);
        }

        const updateData = {
            name,
            description,
            secondaryAdmins: parsedSecondaryAdmins,
            players: parsedPlayers,
            pts, jj, pg, pe, pp, dg,
            tournament: tournament || undefined
        };

        if (logo) updateData.logo = logo;

        const oldTeam = await Team.findById(teamId);
        if (!oldTeam) {
            return res.status(404).json({ success: false, msg: 'Equipo no encontrado' });
        }

        // 1. Delete old logo if a new one is uploaded
        if (logo && oldTeam.logo) {
            await deleteImageFromCloudinary(oldTeam.logo);
        }

        // 2. Delete removed players' photos or old photos of updated players
        if (parsedPlayers) {
            for (const oldPlayer of oldTeam.players) {
                const stillExists = parsedPlayers.find(p => p.name === oldPlayer.name);
                if (!stillExists || (stillExists.photo !== oldPlayer.photo)) {
                    if (oldPlayer.photo) await deleteImageFromCloudinary(oldPlayer.photo);
                }
            }
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            updateData,
            { new: true }
        ).populate('secondaryAdmins', 'username');

        res.status(200).json({
            success: true,
            msg: 'Equipo actualizado exitosamente',
            team: updatedTeam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar el equipo',
            error: error.message
        });
    }
};

// Get teams for the current user
export const getMyTeams = async (req, res) => {
    try {
        const userId = req.uid;

        // Find memberships for this user
        const memberships = await TeamMembership.find({ user: userId })
            .populate({
                path: 'team',
                select: 'name logo pts jj pg pe pp dg gf gc secondaryAdmins description tournament currentStage',
                populate: { path: 'secondaryAdmins', select: 'username' }
            });

        // Flatten the response for the frontend
        const teams = memberships
            .filter(m => m.team !== null) // Filter out deleted teams
            .map(m => {
                const teamObj = m.team.toObject();
                return {
                    id: teamObj._id,
                    uid: teamObj._id,
                    team: teamObj.name,
                    admin: req.user?.username || 'Admin', // In a real app we'd populate the primary admin
                    ...teamObj,
                    adminRole: m.role
                };
            });

        res.status(200).json({
            success: true,
            teams
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener equipos',
            error: error.message
        });
    }
};

// Add a member to the team (Default: Member)
export const addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body; // ID of user to add

        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
        }

        // Check if already a member of THIS team
        const existingMember = await TeamMembership.findOne({ team: teamId, user: userId });
        if (existingMember) {
            return res.status(400).json({ success: false, msg: 'El usuario ya pertenece al equipo' });
        }

        // Check if user is already a member of ANY other team
        const existingMembership = await TeamMembership.findOne({ user: userId });
        if (existingMembership) {
            return res.status(400).json({
                success: false,
                msg: 'El usuario ya pertenece a otro equipo. Debe salir o ser eliminado de su equipo actual antes de unirse a uno nuevo.'
            });
        }

        const newMember = new TeamMembership({
            team: teamId,
            user: userId,
            role: 'MEMBER'
        });

        await newMember.save();

        res.status(200).json({
            success: true,
            msg: 'Usuario agregado exitosamente',
            member: newMember
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al agregar miembro',
            error: error.message
        });
    }
};

// Change member role
export const changeRole = async (req, res) => {
    try {
        const { teamId, memberId } = req.params; // memberId is the User ID to update
        const { newRole } = req.body;

        if (!['MEMBER', 'ADMIN'].includes(newRole)) {
            return res.status(400).json({ success: false, msg: 'Rol inválido' });
        }

        // RULE: Max 2 Admins
        if (newRole === 'ADMIN') {
            const adminCount = await TeamMembership.countDocuments({ team: teamId, role: 'ADMIN' });
            if (adminCount >= 2) {
                return res.status(400).json({
                    success: false,
                    msg: 'No se puede asignar el rol. Máximo 2 administradores permitidos por equipo.'
                });
            }
        }

        // Update the membership
        const updatedMembership = await TeamMembership.findOneAndUpdate(
            { team: teamId, user: memberId },
            { role: newRole },
            { new: true }
        );

        if (!updatedMembership) {
            return res.status(404).json({ success: false, msg: 'Miembro no encontrado en este equipo' });
        }

        res.status(200).json({
            success: true,
            msg: 'Rol actualizado exitosamente',
            member: updatedMembership
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al cambiar rol',
            error: error.message
        });
    }
};

// Delete Team
export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, msg: 'Equipo no encontrado' });
        }

        // 1. Delete Team Logo from Cloudinary
        if (team.logo) {
            await deleteImageFromCloudinary(team.logo);
        }

        // 2. Delete all players' photos from Cloudinary
        if (team.players && team.players.length > 0) {
            for (const player of team.players) {
                if (player.photo) {
                    await deleteImageFromCloudinary(player.photo);
                }
            }
        }

        // Delete all memberships first
        await TeamMembership.deleteMany({ team: teamId });

        // Delete the team
        await Team.findByIdAndDelete(teamId);

        res.status(200).json({
            success: true,
            msg: 'Equipo eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar el equipo',
            error: error.message
        });
    }
};

// LIST MEMBERS
export const getTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const members = await TeamMembership.find({ team: teamId }).populate('user', 'name surname email username role profilePicture');

        res.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener miembros',
            error: error.message
        });
    }
};

// REMOVE MEMBER
export const removeMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.params;

        // Prevent removing the last admin? (Optional but good practice)
        // For now simple removal

        const result = await TeamMembership.findOneAndDelete({ team: teamId, user: memberId });

        if (!result) {
            return res.status(404).json({ success: false, msg: 'Miembro no encontrado' });
        }

        res.status(200).json({
            success: true,
            msg: 'Miembro eliminado del equipo'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar miembro',
            error: error.message
        });
    }
};

// GET ALL TEAMS (For public standings)
export const getTeams = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const teams = await Team.find()
            .select('name logo pts jj pg pe pp dg gf gc secondaryAdmins description tournament currentStage')
            .sort({ pts: -1, dg: -1, gf: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Team.countDocuments();

        res.status(200).json({
            teams,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener todos los equipos',
            error: error.message
        });
    }
};

export const getAdvancedStats = async (req, res) => {
    try {
        const teams = await Team.find();

        // 1. Team Stats
        const mostGoalsTeam = [...teams].sort((a, b) => b.gf - a.gf)[0];
        const leastGoalsConcededTeam = [...teams].sort((a, b) => a.gc - b.gc)[0];

        // 2. Individual Stats
        let allPlayers = [];
        teams.forEach(t => {
            t.players.forEach(p => {
                allPlayers.push({ ...p.toObject(), teamName: t.name });
            });
        });

        const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 5);
        const mvpRanking = [...allPlayers].sort((a, b) => b.mvpCount - a.mvpCount).slice(0, 5);

        // Portero menos vencido (Lowest goalsAgainst for someone in 'Portero' position)
        const bestGoalkeepers = [...allPlayers]
            .filter(p => p.position === 'Portero')
            .sort((a, b) => (a.goalsAgainst || 0) - (b.goalsAgainst || 0))
            .slice(0, 5);

        res.status(200).json({
            mostGoalsTeam,
            leastGoalsConcededTeam,
            topScorers,
            mvpRanking,
            bestGoalkeepers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener estadísticas avanzadas',
            error: error.message
        });
    }
};

// Advance teams from one stage to another based on ranking
export const advanceTeams = async (req, res) => {
    try {
        const { limit = 16 } = req.body;

        // Only teams currently in Group Stage
        const teamsInGroups = await Team.find({ currentStage: 'Fase de Grupos' })
            .sort({ pts: -1, dg: -1 })
            .limit(limit);

        const teamIds = teamsInGroups.map(t => t._id);

        await Team.updateMany(
            { _id: { $in: teamIds } },
            { currentStage: 'Octavos' }
        );

        res.status(200).json({
            success: true,
            msg: `${teamsInGroups.length} equipos avanzados a Octavos exitosamente`,
            advancedTeams: teamsInGroups.map(t => t.name)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al avanzar equipos',
            error: error.message
        });
    }
};

export const getPlayerCard = async (req, res) => {
    try {
        const { playerName } = req.params;
        const targetName = decodeURIComponent(playerName);
        const team = await Team.findOne({ 'players.name': targetName });

        if (!team) return res.status(404).json({ message: 'Jugador no encontrado' });

        const player = team.players.find(p => p.name === targetName);

        res.status(200).json({
            player: {
                ...player.toObject(),
                teamName: team.name,
                teamLogo: team.logo,
                teamId: team._id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener carta de jugador', error: error.message });
    }
};

export const toggleAward = async (req, res) => {
    try {
        const { teamId, playerName, award } = req.body;
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Equipo no encontrado' });

        const player = team.players.find(p => p.name === playerName);
        if (!player) return res.status(404).json({ message: 'Jugador no encontrado' });

        if (!player.awards) player.awards = [];
        const awardIndex = player.awards.indexOf(award);
        if (awardIndex > -1) {
            player.awards.splice(awardIndex, 1);
        } else {
            player.awards.push(award);
        }

        await team.save();
        res.status(200).json({ message: 'Insignia actualizada', awards: player.awards });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar insignia', error: error.message });
    }
};

export const playerPhotoUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, msg: 'No se subió ninguna imagen' });
        }

        res.status(200).json({
            success: true,
            msg: 'Foto de jugador subida exitosamente',
            url: req.fileRelativePath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al subir la foto del jugador',
            error: error.message
        });
    }
};

// Add a single player to a team
export const addPlayer = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, position, number, goals, assists, mvpCount, photo } = req.body;

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, msg: 'Equipo no encontrado' });
        }

        // Check if player with same name already exists in team
        const existingPlayer = team.players.find(p => p.name === name);
        if (existingPlayer) {
            return res.status(400).json({ success: false, msg: 'El jugador ya existe en este equipo' });
        }

        // Add new player
        const newPlayer = {
            name,
            position: position || 'Sin posición',
            number: number || 0,
            goals: goals || 0,
            assists: assists || 0,
            mvpCount: mvpCount || 0,
            photo: photo || ''
        };

        team.players.push(newPlayer);
        await team.save();

        res.status(201).json({
            success: true,
            msg: 'Jugador agregado exitosamente',
            player: newPlayer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al agregar jugador',
            error: error.message
        });
    }
};
