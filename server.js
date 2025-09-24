/**
 * 
 * TODOS
 * [ X ] : Fix time_left bug (Only dynamic field points will be lost)
 */


require('dotenv').config();

const express = require('express');
const path = require("path");
const cookie = require('cookie-session');
const app = express();
const ObjectId = require('mongodb').ObjectId;

// Middleware

app.use( express.static('views') );
app.use( express.static('public') );
app.use( express.urlencoded({ extended:true }) )
app.use( express.json() );

// Connection testing function
app.use( (req,res,next) => {
    if( db !== null ) {
        next()
    } else {
        res.status( 503 ).send()
    }
})

// Sessions
const createCookieKeys = () => {
    const length = 32;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = "";
    for(let i = 0; i<length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}
app.use(cookie({
    name: "session",
    keys: [createCookieKeys(), createCookieKeys()]
}))


app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');



const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=MainCluster`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}
});


app.get( "/", async (req, res) => {
    // Return all tasks with user account with a form
    // const userOrNull = db.collection("users");
    const session = req.session;

    let username = "";
    let loggedIn = false;

    
    if(Object.values(session).length !== 0){

        if(session.login === true){

            const users = db.collection("users");

            const userQry = { _id: new ObjectId(session.user_id) }
            const currUser = await users.findOne( userQry );
            
            username = currUser.username;
            loggedIn = true;
            // console.log("user", username);
            // console.log("session data", session);
        }
    }
    // If so..
    // Render all tasks in a SPA style (Frontend code covers it ideally)
    // or in server style (Backend covers it)

    // Should prompt user to sign up / login if req.session isn't defined (empty)
    res.render('index', { username: username, login: loggedIn }) 
});

app.get("/get-tasks", async (req, res) => {
    const session = req.session;

    if(session === undefined || Object.values(session).length == 0){
        console.log("No Session Initialized")

        const data = {
            status: "403",
            description: "Session not initialized"
        }

        res.json(data);

    } else if ( session.login == false) {
        const data = {
            status: "403",
            description: "Unauthorized"
        }

        res.json(data);
    } else if ( session.login == true ){
        const tasks = db.collection("tasks");

        const userTasks = await tasks.find( { user_id: session.user_id } );

        // Have to convert userTasks into an array as collections.find() returns a cursor object 
        const taskList = await userTasks.toArray();
        res.json({status: "200", content: taskList});
    }
})


app.post( "/get-tasks", async (req, res) => {
    const session = req.session;
    // console.log(session);

    if(Object.values(session).length == 0){
        res.json({status: "403", description: "Not logged in"});
        
    } else if ( session.login == false){
        res.json({status: "403", description: "Not logged in"});

    } else if ( session.login == true ){

        const userId = session.user_id;
        const tasks = db.collection("tasks");
    
        // Form data
        const postData = req.body;
    
        console.log(postData);
        const currDate = new Date();
        const dueDate = new Date(postData.due_at);
    
        const timeLeft = dueDate - currDate;
    
        const task = { // Just replace the html with req.body and we're set
            user_id: userId,
            name: postData.name,
            description: postData.description,
            is_finished: false,
    
            created_at: currDate,
            due_at: dueDate,
            time_left: timeLeft
        }
        const insertTask = await tasks.insertOne(task);

        console.log(insertTask.insertedId);
        task._id = insertTask.insertedId;
        console.log(task);
    
        res.json({ status: "Success", description: "Task added successfully", content: task });
    }
});

app.post("/delete", async (req, res) => {
    const session = req.session;
    
    if(Object.values(session).length == 0){
        res.json({status: "403", description: "Not logged in"});
        
    } else if ( session.login == false){
        res.json({status: "403", description: "Not logged in"});
    
    } else if ( session.login == true ){
        console.log("body", req.body)
        const tasks = db.collection("tasks");
        // Add task
        const result = await tasks.deleteOne( {_id : new ObjectId(req.body.id) } );

        res.json(result);

    }
    
});

app.post("/toggle", async (req, res) => {
    const session = req.session;

    if(Object.values(session).length == 0){
        res.json({status: "403", description: "Not logged in"});
        
    } else if ( session.login == false){
        res.json({status: "403", description: "Not logged in"});
    
    } else if ( session.login == true ){

        const tasks = db.collection("tasks");

        const result = await tasks.findOneAndUpdate( 
            { _id : new ObjectId(req.body.id) } ,
            [{ $set: {is_finished : { $eq : [false, "$is_finished"] } }}]
        );
        // const result = await tasks.findOneAndUpdate( 
        //     { _id : new ObjectId(req.body.id) } ,
        //     { $set: {is_finished : true }}
        // );

        res.json(result);
    }
})


app.get( "/login", (req, res) => {
    // Return Login HTML
    res.render("login", {status: ""});
})

app.post( "/login", async (req, res) => {
    // Configure Login Code
    const postData = req.body;
    const users = db.collection("users");

    // Check it user exists
    const gtUserQry = { username: postData.username };

    userOrNull = await users.findOne(gtUserQry);

    if(userOrNull == null){
        res.render("login", {status: "Username not found, please try another username"});
    } else {

        if(postData.password === userOrNull.password){
            // Add to session.
            req.session.login = true;
            req.session.user_id = userOrNull._id;

            // console.log(req.session);
            res.redirect("/")
        } else {
            res.render("login", {status: "You entered the wrong password, make sure your password is right and please try again"});
        }
    }
})


app.get( "/signup", (req, res) => {
    // Return Sign up HTML
    res.render("signup", {status: ""});
})

app.post( "/signup", async (req, res) => {
    // Configure Signup code, then link back to /login
    const postData = req.body;

    const users = db.collection("users");

    // Redirect if user already exists
    const gtUserQry = { username: postData.username };
    const userOrNull = await users.findOne(gtUserQry);

    if(userOrNull != null){
        // Redirect to signup saying "Username already exists"
        res.render("signup", {status: "User already exists"});
    } else {
        // Now check passcodes
        if(postData.password !== postData.password2){
            // Redirect to sign up and say "Passwords muct be the same"
            res.render("signup", {status: "Passwords don't match, please try again"});
        } else {
            const newUser = await users.insertOne(postData);
            req.session.login = true;
            req.session.user_id = newUser._id; 
            res.redirect("/");
        }
    }


});

app.get("/logout", async(req, res) => {
    res.render("logout");
})
app.post("/logout", async (req, res) => {
    if(Object.values(req.session).length === 0){
        res.redirect("/login");
    }

    req.session.login = false;
    req.session.user_id = "";


    res.redirect("/login");
})

// Db setup
let db = null;

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    db = client.db("MainCluster");

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.log("Something went horribly wrong D: ", err);
    await client.close();
  }
}


// Notify me when the server runs so I don't think it's not running on me and I don't
// waste 3 hours debugging it (hypothetical, I did not actually do this. Really, I didn't.)
const PORT  = process.env.PORT || 3000;
const launchMsg = `
======================
Server successfully launched 🚀

Running at http://localhost:${PORT}

======================

`;

run().catch(console.dir);
app.listen(PORT, () => console.log(launchMsg));
