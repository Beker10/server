import Match from './match.model.js';
import Team from '../teams/team.model.js';
import TeamMembership from '../teams/team-membership.model.js';
import { createNotification } from '../notifications/notification.controller.js';

// Helper to recalculate team stats from all finished matches
const recalculateTeamStats = async (teamName) => {
    try {
        const team = await Team.findOne({ name: teamName });
        if (!team) return;

        const finishedMatches = await Match.find({
            status: 'Finalizado',
            $or: [{ teamA: teamName }, { teamB: teamName }]
        });

        let jj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0, pts = 0;

        finishedMatches.forEach(m => {
            jj++;
            const isTeamA = m.teamA === teamName;
            const myScore = isTeamA ? m.scoreA : m.scoreB;
            const oppScore = isTeamA ? m.scoreB : m.scoreA;

            gf += myScore;
            gc += oppScore;

            if (myScore > oppScore) {
                pg++;
                pts += 3;
            } else if (myScore < oppScore) {
                pp++;
            } else {
                pe++;
                pts += 1;
            }
        });

        await Team.findOneAndUpdate({ name: teamName }, {
            jj, pg, pe, pp, gf, gc, pts,
            dg: gf - gc
        });
    } catch (error) {
        console.error(`Error recalculating stats for ${teamName}:`, error);
    }
};

export const createMatch = async (req, res) => {
    try {
        const data = req.body;
        const match = new Match(data);
        await match.save();

        // If created as 'Finalizado', update team statistics
        if (match.status === 'Finalizado') {
            await recalculateTeamStats(match.teamA);
            await recalculateTeamStats(match.teamB);
        }

        res.status(201).json({
            message: 'Partido programado correctamente',
            match
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al programar el partido',
            error: error.message
        });
    }
};

export const getMatches = async (req, res) => {
    try {
        const matches = await Match.find().sort({ date: 1 });
        res.status(200).json({
            matches
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los partidos',
            error: error.message
        });
    }
};

const nextPhaseMap = {
    'Octavos': 'Cuartos',
    'Cuartos': 'Semifinales',
    'Semifinales': 'Finales',
    'Finales': 'Campeón'
};

