import express from "express";
import checkAuth from "../middleware/checkAuth.js";

import {
    getTask,
    createTask,
    editTask,
    deleteTask,
    changeTaskState
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.post('/', checkAuth, createTask);
taskRouter.route('/:id')
    .get(checkAuth, getTask)
    .put(checkAuth, editTask)
    .delete(checkAuth, deleteTask);

taskRouter.post('/state/:id', checkAuth, changeTaskState);

export default taskRouter;