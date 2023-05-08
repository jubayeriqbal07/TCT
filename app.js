// IMPORTINGS
const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const {user_config,pagination,shortifyDescs,cookieParser} = require('./utils');

const PORT = 8080;
// const db = "mongodb://localhost/TCT";

mongoose.connect(user_config.db).then((element) => {
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



// ENDPOINTS
app.get('/', (req, res) => {
    POSTS.find().then(document => {

        let pagination_data = pagination(req.url, document.length)
        let prev = pagination_data[0];
        let next = pagination_data[1];
        let strt = pagination_data[2];
        let end = pagination_data[3];
        let current_page = pagination_data[4];
        cookies = cookieParser(req.headers.cookie);
        temp_documents = shortifyDescs(document.slice(strt, end));
        
        params = {
            webTitle:user_config.websiteTitle,
            data: temp_documents,
            isLoggedIn: cookies.isLoggedIn,
            user_ID:cookies.user_ID.split("@")[0],
            prv: prev,
            nxt: next,
            crr: current_page
        }
        res.render('index', params = params);
    })
})

app.get('/posts/', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    post_id = req.url.split("?")[1]
    POSTS.findById(post_id).then(document => {
        params = {
            webTitle:user_config.websiteTitle,
            content: document,
            isLoggedIn: cookies.isLoggedIn,
            user_ID:cookies.user_ID.split("@")[0],
        }
        res.render('posts', params = params);
    })
})

app.get('/createPost', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    if (cookies.isLoggedIn) {
        res.render('createPost',params={webTitle:user_config.websiteTitle,});
    } else {
        res.redirect("/");
    }
});

app.post('/createPost', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    usr_email = cookies.user_ID;
    cnt_title = req.body.content_title;
    cnt_desc = req.body.content_desc;
    cnt_dt = `${d.getHours()}:${d.getMinutes()} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`

    POSTS.insertMany([{
        _usr: usr_email,
        _date: cnt_dt,
        title: cnt_title,
        desc: cnt_desc
    }]).then(element=>{
        console.log(element);
        res.redirect('/');
    });
})

app.get('/deletePost', (req, res) => {
    post_id = req.url.split('?')[1];
    POSTS.deleteOne({
        _id: post_id
    }).then(element => {
        console.log(element);
        res.redirect('/myPosts');
    });
})

app.get('/myPosts', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    if (cookies.isLoggedIn) {
        POSTS.find({
            _usr: cookies.user_ID
        }).then((document) => {

            let pagination_data = pagination(req.url, document.length)
            let prev = pagination_data[0];
            let next = pagination_data[1];
            let strt = pagination_data[2];
            let end = pagination_data[3];
            let current_page = pagination_data[4];
            cookies = cookieParser(req.headers.cookie);
            temp_documents = shortifyDescs(document.slice(strt, end));

            params = {
                webTitle:user_config.websiteTitle,
                data: document.slice(strt, end),
                isLoggedIn: cookies.isLoggedIn,
                user_ID:cookies.user_ID.split("@")[0],
                prv: prev,
                nxt: next,
                crr: current_page,
            }
            res.render('myPosts', params = params);
        })
    } else {
        res.redirect('/');
    }
})


app.get('/signIn', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    if (!cookies.isLoggedIn) {
        res.render('signIn', params = {
            webTitle:user_config.websiteTitle,
            inc: false
        });
    } else {
        res.redirect('/')
    }
})

app.post('/signIn', (req, res) => {
    USER.find({
        email: req.body.usr_email
    }).then(element => {
        if (element.length == 0) {
            res.render('signIn', params = {
                webTitle:user_config.websiteTitle,
                inc: true
            });
        } else {
            if (req.body.usr_pass == element[0].password) {
                res.cookie("isLoggedIn", true);
                res.cookie("user_ID", req.body.usr_email);
                res.redirect('/')
            } else {
                res.render('signIn', params = {
                    webTitle:user_config.websiteTitle,
                    inc: true
                });
            }
        }
    })
})

app.get('/signUp', (req, res) => {
    cookies = cookieParser(req.headers.cookie);
    if (!cookies.isLoggedIn) {
        res.render('signUp', params = {
            webTitle:user_config.websiteTitle,
            empt: false,
            acc_exst: false
        });
    } else {
        res.redirect('/')
    }
})

app.post('/signUp', (req, res) => {
    usr_fullname = req.body.usr_fullname
    usr_email = req.body.usr_email
    usr_pass = req.body.usr_pass
    if (usr_fullname == "" || usr_email == "" || usr_pass == "") {
        res.render('signUp', params = {
            webTitle:user_config.websiteTitle,
            empt: true,
            acc_exst: false
        });
    } else {
        USER.findOne({
            email: usr_email
        }).then(element => {
            if (element == null) {
                USER.insertMany([{
                    fullname: usr_fullname,
                    email: usr_email,
                    password: usr_pass
                }]);
                res.cookie("isLoggedIn", true);
                res.cookie("user_ID", usr_email);
                res.redirect('/')
            } else {
                res.render('signUp', params = {
                    empt: false,
                    acc_exst: true
                });
            }
        })
    }
})

app.get('/signOut', (req, res) => {
    res.clearCookie("isLoggedIn");
    res.clearCookie("user_ID");
    res.redirect('/')
})

// STARTING THE SERVER
app.listen(8080, () => {
    console.log(`Application is running on 127.0.0.1:${PORT}`);
})