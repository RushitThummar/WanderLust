//here data insert in DB|for run terminal:-cd init&node index.js
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  //delete first insert data
  await Listing.deleteMany({});
  //ading owner property in every object
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "67ef7360bcb0f53e080c4db0",
  }));
  //insert initdata(object).data(key)
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};
//call function
initDB();
