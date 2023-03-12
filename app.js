if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const helmet = require("helmet");

const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
const policies = require("./helmet_policies/policies");
//const dbUrl = process.env.DB_URL;
const devUrl = "mongodb://localhost:27017/yelp-camp";
mongoose
  .connect(devUrl)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Connection error");
    console.log(err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
const port = 3000;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const store = new MongoStore({
  mongoUrl: devUrl,
  secret: "thisshouldbeabettersecret",
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  name: "session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(helmet());
app.use(
  helmet({
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...policies.connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...policies.scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...policies.styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/duxglbpuy/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...policies.fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  /* This is a middleware that is checking if the user is trying to access the login page or the home
  page. If they are not, then it is setting the session returnTo to the originalUrl. */
  if (!["/login", "/"].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => console.log(`Yelp App listening on port ${port}!`));
