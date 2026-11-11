import "dotenv/config";
import express from "express";
import cors from "cors";
import { routes } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/", routes);

app.get("/", (req, res) => {
  res.json({ message: "Journal API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});