import History from './history.model.js';

export const createHistoryRecord = async (req, res) => {
    try {
        const data = req.body;
        const history = new History(data);
        await history.save();
        res.status(201).json({
            message: 'Registro histórico creado correctamente',
            history
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el registro histórico',
            error: error.message
        });
    }
};

export const getHistory = async (req, res) => {
    try {
        const history = await History.find().sort({ year: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el historial',
            error: error.message
        });
    }
};
