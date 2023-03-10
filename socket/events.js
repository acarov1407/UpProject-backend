
const startConnection = (io) => {
    io.on('connection', (socket) => {
        console.log('Conectado a socket.io');

        //Events
        socket.on('open proyect', (id) => {
            socket.join(id);
        });

        socket.on('save_task', (task) => {
            socket.to(task.project).emit('saved_task', task);
        });

        socket.on('delete_task', (task) => {
            socket.to(task.project._id).emit('deleted_task', task);
        });

        socket.on('edit_task', (task) => {
            socket.to(task.project).emit('edited_task', task);
        });

        socket.on('complete_task', (task) => {
            socket.to(task.project).emit('completed_task', task);
        });
    })
}


export {
    startConnection
}