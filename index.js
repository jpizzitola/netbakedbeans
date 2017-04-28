var express = require("express");
var config = require("./config");
var path = require("path");
var app = express();


// keeps server info out of header
app.disable("x-powered-by");

var formidable = require("formidable");

var credentials = require("./credentials.js");
app.use(require("cookie-parser")(credentials.cookieSecret));

var handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.use(require("body-parser").urlencoded({ extended: true }));

app.set("port", process.env.PORT || 3000);



function getModel() {
  return require(`./model-cloudsql`);
}



app.use(express.static(__dirname + "/public"));


//_______________________
//|                     |
//|      APP.POST       |
//|_____________________|


app.post("/process", function(req, res) {
  console.log("Form : " + req.query.form);
  console.log("CSRF token : " + req.body._csrf);
  console.log("Email : " + req.body.email);
  console.log("Question : " + req.body.ques);
  res.redirect(303, "/thankyou");
});



app.post("/register", (req, res, next) => {
  var registerFormData = req.body;

  console.log(registerFormData);

  // Save the data to the database.
  getModel().registerUser(registerFormData, (error, savedData) => {


      console.log("SAVED DATA:====");
      console.log(savedData);
      res.redirect(`login`);
  });
});


app.post("/rent", (req, res, next) => {
      var rentalData = req.body;
      var rentalDataSQL = {film_id:rentalData.film_id, title:rentalData.title, description:rentalData.description, rental_rate:rentalData.rental_rate};
      console.log(rentalDataSQL);
      getModel().addToCart(rentalDataSQL,(error, savedData) =>{
  });
      res.redirect(`cart`);
});





app.post("/updateuser", (req, res, next) => {
      var userEdit = req.body;

      console.log(userEdit);
      getModel().updateUser(userEdit,(error, results) =>{
      if (error) {
       console.log(error);

       next(error);
      return;}
      console.log(results);


      res.redirect(`allusers`);
  });
      
});

app.post("/updatemovie", (req, res, next) => {
      var movieEdit = req.body;

      console.log(movieEdit);
      getModel().updateMovie(movieEdit,(error, results) =>{
      if (error) {
       console.log(error);
       next(error);
      return;}
      console.log(results);



  });
      res.redirect(`admin-movies`);
});

app.post("/getmovie", (req, res, next) => {
      var filmID = req.body;

      console.log(filmID);
      getModel().getMovie(filmID,(error, results) =>{
      if (error) {
       console.log(error);
        next(error);
      return;}
      var movieObj = results;
      console.log(results);



      res.render("admin-editmovies", {movie: results});


  });5

});

app.post("/getuser", (req, res, next) => {
      var userID = req.body;

      console.log(userID);
      getModel().getUser(userID,(error, results) =>{
      if (error) {
       console.log(error);
        next(error);
      return;}
      var movieObj = results;
      console.log(results);



      res.render("admin-editusers", {user: results});


  });

});


app.post("/addemployee", (req, res, next) => {
  var registerFormData = req.body;

  //

  console.log(registerFormData);

  // Save the data to the database.
  getModel().registerUser(registerFormData, (error, savedData) => {


      console.log("SAVED DATA:====");

      console.log(savedData);
      res.redirect(`login`);
  });
});


app.post("/addmovie", (req, res, next) => {
  var registerFormData = req.body;
  //registerFormData.push({admin: 0});
  console.log(registerFormData);

  // Save the data to the database.
  getModel().addMovie(registerFormData, (error, savedData) => {




  });
  res.redirect(`login`);
});




app.post("/file-upload/:year/:month", function(req, res) {
  // Parse a file that was uploaded
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, file) {
    if (err) return res.redirect(303, "/error");
    console.log("Received File");

    // Output file information
    console.log(file);
    res.redirect(303, "/thankyou");
  });
});

app.post("/removefromcart", (req, res, next) => {
      var cartID = req.body;
      console.log(cartID);
      getModel().removeFromCart(cartID,(error, savedData) =>{

  });
      console.log("i ran here");
      res.redirect(`cart`);
});

