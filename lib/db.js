// import mongoose from "mongoose";
// import dotenv from 'dotenv'
// dotenv.config();

// export const connectDB = async () => {
//     try {
//         mongoose.connection.on("connected", () => console.log("Database connected"));
//         await mongoose.connect(`${process.env.MONGODB_URI}`);
        
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// }


import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("Database connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        
    } catch (error) {
        // Log the error safely so Vercel keeps running and can retry on the next request
        console.error(`Database connection error: ${error.message}`);
    }
}