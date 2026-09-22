require("dotenv").config();
const app = require("./app");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 5050;

prisma
  .$connect()
  .then(() => {
    console.log("PostgreSQL ku xiran (connected) ✅");
    app.listen(PORT, () => console.log(`Canteen server wuxuu ka shaqeynayaa port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database-ka lama xirmi karo:", err.message);
    process.exit(1);
  });
