const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    description: String,
    // image: {
    //     type: String,
    //     default: "https://unsplash.com/photos/coconut-tree-on-beach-shore-during-daytime-ueBmz9K8zT",
    //     set: (v) => 
    //         v === "" 
    //           ? "https://unsplash.com/photos/coconut-tree-on-beach-shore-during-daytime-ueBmz9K8zT" 
    //           :v,
    // },
    image: {
        filename: String,
        url: {
            type: String,
            default:
                "https://unsplash.com/photos/coconut-tree-on-beach-shore-during-daytime-ueBmz9K8zT"
        },
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing; 