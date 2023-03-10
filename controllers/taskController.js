import Task from "../models/Task.js";
import Project from "../models/Project.js";


const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project');
        if (!task) {
            const error = new Error('Id de tarea no encontrado');
            return res.status(404).json({ msg: error.message });
        }

        if (!task.project.owner.equals(req.user._id)) {
            const error = new Error('No tienes los permisos para obtener esta tarea');
            return res.status(403).json({ msg: error.message });
        }

        return res.json(task);
    } catch (error) {
        console.warn(error);
    }

}

const createTask = async (req, res) => {

    //Check project exists
    let project = null;
    try {
        project = await Project.findById(req.body.project);

        if (!project) {
            const error = new Error('El proyecto no existe');
            return res.status(404).json({ msg: error.message });
        }
    } catch (error) {
        console.warn(error);
    }


    //Check project belongs to user
    if (!project.owner.equals(req.user._id)) {
        const error = new Error('No tienes los permisos para añadir la tarea');
        return res.status(403).json({ msg: error.message });
    }

    //if exist project and belongs to user

    const task = new Task(req.body);

    try {
        const taskSaved = await task.save();
        project.tasks.push(taskSaved._id);
        await project.save();
        return res.json(taskSaved);
    } catch (error) {
        console.warn(error);
    }
}

const editTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project');
        if (!task) {
            const error = new Error('Id de tarea no encontrado');
            return res.status(404).json({ msg: error.message });
        }

        if (!task.project.owner.equals(req.user._id)) {
            const error = new Error('No tienes los permisos para obtener esta tarea');
            return res.status(403).json({ msg: error.message });
        }

        task.name = req.body.name || task.name;
        task.description = req.body.description || task.description;
        task.deadline = req.body.deadline || task.deadline;
        task.priority = req.body.priority || task.priority;

        await task.save();

        const updatedTask = await Task.findById(task._id).populate({ path: 'completedBy', select: 'name'});
        return res.json(updatedTask);

    } catch (error) {
        console.warn(error);
    }
}

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project');
        if (!task) {
            const error = new Error('Id de tarea no encontrado');
            return res.status(404).json({ msg: error.message });
        }

        if (!task.project.owner.equals(req.user._id)) {
            const error = new Error('No tienes los permisos para eliminar esta tarea');
            return res.status(403).json({ msg: error.message });
        }

        const project = await Project.findById(task.project);
        project.tasks.pull(task._id);

        if (task.state) project.completedTasks -= 1;

        const result = await Promise.allSettled([await project.save(), await task.deleteOne()]);
        const deletedTask = result[1].value;
        return res.json(deletedTask);

    } catch (error) {
        console.warn(error);
    }
}

const changeTaskState = async (req, res) => {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
        const error = new Error('Id de tarea no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    const isProjectOwner = task.project.owner.equals(req.user._id);
    const isProjectCollaborator = task.project.collaborators.some(_collaborator => _collaborator._id.equals(req.user._id));
    if (!isProjectOwner && !isProjectCollaborator) {
        const error = new Error('No tienes los permisos para acceder');
        return res.status(403).json({ msg: error.message });
    }

    const project = await Project.findById(task.project);
    if (task.state) project.completedTasks--;
    else project.completedTasks++;

    task.state = !task.state;
    task.completedBy = req.user._id;

    await Promise.allSettled([await project.save(), await task.save()]);

    const savedTask = await Task.findById(task._id).populate({path: 'completedBy', select: 'name'});
    return res.json(savedTask);
}



export {
    getTask,
    createTask,
    editTask,
    deleteTask,
    changeTaskState
}