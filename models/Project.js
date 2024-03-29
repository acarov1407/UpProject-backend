import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    deadline: {
        type: Date,
        default: Date.now()
    },
    client: {
        type: String,
        trim: true,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ],
    completedTasks: {
        type: Number,
        default: 0
    },
    collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

},
    {
        timestamps: true
    }
);


const Project = mongoose.model("Project", projectSchema);

export default Project;