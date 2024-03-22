const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const Admin = require('../models/adminModel')
const User = require('../models/userModel')

const loginAdmin = asyncHandler(async (req,res) =>{
    const {email,password} = req.body
    const admin = await Admin.findOne({email})

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin.id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid Credentials");
    }
})

const getUsers = asyncHandler( async(req,res) =>{
    const users = await User.find()
    if(users){
        res.status(200).json({users})
    }else{
        res.status(404)
        throw new Error('Users Not Found')
    }
})

const userBlock = asyncHandler(async (req,res) =>{
    const userId = req.body.userId
    const user = await User.findByIdAndUpdate(userId,{isBlock : true})
    const users = await User.find()
    if(users){
        res.status(200).json({users})
    }else{
        res.status(404)
        throw new Error('Users Not Found')
    }
})

const userUnBlock = asyncHandler( async(req,res)=>{
    const userId = req.body.userId
    const user = await User.findByIdAndUpdate(userId,{isBlock : false})
    const users = await User.find()
    if(users){
        res.status(200).json({users})
    }else{
        res.status(404)
        throw new Error('Users Not Found')
    }
})

const editUser = asyncHandler(async (req,res) =>{
    const { userId, name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId,{name,email}, {new: true});
    const users = await User.find();
    if(users){
        res.status(200).json({users})
    }else{
        res.status(404);
        throw new Error('Users Not Found')
    }
})

const searchUser = asyncHandler(async (req,res) =>{
    const query = req.body.query;
    const regex = new RegExp(`^${query}`, "i");
    const users = await User.find({name: {$regex : regex}})
    res.status(200).json(users);
})
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  loginAdmin,
  getUsers,
  userUnBlock,
  userBlock,
  editUser,
  searchUser,
};