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

exports.extractUserDetails = async (req, res) => {
    try {
        const userId = req.userDetails.userId;
        const user = await User.findOne({ _id: userId }).select('-password');

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        return res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ status: false, message: `Database Error: ${error.message}` });
    }
};

exports.updateUserDetails = async (req, res) => {
    const userId = req.user._id; // Use the ID from the verified user
    let updates = req.body;

    // Fields allowed to be updated
    const allowedUpdates = ['fullName', 'email', 'phone', 'role', 'date_of_birth'];
    const updateFields = Object.keys(updates);

    // Ensure only allowed fields are updated and exclude the password
    delete updates.password;

    // Check for allowed update fields
    const isValidOperation = updateFields.every(field => allowedUpdates.includes(field));
    if (!isValidOperation) {
        return res.status(400).send({ message: "Invalid updates!" });
    }

    try {
        // Uniqueness check for email and phone
        if (updates.email || updates.phone) {
            const existingUser = await User.findOne({
                $or: [
                    { email: updates.email },
                    { phone: updates.phone }
                ],
                _id: { $ne: userId } // Exclude the current user from the search
            });

            if (existingUser) {
                return res.status(400).send({ message: "Email or phone number already in use." });
            }
        }

        // Find the user by ID and update
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Apply the updates
        updateFields.forEach(field => user[field] = updates[field]);
        await user.save();

        const updatedUser = await User.findById(user._id).select('-password');
        // Return the updated user details (excluding password)
        res.status(200).json({ message: "User updated successfully.", updatedUser });
    } catch (error) {
        res.status(500).send({ message: "Error updating user details.", error: error.message });
    }
};