// npm run dev

const path = require("path"); // reliable way to work in windows/mac
const envPath = path.resolve(__dirname, ".env");
require("dotenv").config({ path: envPath });

module.exports = {
  apps: [
    {
      name: "backend",
      script: "server.js",
      time: true,
      watch: true,
      ignore_watch: ["node_modules"],
      env: {
        DATABASE: process.env.DATABASE,
        PORT: process.env.PORT,
      },
    },
  ],
};
