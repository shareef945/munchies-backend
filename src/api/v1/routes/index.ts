//NOTE: THE ORDER OF ROUTES MATTER
import express from "express";
import hubtelController from "../controllers/hubtel";

const router = express.Router();

router.get("/hubtel", hubtelController.getDataBetweenDates);

export = router;
