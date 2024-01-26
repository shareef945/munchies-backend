require("dotenv").config();
import express, { Express } from "express";
import { expressjwt } from "express-jwt";
import http from "http";
import morgan from "morgan";
import routesV1 from "./api/v1/routes/index";
import { API_PASSWORD, INVALID_TOKEN_MESSAGE, UNPROTECTED_ROUTES, port } from "./config/config";
import { notFound } from "./utils/not-found";
import { scheduleJob } from "./scheduled-jobs/hubtel";

const router: Express = express();
const auth = expressjwt({ secret: API_PASSWORD!, algorithms: ["HS256"] }).unless({ path: UNPROTECTED_ROUTES });

router.use(morgan("dev"));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

scheduleJob();

/** RULES OF OUR API */
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    return res.status(200).json({});
  }
  next();
});

/** ROUTES */
router.use("/v1", auth, routesV1);

router.get("/", (req, res) => {
  res.send("Munchies API Server is running, please use the correct endpoint");
});

/** ERROR HANDLING */
router.use((err: Error, req: any, res: any, next: any) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: INVALID_TOKEN_MESSAGE });
  }
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message,
  });
});

router.use((req, res, next) => {
  res.status(404).send(notFound);
});

/** SERVER */
const httpServer = http.createServer(router);
const PORT: any = port;
httpServer.listen(PORT, () => console.log(`Munchies backend is running on ${PORT}`));
