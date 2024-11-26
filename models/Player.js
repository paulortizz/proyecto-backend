const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: [0, 'La edad no puede ser negativa'], max: [50, 'La edad máxima es 50 años'] },
    position: { 
        type: String, 
        required: true, 
        trim: true,
        enum: ['Portero', 'Defensa', 'Mediocampista', 'Delantero'] // Posiciones válidas
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
});

module.exports = mongoose.model('Player', playerSchema);
