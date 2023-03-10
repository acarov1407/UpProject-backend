import Project from "../models/Project.js";
import User from "../models/User.js";

const getAllProjects = async (req, res) => {

    try {
        const projects = await Project.find({
            $or: [
                { collaborators: { $in: req.user } },
                { owner: { $in: req.user } }
            ]
        })//.select("-tasks");
        return res.json(projects);
    } catch (error) {
        console.warn(error);
    }

}

const getProject = async (req, res) => {
    const projectId = req.params.id;
    let project = null;

    try {
        project = await Project.findById(projectId)
            .populate({ path: 'tasks', populate: { path: 'completedBy', select: 'name' } })
            .populate('collaborators', 'name email');
    } catch (error) {
        console.warn(error);
    }

    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    const isProjectOwner = project.owner.equals(req.user._id);
    const isProjectCollaborator = project.collaborators.some(_collaborator => _collaborator._id.equals(req.user._id));
    if (!isProjectOwner && !isProjectCollaborator) {
        const error = new Error('No tienes los permisos para acceder');
        return res.status(403).json({ msg: error.message });
    }

    return res.json(project);
}

const createProject = async (req, res) => {

    try {
        const project = new Project(req.body);
        project.owner = req.user._id;
        const savedProject = await project.save();
        return res.json(savedProject);
    } catch (error) {
        console.warn(error);
    }


}

const deleteProject = async (req, res) => {
    const projectId = req.params.id;
    let project = null;

    try {
        project = await Project.findById(projectId);
    } catch (error) {
        console.warn(error);
    }

    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    if (!project.owner.equals(req.user._id)) {
        const error = new Error('No tienes los permisos para eliminar este proyecto');
        return res.status(401).json({ msg: error.message });
    }

    try {
        await project.deleteOne();
        return res.json({ id: project.id });
    } catch (error) {
        console.warn(error);
    }
}

const editProject = async (req, res) => {
    const projectId = req.params.id;
    let project = null;

    try {
        project = await Project.findById(projectId);
    } catch (error) {
        console.warn(error);
    }

    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    if (!project.owner.equals(req.user._id)) {
        const error = new Error('No tienes los permisos para editar este proyecto');
        return res.status(401).json({ msg: error.message });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.deadline = req.body.deadline || project.deadline;
    project.client = req.body.client || project.client;

    try {
        const projectUpdated = await project.save();
        return res.json(projectUpdated);
    } catch (error) {
        console.warn(error);
    }
}

const searchCollaborator = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('_id name email');

    if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message })
    }


    return res.json(user);
}

const addCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(401).json({ msg: error.message });
    }

    const { email } = req.body;
    const user = await User.findOne({ email }).select('_id name email');

    if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message })
    }

    if (project.owner.toString() === user._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(401).json({ msg: error.message });
    }

    if (project.collaborators.includes(user._id)) {
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(401).json({ msg: error.message });
    }

    project.collaborators.push(user._id);
    await project.save();
    return res.json({ msg: `${user.name} ha sido añadido como colaborador` });
}

const deleteCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(401).json({ msg: error.message });
    }

    project.collaborators.pull(req.body.id);
    await project.save();
    return res.json({ _id: req.body.id });
}


export {
    getAllProjects,
    getProject,
    createProject,
    deleteProject,
    editProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator

}