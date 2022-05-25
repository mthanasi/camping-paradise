const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  DB_URL: process.env.DB_URL,
  PASSPORT_SECRET: process.env.PASSPORT_SECRET,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
  CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
};
