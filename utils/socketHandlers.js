module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado');

        socket.on('joinMatch', (matchId) => {
            socket.join(matchId);
            console.log(`Cliente unido al partido ${matchId}`);
        });

        socket.on('goal', (data) => {
            const { matchId, team, minute } = data;
            io.to(matchId).emit('goal', { team, minute });
            console.log(`Gol del equipo ${team} en el minuto ${minute} en el partido ${matchId}`);
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });
};
