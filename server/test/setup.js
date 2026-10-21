import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { beforeAll, afterAll, afterEach } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

process.env.JWT_SECRET = "test_super_secret_jwt_key_for_testing";
process.env.NODE_ENV = "test";

let mongoServer;

beforeAll(async () => {
  let testUri = process.env.TEST_MONGO_URI;

  if (!testUri && process.env.MONGO_URI) {
    const base = process.env.MONGO_URI;
    if (base.includes("?")) {
      testUri = base.replace(/\/[^/?]+(\?)/, "/test_invoice_db$1");
    } else {
      testUri = base.replace(/\/([^/]*)$/, "/test_invoice_db");
    }
  }

  if (testUri) {
    await mongoose.connect(testUri);
  } else {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
