// IMPORTINGS
const express = require("express");
const path = require('path');
const mongoose = require('mongoose');


const PORT = 8080;
const db = "mongodb://localhost/TCT";

const user_config = {
    contentsPerPage: 6
}

mongoose.connect(db).then((element) => {
    console.log("CONNECTED WITH DATABASE");
}).catch(() => {
    console.log("FAILED TO CONNECT WITH DATABASE");
});

const d = new Date();

const app = express();
// APP CONFIG
app.use('/static', express.static(path.join(__dirname, "/static")));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// DATABASE COLLECTIONS
const userSchecma = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
});
const USER = mongoose.model('users', userSchecma);

const postsSchema = new mongoose.Schema({
    _usr: String,
    _date: String,
    title: String,
    desc: String
})
const POSTS = mongoose.model('posts', postsSchema);

function cookieParser(raw){
    cookies = {}
    if(raw == undefined){
        cookies["isLoggedIn"] = false;
        cookies["user_ID"] = "NaN";
        return cookies
    }
    raw = raw.split('; ');
    raw.forEach(element=>{
        element = element.split("=");
        cookies[element[0]] = element[1];
    })
    cookies.user_ID = cookies.user_ID.replace("%40","@");
    return cookies
}

// ENDPOINTS
app.get('/', (req, res) => {
    POSTS.find().then((document) => {
        let last_page = 1
        if (user_config.contentsPerPage == 1) {
            last_page = document.length
        } else if (user_config.contentsPerPage != document.length) {
            last_page = Math.floor(document.length / user_config.contentsPerPage) + 1;
        }

        let current_page = req.url.split('=')[1]
        if (current_page != undefined && current_page > last_page) {
            current_page = last_page;
        }
        if (current_page == 1) {
            current_page = undefined;
        }

        let strt = ((current_page - 1) * user_config.contentsPerPage);;
        let end = 0;
        if (current_page == undefined) {
            strt = 0;
        }

        if (current_page == undefined || current_page == 1) {
            prev = "#"
            if (last_page > 1) {
                next = "/?page=" + 2;
            } else {
                next = "#";
            }
        } else if (current_page >= last_page) {
            prev = "/?page=" + (current_page - 1)
            next = "#";
        } else {
            prev = "/?page=" + (current_page - 1)
            next = "/?page=" + (Number(current_page) + 1)
        }
        end = strt + user_config.contentsPerPage;

        if (current_page == undefined) {
            current_page = 1
        }

        cookies = cookieParser(req.headers.cookie);

        params = {
            data: document.slice(strt, end),
            isLoggedIn:cookies.isLoggedIn,
            prv: prev,
            nxt: next,
            crr: current_page,
        }
        res.render('index', params = params);
    })
})

app.get('/posts/', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    post_id = req.url.split("?")[1]
    POSTS.findById(post_id).then(document => {
        params = {
            content: document,
            isLoggedIn:cookies.isLoggedIn,
        }
        res.render('posts', params = params);
    })
})


app.get('/createPost',(req,res)=>{
    cookies = cookieParser(req.headers.cookie);
    if(cookies.isLoggedIn){
        res.render('createPost');
    }else{
        res.redirect("/");
    }
});

app.post('/createPost',(req,res)=>{
    cookies = cookieParser(req.headers.cookie);
    usr_email = cookies.user_ID;
    cnt_title = req.body.content_title;
    cnt_desc = req.body.content_desc;
    cnt_dt = `${d.getHours()}:${d.getMinutes()} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`

    POSTS.insertMany([{_usr:usr_email,_date:cnt_dt,title:cnt_title,desc:cnt_desc}]);
    res.redirect('/');
})



app.get('/signIn', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    if(!cookies.isLoggedIn){
        res.render('signIn',params={inc:false});
    }else{
        res.redirect('/')
    }
})

app.post('/signIn', (req, res) => {
    USER.find({email:req.body.usr_email}).then(element=>{
        if(element.length == 0){
            res.render('signIn',params={inc:true});
        }else{
            if(req.body.usr_pass == element[0].password){
                res.cookie("isLoggedIn",true);
                res.cookie("user_ID",req.body.usr_email);
                res.redirect('/')
            }else{
                res.render('signIn',params={inc:true});
            }
        }
    })
})

app.get('/signUp', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    if(!cookies.isLoggedIn){
        res.render('signUp',params={empt:false,acc_exst:false});
    }else{
        res.redirect('/')
    }
})

app.post('/signUp', (req, res) => {
    usr_fullname = req.body.usr_fullname
    usr_email = req.body.usr_email
    usr_pass = req.body.usr_pass
    if(usr_fullname == "" || usr_email == "" || usr_pass == ""){
        res.render('signUp',params={empt:true,acc_exst:false});
    }else{
        USER.findOne({email:usr_email}).then(element=>{
            if(element == null){
                USER.insertMany([{
                    fullname:usr_fullname,
                    email:usr_email,
                    password:usr_pass
                }]);
                res.cookie("isLoggedIn",true);
                res.cookie("user_ID",usr_email);
                res.redirect('/')
            }else{
                res.render('signUp',params={empt:false,acc_exst:true});
            }
        })
    }
})

app.get('/signOut',(req,res)=>{
    res.clearCookie("isLoggedIn");
    res.clearCookie("user_ID");
    res.redirect('/')
})

// STARTING THE SERVER
app.listen(8080, () => {
    console.log(`Application is running on 127.0.0.1:${PORT}`);
})