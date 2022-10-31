const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phonenumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    isLogin: {
        type: String
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    followers: [
        {
            follwerss: {
                type: String
            }
        }
    ]
},
    {
        timestamps: true
    }
);
// Password hashing
userSchema.pre('save', async function (next)
{
    console.log("hashWorking...")
    if (this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }
    next();
});


userSchema.methods.generateAuthToken = async function ()
{
    try
    {
        let token = jwt.sign({ _id: this._id }, process.env.SECRETKEY)
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (err)
    {
        console.log(err);
    }
}


console.log('UserSchema loaded!');
const User = mongoose.model('USER', userSchema);
module.exports = User;
