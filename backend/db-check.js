const mongoose = require('mongoose');

const uri = "mongodb+srv://sreesanthkb01_db_user:MuLW4iVhRSDWIkCc@cluster0.nt8zxyj.mongodb.net/job_tracker?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB via Mongoose!");
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections:`, collections.map(c => c.name).join(', '));
    
    // For each collection, count and fetch the first few documents
    for (const col of collections) {
      console.log(`\n--- Collection: ${col.name} ---`);
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`Total documents: ${count}`);
      
      if (count > 0) {
        const docs = await mongoose.connection.db.collection(col.name).find().limit(3).toArray();
        console.log(`Preview of up to 3 documents:`);
        console.log(JSON.stringify(docs, null, 2));
      }
    }
  } catch (err) {
    console.error("Error connecting to database:", err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
