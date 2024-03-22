const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const registerUser = asyncHandler(async (req,res) =>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        res.status(400)
        throw new Error('Please add all fields')
    }
    const userExists = await User.findOne({email})
      if (userExists) {
        res.status(400);
        throw new Error("Already Exist");
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password,salt)

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      })
      if(user){
        res.status(201).json({
          _id: user.id,
          name: user.name,
          email: user.email,
          profileUrl: user.profileUrl,
          token: generateToken(user._id),
        });
      }else{
        res.status(400)
        throw new Error('Invalid user data')
      }
})

const loginUser = asyncHandler(async (req, res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email})

    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }

    if (user.isBlock) {
      res.status(400);
      throw new Error("Blocked By Admin");
    }else{
    
    if(user &&  (await bcrypt.compare(password, user.password))){
        res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          profileUrl: user.profileUrl,
          token: generateToken(user._id),
        });
    }else{
        res.status(400);
        throw new Error("Invalid credentials");
    }
  }

})

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
})

const profileUpload = asyncHandler(async (req,res) =>{
  const url = req.body.url
  await User.findByIdAndUpdate(req.user.id,{
    profileUrl: url
  })
  res.status(200).json(req.user)
})

//Generate JWT
const generateToken = (id) =>{
    return jwt.sign({ id} ,process.env.JWT_SECRET , {
        expiresIn: '30d',
    })
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  profileUpload,
};