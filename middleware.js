//in this folder have diffrent make mid-ware
const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  //console.log(req.path, "..", req.originalUrl);

  if (!req.isAuthenticated()) {
    //redirct url
    req.session.redirectUrl = req.originalUrl;
    //console.log(req.session.redirectUrl);
    req.flash("error", "you must be logged first !");
    return res.redirect("/login");
  }
  next();
};

//save redirect url i licals mid-ware that it excess after session change
module.exports.saveRidirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

//prevent not owner to mak change in listings
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//middleware for listing schema
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  //console.log(result);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//middleware for review schema
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  //console.log(result);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//prevent not author to make change in review
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
