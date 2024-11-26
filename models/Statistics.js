const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticsSchema = new Schema({
    player: {
        id: Number,
        name: String,
        age: Number,
        nationality: String,
        team: {
            id: Number,
            name: String,
            logo: String
        }
    },
    statistics: {
        games: {
            appearances: Number,
            minutes: Number,
            lineups: Number
        },
        goals: {
            total: Number,
            assists: Number,
            conceded: Number,
            saves: Number
        },
        cards: {
            yellow: Number,
            red: Number
        },
        passes: {
            total: Number,
            key: Number,
            accuracy: Number
        },
        dribbles: {
            attempts: Number,
            success: Number
        },
        tackles: {
            total: Number,
            blocks: Number,
            interceptions: Number
        },
        fouls: {
            drawn: Number,
            committed: Number
        },
        penalties: {
            won: Number,
            scored: Number,
            missed: Number
        }
    }
});

module.exports = mongoose.model('Statistics', StatisticsSchema);
