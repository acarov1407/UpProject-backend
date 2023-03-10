import express from "express";
import {
    getAllProjects,
    getProject,
    createProject,
    deleteProject,
    editProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator,
} from "../controllers/projectController.js";

import checkAuth from "../middleware/checkAuth.js";

const projectRouter = express.Router();

projectRouter.route('/')
    .get(checkAuth, getAllProjects)
    .post(checkAuth, createProject);

projectRouter.route('/:id')
    .get(checkAuth, getProject)
    .put(checkAuth, editProject)
    .delete(checkAuth, deleteProject);

projectRouter.post('/collaborators',checkAuth, searchCollaborator)
projectRouter.post('/collaborators/:id', checkAuth, addCollaborator);
projectRouter.post('/delete-collaborator/:id', checkAuth, deleteCollaborator);

export default projectRouter;