export const updateMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Find match before updating to check status change
        const oldMatch = await Match.findById(id);
        if (!oldMatch) return res.status(404).json({ message: 'Partido no encontrado' });

        const updatedMatch = await Match.findByIdAndUpdate(id, data, { new: true });

        // If status changed to 'Finalizado' or scores changed in a Finalizado match
        if (updatedMatch.status === 'Finalizado') {
            await recalculateTeamStats(updatedMatch.teamA);
            await recalculateTeamStats(updatedMatch.teamB);

            const { teamA, teamB, scoreA, scoreB, phase } = updatedMatch;

            // Handle progression for Knockout phases (Octavos onwards)
            if (phase !== 'Fase de Grupos' && nextPhaseMap[phase]) {
                const winnerName = scoreA > scoreB ? teamA : (scoreB > scoreA ? teamB : null);
                if (winnerName) {
                    await Team.findOneAndUpdate(
                        { name: winnerName },
                        { currentStage: nextPhaseMap[phase] }
                    );
                }
            }
        } else if (oldMatch.status === 'Finalizado' && updatedMatch.status !== 'Finalizado') {
            // Revert stats if match is no longer finalized
            await recalculateTeamStats(oldMatch.teamA);
            await recalculateTeamStats(oldMatch.teamB);
        }
        // --- PROCESS CARDS AND MVP ---
        const cardsCount = updatedMatch.cards?.length || 0;
        let excitement = 'Bajo';
        const totalGoals = updatedMatch.scoreA + updatedMatch.scoreB; // Use updatedMatch scores
        if (totalGoals >= 5 || (Math.abs(updatedMatch.scoreA - updatedMatch.scoreB) <= 1 && totalGoals >= 4)) excitement = 'Épico';
        else if (totalGoals >= 3 || cardsCount >= 3) excitement = 'Alto';
        else if (totalGoals >= 1) excitement = 'Medio';

        updatedMatch.excitementLevel = excitement;
        await updatedMatch.save();

        // Process Cards
        if (updatedMatch.cards && updatedMatch.cards.length > 0) {
            for (const card of updatedMatch.cards) {
                const team = await Team.findOne({ name: card.team });
                if (team) {
                    const playerIndex = team.players.findIndex(p => p.name === card.player);
                    if (playerIndex !== -1) {
                        if (card.type === 'Yellow') {
                            team.players[playerIndex].yellowCards += 1;
                            if (team.players[playerIndex].yellowCards >= 2) {
                                team.players[playerIndex].isSuspended = true;
                                team.players[playerIndex].yellowCards = 0; // Reset after suspension
                            }
                        } else if (card.type === 'Red') {
                            team.players[playerIndex].isSuspended = true;
                        }
                        await team.save();

                        // Notify admins about suspension
                        if (team.players[playerIndex].isSuspended) {
                            const adminMemberships = await TeamMembership.find({ team: team._id, role: 'ADMIN' });
                            for (const membership of adminMemberships) {
                                await createNotification(
                                    membership.user,
                                    `El jugador ${card.player} ha sido suspendido para el próximo partido.`,
                                    'WARNING'
                                );
                            }
                        }
                    }
                }
            }
        }

        // Process MVP
        if (updatedMatch.mvp) {
            const teams = await Team.find({ name: { $in: [updatedMatch.teamA, updatedMatch.teamB] } });
            for (const team of teams) {
                const playerIndex = team.players.findIndex(p => p.name === updatedMatch.mvp);
                if (playerIndex !== -1) {
                    team.players[playerIndex].mvpCount += 1;
                    await team.save();
                    break;
                }
            }
        }

        res.status(200).json({
            message: 'Partido actualizado correctamente',
            match: updatedMatch
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el partido',
            error: error.message
        });
    }
};

// Also update createMatch to handle this if created as finished
// (Optional but good for consistency)


export const generateFixture = async (req, res) => {
    try {
        const { type } = req.body; // 'RoundRobin', 'Elimination'
        const teams = await Team.find();

        if (teams.length < 2) {
            return res.status(400).json({ message: 'Se necesitan al menos 2 equipos para generar un fixture' });
        }

        const generatedMatches = [];
        const today = new Date();

        if (type === 'RoundRobin') {
            // Simplistic Round Robin (everyone plays everyone once)
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const matchDate = new Date(today);
                    matchDate.setDate(today.getDate() + generatedMatches.length + 1);

                    const match = new Match({
                        teamA: teams[i].name,
                        teamB: teams[j].name,
                        date: matchDate,
                        time: '10:00',
                        phase: 'Fase de Grupos'
                    });
                    await match.save();
                    generatedMatches.push(match);
                }
            }
        } else if (type === 'Elimination') {
            // Direct Elimination (Randomly pair teams for Octavos or Cuartos)
            const shuffledTeams = teams.sort(() => 0.5 - Math.random());
            const pairsCount = Math.floor(teams.length / 2);

            let phase = 'Cuartos';
            if (teams.length > 8) phase = 'Octavos';
            if (teams.length <= 4) phase = 'Semifinales';
            if (teams.length <= 2) phase = 'Final';

            for (let i = 0; i < pairsCount * 2; i += 2) {
                const matchDate = new Date(today);
                matchDate.setDate(today.getDate() + (i / 2) + 1);

                const match = new Match({
                    teamA: shuffledTeams[i].name,
                    teamB: shuffledTeams[i + 1].name,
                    date: matchDate,
                    time: '15:00',
                    phase: phase
                });
                await match.save();
                generatedMatches.push(match);
            }
        }

        res.status(201).json({
            message: `Fixture generado exitosamente (${type})`,
            matches: generatedMatches
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al generar el fixture',
            error: error.message
        });
    }
};

