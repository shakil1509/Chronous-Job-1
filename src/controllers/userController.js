const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const User=require('../models/userModel');
const config=require('../configs/config');
const JWT_SECRET_KEY=config.JWT_SECRET_KEY;
const JWT_TOKEN_EXPIRATION_TIME=config.JWT_TOKEN_EXPIRATION_TIME;



exports.signUp = async (req, res, next) => {
    // console.log("req.body",req.body)
    if (!req.body.password) {
        return res.status(400).send({ message: 'Password is required' });
    }
    const user=new User({
        fullName:req.body.fullName,
        email:req.body.email,
        phone:req.body.phone,
        date_of_birth:req.body.date_of_birth,
        password:bcrypt.hashSync(req.body.password, 8),
        role:req.body.role
    });
    user.save().then(data=>{
        // console.log("success--->",data)
        return res.status(200).send({message:'User saved successfully'})
    }).catch(err=>{
        // console.log("failure--->",err)

        return res.status(500).send({message:err})
    })
}

exports.login=async (req, res) => {
    let emailPassed = req.body.email;
    let passwordPassed = req.body.password;
    User.findOne({
        email: emailPassed
    }).then((user) => {
        if(!user) {
            return res.status(404).send({message: "User not found"});
        }
        var passwordIsValid = bcrypt.compareSync(
            passwordPassed,
            user.password
        );
        if(!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password!"
            });
        }
        var token = jwt.sign({
            id: user.id,
            // is_admin:user.is_admin
        }, JWT_SECRET_KEY, {
            expiresIn: JWT_TOKEN_EXPIRATION_TIME
        });
        return res.status(200).send({
            user: {
                id: user.id,
                email: user.email,
                fullname: user.fullName,
            },
            message: "Login Successful",
            accessToken: token
        });
    });

}
