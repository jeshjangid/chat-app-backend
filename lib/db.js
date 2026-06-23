import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

export const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("Database connected"));
        const rawUri = process.env.MONGODB_URI || '';
        const uri = rawUri.replace(/^['\"]|['\"]$/g, '') // strip surrounding quotes
                          .replace(/\/$/, ''); // remove trailing slash
        await mongoose.connect(uri);
        
    } catch (error) {
        console.error(`Error connecting to DB: ${error.message}`);
        throw error;
    }
}