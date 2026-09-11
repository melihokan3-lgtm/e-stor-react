import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the API server");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

const seedProducts = [
  ["Fresh Milk", 3.49, "Fresh whole milk for everyday use.", "Dairy", "/img/milk1.png"],
  ["Organic Milk", 4.29, "Creamy organic milk.", "Dairy", "/img/milk2.png"],
  ["Farm Eggs", 5.99, "Fresh farm eggs.", "Eggs", "/img/egg1.png"],
  ["Free Range Eggs", 6.49, "Free range eggs from local farms.", "Eggs", "/img/egg2.png"],
  ["Cheddar Cheese", 7.99, "Rich and delicious cheddar cheese.", "Cheese", "/img/cheese1.png"],
  ["Fresh Cheese", 6.99, "Soft cheese for breakfast and snacks.", "Cheese", "/img/cheese2.png"],
  ["Daily Essentials", 8.49, "A practical grocery essential.", "Grocery", "/img/image 1.png"],
  ["Healthy Choice", 9.99, "A quality choice for your kitchen.", "Grocery", "/img/image 2.png"],
];

async function ensureProductTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      image TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count === 0) {
    for (const product of seedProducts) {
      await pool.query(
        "INSERT INTO products (title, price, description, category, image) VALUES ($1, $2, $3, $4, $5)",
        product,
      );
    }
    console.log(`Seeded ${seedProducts.length} products`);
  }
}

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error", message: "Database unavailable" });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, price::float, description, category, image
       FROM products ORDER BY id DESC`,
    );
    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch products", error);
    res.status(500).json({ message: "Products could not be loaded" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, title, price::float, description, category, image
       FROM products WHERE id = $1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to fetch product", error);
    res.status(500).json({ message: "Product could not be loaded" });
  }
});

ensureProductTable()
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((error) => {
    console.error("Could not initialize database", error.message);
    process.exit(1);
  });
