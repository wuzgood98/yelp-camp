const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

const baseUrl = "mongodb://localhost:27017/";
const urlPath = "yelp-camp";

mongoose
  .connect(`${baseUrl}${urlPath}`)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Connection error");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //YOUR USER ID
      author: "640b1e6f7abec7885ebbade6",
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Ipsum do ea enim duis consectetur eiusmod. Quis nulla enim in anim laborum. Exercitation fugiat fugiat non commodo mollit in eiusmod minim incididunt. Elit dolore quis voluptate eiusmod voluptate officia nulla esse amet nisi eiusmod. Irure fugiat adipisicing adipisicing exercitation.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/duxglbpuy/image/upload/v1678497442/YelpCamp/vldgtsdrxutyvnmoanz2.png",
          filename: "YelpCamp/vldgtsdrxutyvnmoanz2",
        },
        {
          url: "https://res.cloudinary.com/duxglbpuy/image/upload/v1678497442/YelpCamp/mauadrglzv20tdswzbku.png",
          filename: "YelpCamp/mauadrglzv20tdswzbku",
        },
      ],
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
