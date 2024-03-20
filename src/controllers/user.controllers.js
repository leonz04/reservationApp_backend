const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const EmailCode = require('../models/EmailCode');
const sendEmail = require('../utils/sendEmail');




const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const {firstName, lastName,email,password,gender,frontBaseUrl}=req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
		// guardamos el usuario, le decimos que la contraseña es la encriptada
    const result = await User.create({
        email,
        password:hashedPassword,
        firstName,
        lastName,
        gender,
    })
        
    const code = require('crypto').randomBytes(32).toString('hex');
    const link = `${frontBaseUrl}/${code}`
        
    await EmailCode.create({
        code,
        userId:result.id
    });
        
    await sendEmail({
            to: email, // Email del receptor
            subject: "Veify email", // asunto
            html:
        `<div>
            <h1>Hi ${firstName} ${lastName}</h1>
            <p><a href= ${link}>${link}</a></p>
            <p>Code ${code}</p>
            <p>Thanks for sign up in this app</p>
        </div>`
     })
    return res.status(201).json({...result, code});
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const {firstName,lastName,email,gender} = req.body
    const result = await User.update(
        {firstName, lastName ,email , gender},
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const login= catchError(async(req,res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({where:{email:email}});
    if(!user) return res.status(401).json({message:"invalid credentials"});
    if(!user.isVerified) return res.status(401).json({message:"user not verified pls check your email"});    
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid) return res.status(401).json({message:"invalid credentials"});
    
    const token =jwt.sign(
        {user},
        process.env.TOKEN_SECRET,
        {expiresIn:"1d"}
        );

    return res.json({user:user,token:token});
});

const verifyEmail = catchError(async(req,res)=>{
    const {code}= req.params;
    const emailCode=await EmailCode.findOne({where:{code:code}});
    if(!emailCode) return res.status(401).json({message:"codigo invalido"})
    const user = await User.update(
        {isVerified:true},
        {where:{id:emailCode.userId},returning:true},
    );
    await emailCode.destroy();
    return res.json(user[1]);
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login,
    verifyEmail
}