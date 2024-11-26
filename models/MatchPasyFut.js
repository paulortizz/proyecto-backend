const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    fixtureId: { type: Number, required: true },
    date: { type: Date, required: true },
    league: {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        round: { type: String, required: true }
    },
    teams: {
        home: {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            logo: { type: String, required: true }
        },
        away: {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            logo: { type: String, required: true }
        }
    },
    goals: {
        home: { type: Number, required: true },
        away: { type: Number, required: true }
    },
    venue: {
        name: { type: String, required: true },
        city: { type: String, required: true }
    },
    status: { type: String, required: true }
});

const MatchPasyFut = mongoose.model('MatchpasyFut', matchSchema);

module.exports = MatchPasyFut;