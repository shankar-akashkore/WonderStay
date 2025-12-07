const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/WonderStay";

main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj,owner: '69348ca0620a4369c63f2c2a'}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();