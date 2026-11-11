import { Router } from "express";
import { entriesRouter } from "./entries.routes.js";

export const routes = Router();

routes.use("/entries", entriesRouter);