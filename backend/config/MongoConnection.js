const mongoose = require('mongoose');

class MongoConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    if (this.isConnected) {
      console.log('Sử dụng kết nối MongoDB hiện có');
      return this.connection;
    }

    try {
      const db = await mongoose.connect(process.env.MONGODB_URI);
      this.connection = db;
      this.isConnected = true;
      console.log('MongoDB kết nối thành công (Singleton)');
      return this.connection;
    } catch (error) {
      console.error('Lỗi kết nối MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }
    
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connection = null;
      console.log('MongoDB đã ngắt kết nối');
    } catch (error) {
      console.error('Lỗi khi ngắt kết nối MongoDB:', error);
      throw error;
    }
  }

  // Singleton pattern
  static getInstance() {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }
}

module.exports = MongoConnection.getInstance();