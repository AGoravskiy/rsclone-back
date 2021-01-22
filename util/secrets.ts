import * as dotenv from 'dotenv';

dotenv.config();

export const { MONGO_CONNECTION_URL } = process.env;

if (!MONGO_CONNECTION_URL) {
  console.log('No mongo connection string. Set MONGODB_URI environment variable.');
  process.exit(1);
}

export const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  console.log('No JWT secret string. Set JWT_SECRET environment variable.');
  process.exit(1);
}
