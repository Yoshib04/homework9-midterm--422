import { Router } from "express";
import { prisma } from "../db.js";

export const entriesRouter = Router();

//get /entries 
entriesRouter.get("/", async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

//get /entries/:id 
entriesRouter.get("/:id", async (req, res) => {
  try {
    const entry = await prisma.entry.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// post /entries 
entriesRouter.post("/", async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    const newEntry = await prisma.entry.create({
      data: { title, body }
    });

    res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// put /entries/:id 
entriesRouter.put("/:id", async (req, res) => {
  try {
    const { title, body } = req.body;

    const updatedEntry = await prisma.entry.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body })
      }
    });

    res.json(updatedEntry);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Entry not found" });
  }
});

// delete /entries/:id  
entriesRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.entry.delete({
      where: { id: Number(req.params.id) }
    });

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Entry not found" });
  }
});