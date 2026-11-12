
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Atlas Connected Successfully!");
    console.log("MongoDB Ready State:", mongoose.connection.readyState);

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Disconnected!");
    });

    mongoose.connection.on("error", (error) => {
      console.log("MongoDB Error:", error);
    });

  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