app.post("/removefromcheckout", (req, res, next) => {
      var cartID = req.body;
      console.log(cartID);
      getModel().removeFromCart(cartID,(error, savedData) =>{

  });
      console.log("i ran here");
      res.redirect(`checkout`);
});

app.post("/removemovie", (req, res, next) => {
      var film_id = req.body;
      console.log(film_id);
      getModel().deleteMovie(film_id,(error, results) =>{
        console.log(results);
  });
      console.log("i ran here");
      res.redirect(`admin-movies`);
});

app.post("/removeuser", (req, res, next) => {
      var customerID = req.body;
      console.log(customerID);
      getModel().deleteUser(customerID,(error, results) =>{
        console.log(results);
  });
      console.log("i ran here");

      res.redirect(`allusers`);
});


app.post("/search", (req, res, next) => {
      var searchTerm = req.body;

      console.log(searchTerm);
      getModel().search(searchTerm, (err, results) => {
    if (err) {
      console.log(err);
      next(err);
      return;
    }

    console.log(results);
     res.render("movies", {movies: results});

  });

});
app.post("/loginAuth", (req, res, next) => {
 var loginFormData = req.body;

  getModel().loginAuth(loginFormData, (error, results) => {

      if(error){
      console.log("search DATA:====");
      console.log(error);
      res.render(`loginUnsuccessful`);

  }
  else{



    res.cookie("userinfo",results, { expire: new Date() + 9999 })

    if (results.admin == 0){
      console.log("i ran so far away");
    res.render('customer');
  }
  else if (results.admin == 1){
    res.render('admin-home');
  }
  }
  });
});

app.post("/editlogin", (req, res, next) => {
 var loginFormData = req.body;

  getModel().loginAuth(loginFormData, (error, results) => {

      if(error){
      console.log("search DATA:====");
      console.log(error);
      res.render(`customer-unsuccessfuleditlogin`);

  }
  else{

    //res.cookie("userinfo",results, { expire: new Date() + 9999 })
    var userObj = results;
    console.log(results);



    res.render('customer-editinfo', {user: results});

  }

  });
});

//_______________________
//|                     |
//|      APP.GET        |
//|_____________________|


app.get("/", function(req, res) {
  res.redirect("login");
});

app.get("/addmovie", function(req, res) {
  res.render("addmovie");
});

app.get("/admin-editmovies", function(req, res) {
  res.render("admin-editmovies");
});



app.get("/admin-home", function(req, res) {
  res.render("admin-home");
});

app.get("/admin-reports", function(req, res) {
  res.render("admin-reports");
});


app.get("/customer", function(req, res) {
  res.render("customer");
});



app.get("/customer-editinfo", function(req, res) {
  res.render("customer-editinfo");
});
app.get("/customer-editlogin", function(req, res) {
  res.render("customer-editlogin");
});
app.get("/customer-unsuccessfuleditlogin", function(req, res) {
  res.render("customer-unsuccessfuleditlogin");
});
app.get("/login", function(req, res) {

  res.render("login");
});

app.get("/addemployee", function(req, res) {
  res.render("addemployee");
});

app.get("/welcome", function(req, res) {
  res.render("customer");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/about", function(req, res) {
  // Point at the about.handlebars view
  // Allow for the test specified in tests-about.js
  res.render("about");
});
app.get("/logout", function(req, res) {
  res.render("login");
});

app.get("/contact", function(req, res) {
  // CSRF tokens are generated in cookie and form data and
  // then they are verified when the user posts
  res.render("contact", { csrf: "CSRF token here" });
});

app.get("/thankyou", function(req, res) {
  res.render("thankyou");
});



app.get('/allusers', (req, res, next) => {
  //if cookie.admin ==1 then allow this to run else display unauthorized to view this page
  getModel().listUsers(10000, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }


    res.render('allusers', {
      users: entities,

      nextPageToken: cursor
    });
  });
});



app.get('/movies', (req, res, next) => {
  getModel().list(10000, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }


    res.render('movies', {
      movies: entities,

      nextPageToken: cursor
    });
  });
});


