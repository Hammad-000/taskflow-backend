
import "dotenv/config";
import connectDB from "./config/db.js";

const startServer = async () => {
  try {
    console.log("Connecting database...");

    await connectDB();

    console.log("Database connection ready!");

    const { default: app } = await import("./app.js");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
