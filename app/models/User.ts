import mongoose, { Model } from "mongoose";
import validator from "validator";


export interface IUserDocument {
    name: string,
    email: string,
    password: string,
    role: string,
}

interface IUser extends IUserDocument {
    comparePassword(p: string): Promise<boolean>,
}

interface IUserModel extends Model<IUser> {

}



const userSchema = new mongoose.Schema<IUser, IUserModel>(
    {
        name: {
            type: String,
            required: [true, "name field is empty."],
            minlength: 3,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, "email field is empty."],
            unique: true,
            validate: {
                validator: (value: string) => {
                    return validator.isEmail(value);
                },
                message: props => `${props.value} is not a valid email.`
            }
        },
        password: {
            type: String,
            required: [true, "password field is empty."],
            minlength: 6
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        }
    }
);



export const User = mongoose.model<IUser, IUserModel>("users", userSchema);



export const insertUser = async (user: IUserDocument) => {
    const result = await User.create(user);
    return result.id;
}