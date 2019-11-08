const Hapi = require("@hapi/hapi");
const Mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const md5 = require("md5");
// var controller = require('./controller/user.controller');

Mongoose.connect("mongodb://localhost/dbUsers",{ useUnifiedTopology: true,  useNewUrlParser: true    } );
//  define model to use database(dbUsers)
const userModel = Mongoose.model("user", {
    username: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String
},"users");

const server = new Hapi.Server({ "host": "localhost", "port": 3000 });

const start = async () =>{
    await server.register(require('@hapi/vision'));
//  require cookie
    server.state('data', {
        ttl: null,
        isSecure: true,
        isHttpOnly: true
    });
//  set views by .pug file and path is './views'
    server.views({
        engines: {
            pug: require('pug')
        },
        relativeTo: __dirname,
        path: 'views'
    });
//  get /
    server.route({
        method: 'GET',
        path:'/',
        handler: function (request, h) {
            return h.view('index', { title: 'Homepage', message: 'Welcome' });
        }
    });
//  get /login
    server.route({
        method: 'GET',
        path:'/login',
        handler: function (request, h) {
            return h.view('login', { title: 'Homepage', message: 'Welcome' });
        }
    });
//  get /signup
    server.route({
        method: 'GET',
        path:'/signup',
        handler: function (request, h) {
            return h.view('signup', { title: 'Homepage', message: 'Welcome' });
        }
    });
//  get /profile
    server.route({
        method: 'GET',
        path:'/profile',
        handler: function (request, h) {
            return h.view('profile', { title: 'Homepage', message: 'Welcome' });
        }
    });    
//  put /profile
    server.route({
        method: "POST",
        path: "/profile",
        options: {
            validate: {
                payload: {
                    username: Joi.string().required(),
                    firstname: Joi.string().required(),
                    lastname: Joi.string().required(),
                    email: Joi.string().required(),
                    // password: Joi.string().required()
                },
                failAction: (request, h, error) => {
                    return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
                }
            }
        },
        handler: async (request, h) => {
            try {
                console.log(request.payload);
                var result = await userModel.findOneAndUpdate(
                    {email:request.payload.email},
                    {
                        username: request.payload.username,
                        firstname:request.payload.firstname,
                        lastname:request.payload.lastname,
                        // password:md5(request.payload.password)
                        // password:request.payload.password
                    }, 
                    { new: true });
                await console.log(result);
                return h.view('login', { title: 'Homepage', message: 'Welcome' });
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });
//  post /login
    server.route({
        method: "POST",
        path: "/login",
        options: {
            validate: {
                payload: {
                    email: Joi.string().required(),
                    password: Joi.string().required()
                },
                failAction: function(request, h, error){
                    return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
                }
            }
        },
        handler: async (request, h) => {
            try {
                var email = request.payload.email;
                var password = md5(request.payload.password);
                var user = await userModel.find({email: email});
                if(user.length!==1){
                    return h.view('login', { 
                        title: 'Homepage',
                        message: 'Welcome', 
                        errors:['User does not exist!'],
                        values: request.payload
                    });
                }
                if(password!==user[0].password){
                    return h.view('login', { 
                        title: 'Homepage',
                        message: 'Welcome', 
                        errors:['Password wrong!'],
                        values: request.payload
                    });
                }
                // await h.state('data', {username: user[0].username, id: user[0].id});
                return h.view('profile', { title: 'Homepage', message: 'Welcome' , user: user[0]});
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });  
//  post /signup
    server.route({
        method: "POST",
        path: "/signup",
        options: {
            validate: {
                payload: {
                    username: Joi.string().required(),
                    firstname: Joi.string().required(),
                    lastname: Joi.string().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    repassword: Joi.string().required()
                },
                failAction: function(request, h, error){
                    return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
                }
            }
        },
        handler: async (request, h) => {
            try {
                var email = request.payload.email;
                var password = md5(request.payload.password);
                var repassword = md5(request.payload.repassword);
                var username = request.payload.username;
                var firstname = request.payload.firstname;
                var lastname = request.payload.lastname;


                var user = await userModel.find({email: email});
                if(user.length){
                    return h.view('signup', { 
                        title: 'Homepage',
                        message: 'Welcome', 
                        errors:['Email has exist!'],
                        values: request.payload
                    });
                }
                if(password!==repassword){
                    return h.view('signup', { 
                        title: 'Homepage',
                        message: 'Welcome', 
                        errors:['rePassword wrong!'],
                        values: request.payload
                    });
                }

                var userTemp = new userModel({
                    "email" : request.payload.email,
                    "password" : md5(request.payload.password),
                    "username" : request.payload.username,
                    "firstname" : request.payload.firstname,
                    "lastname" : request.payload.lastname
                }).save();

                return h.view('index', { title: 'Homepage', message: 'Welcome' });
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });
//  post /user
    server.route({
        method: "POST",
        path: "/user",
        options: {
            validate: {
                payload: {
                    username: Joi.string().required(),
                    firstname: Joi.string().required(),
                    lastname: Joi.string().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required()
                },
                failAction: function(request, h, error){
                    return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
                }
            }
        },
        handler: async (request, h) => {
            try {
                var user = new userModel(request.payload);
                var result = await user.save();
                return h.response(result);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });
//  get /users
    server.route({
        method: "GET",
        path: "/users",
        handler: async (request, h) => {
            try {
                var user = await userModel.find().exec();
                return h.response(user);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });
//  get /user by id
    server.route({
        method: "GET",
        path: "/user/{id}",
        handler: async (request, h) => {
            try {
                var user = await userModel.findById(request.params.id).exec();
                return h.response(user);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });
//  put /user by id
    server.route({
        method: "PUT",
        path: "/user/{id}",
        options: {
            validate: {
                payload: {
                    username: Joi.string().required(),
                    firstname: Joi.string().required(),
                    lastname: Joi.string().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required()
                },
                failAction: (request, h, error) => {
                    return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
                }
            }
        },
        handler: async (request, h) => {
            try {
                var result = await userModel.findByIdAndUpdate(request.params.id, request.payload, { new: true });
                return h.response(result);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });
//  delete /user by id
    server.route({
        method: "DELETE",
        path: "/user/{id}",
        handler: async (request, h) => {
            try {
                var result = await userModel.findByIdAndDelete(request.params.id);
                return h.response(result);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    });

    await server.start();
}
start();