app.get('/admin-movies', (req, res, next) => {
  getModel().list(10000, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }


    res.render('admin-movies', {
      movies: entities,

      nextPageToken: cursor
    });
  });
});

app.get('/cart', (req, res, next) => {
  getModel().getCart(10000, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }


    res.render('cart', {
      movies: entities,

      nextPageToken: cursor
    });
  });
});

app.get('/checkout', (req, res, next) => {
  getModel().getCart(10000, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }


    res.render('checkout', {
      movies: entities,

      nextPageToken: cursor
    });
  });
});

app.get('/wishlist', (req, res, next) => {
  getModel().getWishList(10000, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }


    res.render('wishlist', {
      movies: entities,

      nextPageToken: cursor
    });
  });
});


app.get("/nothing", function(req, res) {
  // Set the key and value as well as expiration
  res
    .cookie(res, { expire: new Date() + 9999 })
    .send(res);
});

// Show stored cookies in the console
app.get("/listcookies", function(req, res) {
  console.log("Cookies : ", req.cookies);
  res.send("Look in console for cookies");
});

// Delete a cookie
app.get("/deletecookie", function(req, res) {
  res.clearCookie("username");
  res.send("username Cookie Deleted");
});

app.get("/file-upload", function(req, res) {
  var now = new Date();
  res.render("file-upload", {
    year: now.getFullYear(),
    month: now.getMonth()
  });
});
app.get("/viewcount", function(req, res, next) {
  res.send(
    "You viewed this page " + req.session.views["/viewcount"] + " times "
  );
});

// Reading and writing to the file system
// Import the File System module : npm install --save fs
var fs = require("fs");

app.get("/readfile", function(req, res, next) {
  // Read the file provided and either return the contents
  // in data or an err
  fs.readFile("./public/randomfile.txt", function(err, data) {
    if (err) {
      return console.error(err);
    }
    res.send("The File : " + data.toString());
  });
});
app.get("/writefile", function(req, res, next) {
  // If the file doesn't exist it is created and then you add
  // the text provided in the 2nd parameter
  fs.writeFile("./public/randomfile2.txt", "More random text", function(err) {
    if (err) {
      return console.error(err);
    }
  });

  // Read the file like before
  fs.readFile("./public/randomfile2.txt", function(err, data) {
    if (err) {
      return console.error(err);
    }

    res.send("The File : " + data.toString());
  });
});

//_______________________
//|                     |
//|      APP.USE        |
//|_____________________|

// Defines a custom 404 Page and we use app.use because
// the request didn't match a route (Must follow the routes)
app.use(function(req, res) {
  // Define the content type
  res.type("text/html");

  // The default status is 200
  res.status(404);

  // Point at the 404.handlebars view
  res.render("404");
});

// Custom 500 Page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);

  // Point at the 500.handlebars view
  res.render("500");
});

app.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  console.log(err.message);
  next(err);
});

app.use(function(req, res, next) {
  console.log("Looking for URL : " + req.url);
  next();
});


app.use(function(err, req, res, next) {
  console.log("Error : " + err.message);
  next();
});




// Demonstrate how to set a cookie


// Storing session information can be done in a few ways.
// For development we can work with a memory store
// Stores the session id in a cookie and the session data
// on the server
// npm install --save express-session

var session = require("express-session");

// parseurl provides info on the url of a request object
// npm install --save parseurl
var parseurl = require("parseurl");

app.use(
  session({
    // Only save back to the session store if a change was made
    resave: false,

    // Doesn't store data if a session is new and hasn't been
    // modified
    saveUninitialized: true,

    // The secret string used to sign the session id cookie
    secret: credentials.cookieSecret
  })
);

// This is another example of middleware.
app.use(function(req, res, next) {
  var views = req.session.views;

  // If no views initialize an empty array
  if (!views) {
    views = req.session.views = {};
  }

  // Get the current path
  var pathname = parseurl(req).pathname;
  // Increment the value in the array using the path as the key
  views[pathname] = (views[pathname] || 0) + 1;

  next();
});

// When this page is accessed get the correct value from
// the views array





app.listen(app.get("port"), function() {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      " press Ctrl-C to terminate"
  );
});