import User from '../users/user.model.js';

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.uid;

        const match = await Match.findById(id);
        if (!match) return res.status(404).json({ message: 'Partido no encontrado' });

        const user = await User.findById(userId);

        match.comments.push({
            user: userId,
            username: user?.username || user?.name || 'Usuario',
            text
        });

        await match.save();
        res.status(201).json({ message: 'Comentario agregado', comments: match.comments });
    } catch (error) {
        res.status(500).json({ message: 'Error al comentar', error: error.message });
    }
};

export const reactToMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.uid;

        const match = await Match.findById(id);
        if (!match) return res.status(404).json({ message: 'Partido no encontrado' });

        // Remove existing reaction from this user if any
        match.reactions = match.reactions.filter(r => r.user.toString() !== userId);
        match.reactions.push({ user: userId, emoji });

        await match.save();
        res.status(200).json({ message: 'Reacción actualizada', reactions: match.reactions });
    } catch (error) {
        res.status(500).json({ message: 'Error al reaccionar', error: error.message });
    }
};

export const voteMVP = async (req, res) => {
    try {
        const { id } = req.params;
        const { playerName } = req.body;
        const userId = req.uid;

        const match = await Match.findById(id);
        if (!match) return res.status(404).json({ message: 'Partido no encontrado' });

        // Check if user already voted
        const existingVote = match.votes.find(v => v.user.toString() === userId);
        if (existingVote) return res.status(400).json({ message: 'Ya has votado por el MVP en este partido' });

        match.votes.push({ user: userId, playerName });
        await match.save();

        res.status(200).json({ message: 'Voto registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al votar', error: error.message });
    }
};

// --- Analytics Endpoints ---

export const getRivalries = async (req, res) => {
    try {
        const matches = await Match.find({ status: 'Finalizado' });
        const rivalryMap = {};

        matches.forEach(m => {
            const teams = [m.teamA, m.teamB].sort();
            const key = teams.join(' vs ');

            if (!rivalryMap[key]) {
                rivalryMap[key] = {
                    matches: 0,
                    totalGoals: 0,
                    totalCards: 0,
                    teams: teams
                };
            }

            rivalryMap[key].matches += 1;
            rivalryMap[key].totalGoals += (m.scoreA || 0) + (m.scoreB || 0);
            rivalryMap[key].totalCards += (m.cards || []).length;
        });

        const sortedByMatches = Object.values(rivalryMap).sort((a, b) => b.matches - a.matches);
        const sortedByGoals = Object.values(rivalryMap).sort((a, b) => b.totalGoals - a.totalGoals);
        const sortedByCards = Object.values(rivalryMap).sort((a, b) => b.totalCards - a.totalCards);

        res.status(200).json({
            mostFrequent: sortedByMatches[0],
            mostGoals: sortedByGoals[0],
            mostCards: sortedByCards[0],
            all: Object.values(rivalryMap)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al calcular rivalidades', error: error.message });
    }
};

export const getMatchOfTheWeek = async (req, res) => {
    try {
        // Find next upcoming important match
        // Heuristic: Phase weighting + Team points
        const upcomingMatches = await Match.find({ status: 'Próximamente' }).sort({ date: 1 }).limit(10);

        if (upcomingMatches.length === 0) return res.status(200).json({ match: null, message: 'No hay partidos próximos' });

        // Simple choice for now: the very next match is the "Match of the Week" unless there's a final
        const final = upcomingMatches.find(m => m.phase === 'Final');
        const featuredMatch = final || upcomingMatches[0];

        res.status(200).json({ match: featuredMatch });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener partido de la semana', error: error.message });
    }
};

export const deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await Match.findById(id);
        if (match) {
            const { teamA, teamB, status } = match;
            await Match.findByIdAndDelete(id);
            if (status === 'Finalizado') {
                await recalculateTeamStats(teamA);
                await recalculateTeamStats(teamB);
            }
        }
        res.status(200).json({
            message: 'Partido eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el partido',
            error: error.message
        });
    }
};
