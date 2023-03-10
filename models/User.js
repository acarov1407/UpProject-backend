import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project"
        }
    ]
},
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {

    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.checkPass = async function (passForm) {
    return await bcrypt.compare(passForm, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;