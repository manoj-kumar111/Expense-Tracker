import express from "express";
import { addExpense } from "../controllers/expense.controller.js";
import { getAllExpense } from "../controllers/expense.controller.js";
import { markAsDone } from "../controllers/expense.controller.js";
import { removeExpense } from "../controllers/expense.controller.js";
import { updateExpense } from "../controllers/expense.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express. Router();

router.route("/add").post(isAuthenticated, addExpense);
router.route("/getall").get(isAuthenticated, getAllExpense);
router.route("/:id/done").put(isAuthenticated, markAsDone);
router.route("/remove/:id").delete(isAuthenticated, removeExpense);
router.route("/update/:id").put(isAuthenticated, updateExpense);

export default router;