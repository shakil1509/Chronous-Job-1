const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "fullname not provided "],
    },
    email: {
        type: String,
        unique: [true, "email already in use!"],
        lowercase: true,
        trim: true,
        required: [true, "email not provided"],
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
        }

    },
    phone: {
        type: Number,
        unique: [true, "Phone number already in use!"],
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    role: {
        type: String,
        enum: ["normal", "admin"],
        required: [true, "Please specify user role"]
    },
    password: {
        type: String,
        required: [true, "password not provided"]
    },
    date_of_birth:{
        type:Date,
        required:[true,"date of birth is required"]
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);