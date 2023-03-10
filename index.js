import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import { Server } from "socket.io"
import { startConnection } from "./socket/events.js";

const app = express();
app.use(express.json());

dotenv.config();

connectDB();

//Set CORS
const whitelist = [process.env.FRONT_END_URL];
const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('Error de CORS'));
        }
    }
}

app.use(cors(corsOptions))

//Routing
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto 4000");
})

//Socket.io
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONT_END_URL
    }
});

startConnection(io);
