import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try{
        const {fullname, email, password} = req.body;
        if(!fullname || !email || !password){
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            })
        };
        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({
                message: "User already exist with this email.",
                success: false
            })
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User created successfully.",
            success:true
        })

    }
    catch (error) {
        console.log(error);
    }
}

export const login = async(req, res)=>{
    try{
        const{email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            })
        };

        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        };

        const isPaasword = await bcrypt.compare(password, user.password);
        if(!isPaasword){
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        };

        const tokenData = { userId: user._id }
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, {expiresIn:'1d'});
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            maxAge: 1*24*60*60*1000,
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd
        };
        return res.status(200).cookie("token", token, cookieOptions).json({
             message: `${user.fullname} logged in successfully`,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email
            },
            success: true
        })

    }
    catch(error){
        console.log(error);
    }
}

export const logout = async(req, res)=>{
    try{
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            maxAge: 0
        };
        return res.status(200).cookie("token", "", cookieOptions).json({
            message: "User logged out successfully",
            success: true
        })
    }
    catch(error){
        console.log(error);
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current and new password are required.",
                success: false
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters.",
                success: false
            });
        }

        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect.",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password updated successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
}
