const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const cookieParser = require('cookie-parser');
const Authenticate = async (req, res, next) =>
{
    try
    {
        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token, process.env.SECRETKEY);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser)
        {
            throw new Error('User not found');
        }
        req.token = token;
        // rootUser will get all the document of the specific user.
        req.rootUser = rootUser;
        req.userID = rootUser._id;


        next();


    } catch (err)
    {
            res.status(401).render('invalidtoken');
    }
}

module.exports = Authenticate;