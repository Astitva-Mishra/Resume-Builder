import mongoose from "mongoose";
export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://mailastitva15_db_user:resumebuilder@cluster0.8okpw4b.mongodb.net/RESUME')
    .then(() => {
        console.log("MongoDB connected successfully")
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
    });
}