import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Profile from "../models/profile.model.js";
import crypto from "crypto";

export const register = async (req,res) =>{
    try{
        const {name,email,password,username} = req.body;
        if(!name || !email || !password || !username) return res.status(400).json({message: "All required"});

        const user = await User.findOne({
            email
        });

        if(user) return res.status(400).json({message: "Already exist"});

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name,email,password: hashedPassword, username
        });

        await newUser.save();

        const profile = new Profile({userId: newUser._id});

        return res.json({message: "User registered Successfully"});

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const login = async (req,res) =>{
    try{
        const {email,password} = req.body;
        if(!email || !password) return res.status(400).json({message: "All required"});

        const user = await User.findOne({
            email
        });

        if(!user) res.status(404).json({message: "User Not Found"});

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).json({message: "Invalid"});

        const token = crypto.randomBytes(32).toString("hex");
    }catch(error){
        
    }
}