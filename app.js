//main js file

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

//set view path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//access deta who will come with req
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//use ejs-mate
app.engine("ejs", ejsMate);
//use public folder
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, //for lazy update
});
store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  //set cookie options
  cookie: {
    //cookie expire after 7 days
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// //root
// app.get("/", (req, res) => {
//   res.send("root is working");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//session-flash local mid-ware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  res.locals.currUser = req.user;
  next();
});

//listing
//when listings come we use listingRouter
app.use("/listings", listingRouter);
//reviewRouter
app.use("/listings/:id/reviews", reviewRouter);
//userRouter
app.use("/", userRouter);

//custom ExpressError
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("listining on port 8080");
});
