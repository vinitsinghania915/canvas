require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/canvas-editor";
    
    console.log("Testing MongoDB connection...");
    console.log("URI:", mongoURI);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    await mongoose.connect(mongoURI, options);
    console.log("✅ MongoDB connected successfully");
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📁 Available collections:", collections.map(c => c.name));
    
    // Check connection state
    console.log("🔗 Connection state:", mongoose.connection.readyState);
    console.log("📊 Connection host:", mongoose.connection.host);
    console.log("📊 Connection port:", mongoose.connection.port);
    console.log("📊 Connection name:", mongoose.connection.name);
    
    await mongoose.connection.close();
    console.log("✅ Connection closed successfully");
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

testConnection();
