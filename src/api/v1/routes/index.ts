//NOTE: THE ORDER OF ROUTES MATTER
import express from "express";
import hubtelController from "../controllers/hubtel";
import authController from "../controllers/auth";

const router = express.Router();

router.post("/login", authController.generateAToken);
router.get("/hubtel", hubtelController.getDataBetweenDates);

export = router;
