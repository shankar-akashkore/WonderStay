const { required, types } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

// const listingSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: String,
//     // image: {
//     //     type: String,
//     //     default: "https://unsplash.com/photos/coconut-tree-on-beach-shore-during-daytime-ueBmz9K8zT",
//     //     set: (v) => 
//     //         v === "" 
//     //           ? "https://unsplash.com/photos/coconut-tree-on-beach-shore-during-daytime-ueBmz9K8zT" 
//     //           :v,
//     // },
//     image: {
//         filename: String,
//         url: {
//             type: String,
//             default:
//                 "https://unsplash.com/photos/coconut-tree-on-beach-shore-during-daytime-ueBmz9K8zT"
//         },
//     },
//     price: Number,
//     location: String,
//     country: String,
// });

// const Listing = mongoose.model("Listing",listingSchema);
// module.exports = Listing; 


const listingSchema = new Schema({
    title: {
        type: String,
        required: true,   // FIXED
    },
    description: {
        type: String,
        required: true,   // Optional but recommended
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        required: true,   // Recommended
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    host: {
        type: String,
        required: true,
    },
    hostrating: {
        type: Number,
        required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: ["Beach","Rooms","Buildings","Pools","Mountains","Arctic","Camping"]
    }
});

listingSchema.post("findOneAndDelete",async (listing) => {
    if(listing){
        await Review.deleteMany({_id: {$in : listing.reviews} });
    }
})
module.exports = mongoose.model("Listing",listingSchema);