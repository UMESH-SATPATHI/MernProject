import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        vehicle:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Vehicle",
            required:true
        },
        booking:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Booking",
            required:true
        },
        rating:{
            type:Number,
            required:true,
            min:1,
            max:5
        },
        comment:{
            type:String,

        }
    },{timestamps:true}
);
reviewSchema.index({ booking: 1 }, { unique: true });
const Review = mongoose.model("Review", reviewSchema);
export default Review;
