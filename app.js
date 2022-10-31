const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
dotenv.config({ path: 'config.env' });
const port = 5500 || process.env.PORT;
app.use(express.json());
app.use(express.urlencoded());
const db = require('./connections/conn');

const authenticate = require('./middleware/authenticate');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const User = require('./models/userSchema');
const { Console } = require('console');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('assets'));
app.get('/', (req, res)=>{
    res.status(200).render('home', {title: "Chatgram.com"});
});
app.get('/signUp', (req, res)=>{
    res.status(200).render('signUp');
});
app.get('/login', (req, res)=>{
    res.status(200).render('login');
});

var addBlog = [
    {
        username: 'username here',
        blogBody: 'body of the blog here',
        date: 'generated date here'
    }
]

app.post('/registerUser', async function(req, res){
    const {name, username, email, phonenumber,password, cpassword, dob, occupation, gender} = req.body;
    if(!name || !username || !email || !phonenumber || !password || !cpassword || !dob || !occupation || !gender){
        return res.status(422).render('badrequest',{
            thisTextError: 'Fields are missing!'
        });
    }
    try{
        // let random = [1,2,3,4,5,6,7,8,9,0];
        // let x = random[Math.floor(Math.random() * random.length)];
        // let y = random[Math.floor(Math.random() * random.length)];
        // let z = random[Math.floor(Math.random() * random.length)];
        let random = Math.floor(Math.random() * 100);
        const userExist = await User.findOne({email: email});
        const usernameExists = await User.findOne({username: username});
        if(userExist){
            return res.status(422).render('badrequest', {
                thisTextError: 'Email is already registered, try with another email!'
            });
        }
        if(usernameExists){
            res.status(422).render('alreadyuser', {sname: req.body.name, scurrent: req.body.username, sgenerated: `${req.body.username}${random}`});
        }
        else if(password != cpassword){
            return res.status(422).render('badrequest', {
                thisTextError: 'Password and confirm password, are not matching!'
            })
        }else{
            const user = new User({name, username, email,phonenumber,password,cpassword,dob,occupation,gender});
            await user.save();
            res.status(201).render('login', {mainName: `${req.body.username} account created`});
        }
    }catch(err){
        console.log(err);
    }
});
let thisPerson;
app.post('/loginUser', async (req, res)=>{
    try{    
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).render('badrequest', {
                thisTextError: 'Please fill the fields!'
            });
        }
        // always handle this types of functions with async and await...
        const userLogin = await User.findOne({username:username});

        

        const token = await userLogin.generateAuthToken();


        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true
        });



        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if(!isMatch){
                res.status(400).render('badrequest', {
                    thisTextError: 'Invalid data is being filled in the field(s)'
                });
            }else{
                thisPerson = req.body.username;
                res.status(201).render('successlogin', {mainName: `${req.body.username} logged in successfully!`});
            }
        }else{
            res.status(400).json({error: "Invalid details"});
        }
    } catch(err){
        console.log(err);
    }
});
app.get('/teleport', authenticate, async function(req, res){
    let x = new Date().getDate();
    let y = new Date().getMonth() + 1;
    let z = new Date().getFullYear();
    res.status(200).render('basic', {
        timess: `${x}/${y}/${z}`,
        newBlog: addBlog,

    });
})
app.get('/back', (req, res)=>{
    res.redirect('signUp');
});
app.get('/deleteAccount', async function(req, res){
    return res.render('delete');
});
app.post('/deleteUser', async function(req, res){
    try{    
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({error: "Please fill the data"});
        }
        // always handle this types of functions with async and await...
        const userLoginUsername = await User.findOne({username:username});
        const userLoginPassword = await User.findOne({password:password});
        if(userLoginUsername && userLoginPassword){
            const isMatch = await bcrypt.compare(password, userLoginUsername.password);
            if(!isMatch){
                res.status(400).json({error: "Invalid details"});
            }else{
                res.status(201).json({message: "Account deleted!"});
            }
        }else{
            res.status(400).json({error: "Invalid details"});
        }
    } catch(err){
        console.log(err);
    }
});
app.get('/createPost', authenticate, (req, res)=>{
    const username = req.rootUser.username;
    return res.render('createPost', {
        awaitingUsername: username,
        thisTextError: 'Ummm? Bad requests / direct requests are not allowed.'
    });
});
app.get('/blogsMain', authenticate, (req, res)=>{
    return res.status(422).redirect('teleport');
});
app.post('/addBlogtoPost', authenticate, async function(req, res){
    // // console.log("/addBlogtoPost section is working!");
    // try{    
    //     const {username, password} = req.body;
    //     // always handle this types of functions with async and await...
    //     const userLogin = await User.findOne({username:username});
    //     if(userLogin){
    //         const isMatch = await bcrypt.compare(password, userLogin.password);
    //         if(!isMatch){
    //             res.status(400).json({error: "Invalid details"});
    //         }else{
    //             // let thisPerson = req.body.username;
    //             // res.status(201).render('successlogin', {mainName: `${req.body.username} logged in successfully!`});
    //         }
    //     }else{
    //         res.status(400).json({error: "Invalid details"});
    //     }
    // } catch(err){
    //     console.log(err);
    // }
    addBlog.push(req.body);
    return res.redirect('teleport');
});
app.get('/moments', authenticate, function(req, res){
    return res.render('moments', {
        thisTextError: 'Ummm? Bad requests / direct requests are not allowed.'
    });
})
app.get('/logOutUser', (req, res)=>{
    return res.redirect('login');
});
app.get('/dashboard', authenticate, function(req, res){
    // if(req.rootUser.occupation === 'Programmer'){
    //     console.log('Service for him...');
    //     return res.status(200).render('userDashboardprog', {
    //         originalname: req.rootUser.name,
    //         originalusername: req.rootUser.username
    //     });
    // }else{
    //     console.log('No service for non-programmers');
    // }
    return res.render('userDashboardprog', {
        originalname: req.rootUser.name,
        originalusername: req.rootUser.username
    });
    
});
app.get('/userProfileRequest', authenticate, function(req, res){
    return res.status(200).render('userProfileView', {
        usernameAdd: req.rootUser.username,
        usernameOriginal: req.rootUser.name,
        userEmail: req.rootUser.email,
        userPhone: req.rootUser.phonenumber,
        userGender: req.rootUser.gender,
        userDOB: req.rootUser.dob,
        userOccupation: req.rootUser.occupation
    });
});
app.get('/goback', authenticate, (req, res)=>{
    return res.redirect('/dashboard');
});


app.get('/activeUsers', async (req, res) => {

    try {
        const count = await User.count({gender: 'male'})
        console.log(count)
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
        console.log(error)
    }


}) 

app.listen(port, (err)=>{
    if(err==true){console.log(`Error occured: ${err}`)}else{
        console.log(`Application is running on the port ${port}`);
    };
});

