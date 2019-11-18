//IMPORTS
const express = require("express");
const app = express();
const session = require('express-session');
const mongoose = require('mongoose'); // LOOK! New require!
const flash = require('express-flash');
var validate = require("mongoose-validator");
var bcrypt = require("bcrypt");
mongoose.Promise = global.Promise;

//CONFIG
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(session({
    secret: 'xoxoGossipGirl',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({extended: true}));
app.use(flash());
// app.use(bodyParser.urlencoded({useNewUrlParser: true}));

// DATABASE: this connects Mongoose to MongoDB
mongoose.connect('mongodb://localhost/login_registration', {useNewUrlParser: true});

var UserSchema = new mongoose.Schema({
    fname: {
        type: String, 
        required: [true, "First name is required."], 
        minlength: [2]
    },
    lname: {
        type: String, 
        required: [true, "Last name is required."], 
        minlength: [2]
    },
    email: {
        type: String, 
        required: [true, "An email address is required."], 
        validate: {
            validator: (value) => {
				return /@/.test(value)
            },
            message: "Please enter a valid email address!"
        }
    },
    birthday: {
        type: Date, 
        required: [true, "Birthday is required."],
    },
    password: {
        type: String, 
        required: [true, "A password is required."],
        minlength: [8, "Password must be a tleast 8 characters."]
    },
    confirm_pass: {
        type: String, 
        required: [true, "Re-enter password."],
        validate: {
            validator: (value) => {
                value == this.password;
            }, message:"Passwords do not match."
        }
    },
}, {timestamps: true});

UserSchema.pre('save', function(done){
    var hashedpw = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
    this.password = hashedpw;
    this.confirm_pass = undefined;
    done();
;})

const User = mongoose.model('User', UserSchema);


// bcrypt.hash('password_from_form', 10)
// .then(hashed_password => {
	
// })
// .catch(error => {
	
// });

// bcrypt.compare('password_from_form', 'stored_hashed_password')
// .then(result => {
	
// })
// .catch(error => {
	
// })

//ROUTES


// -------------------------------------
app.get('/', (req, res) => { 
    console.log("~~I am Root~~")
    res.render('index')
});

app.get("/dashboard", function(req, res){
    console.log("~Dashboard~");
    res.render("dashboard");
});

app.post('/signup', (req, res) => {
    console.log(" req.body: ", req.body);
    User.create({
        fname:req.body.fname, 
        lname:req.body.lname, 
        birthday:req.body.birthday, 
        email:req.body.email, 
        password: req.body.password,
        confirm_pass: req.body.confirm_pass,
        }, (err, user) => {
            if (err) {
                console.log("!!! ERROR OCCURRED !!!", err);
                for (var key in err.errors) {
                    req.flash('registration', err.errors[key].message);
                }
                res.redirect('/');
            }
            else {
                console.log("-★-★- USER WAS SUCCESSFULLY ADDED TO DB -★-★-");
                res.redirect('dashboard')
            }
    })
})


// app.post('/', (req, res) => { 
//     var message = new Message();
//     message.name = req.body.name;
//     message.title = req.body.title;
//     message.message = req.body.message;
//     message.save()
//         .then(newPandaData => res.redirect('/pandas/'+panda.id))
//         .catch(err => {
//             console.log("We have an error!", err);
//             for (var key in err.errors) {
//                 req.flash('registration', err.errors[key].message);
//             }
//             res.redirect('/');
//         });
//     console.log(message.name, message.message);
// });

// app.post('/addComment/:id', (req, res) => { 
//     console.log(req.body)
//     var comment = new Comment();
//     comment.name = req.body.name;
//     comment.comment = req.body.comment;
//     console.log(comment)
//     comment.save()
//         .then(data => {
//             console.log(data) //params come from url
//             Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: data}}, function(err, msg){
//                 console.log('Error is this', err)
//                 console.log('Msg is this', msg)
//                 if(err){
//                     console.log("We have an error!", err);
//                     for (var key in err.errors) {
//                         req.flash('registration', err.errors[key].message);
//                     }
//                     res.redirect('/');
//                 }
//             })
//             res.redirect('/');
//         })
//         .catch(err => {
//             console.log("We have an error!", err);
//             for (var key in err.errors) {
//                 req.flash('registration', err.errors[key].message);
//             }
//             res.redirect('/'); //{errors: quote.errors}?????
//         });
// });


const server = app.listen(8000, () => console.log("--♡♡♡-- listening on port 8000 --♡♡♡--"));
