import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import {
  connectDB,
  authRouter,
  userRouter,
  organizationsRouter,
  employeeRouter,
  teamsRouter,
  spaceRouter,
  projectRouter,
  taskRouter,
  subTaskRouter,
  inviteRouter,
} from "./localImport.js";

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// ENDPOINTS
app.get("/", (req, res) => {
  res.send("Healthy API");
});

const basePath = "/api/v1";
app.use(`${basePath}/auth`, authRouter);
app.use(`${basePath}/users`, userRouter);
app.use(`${basePath}/organizations`, organizationsRouter);
app.use(`${basePath}/employees`, employeeRouter);
app.use(`${basePath}/organization/teams`, teamsRouter);
app.use(`${basePath}/spaces`, spaceRouter);
app.use(`${basePath}/projects`, projectRouter);
app.use(`${basePath}/tasks`, taskRouter);
app.use(`${basePath}/subtasks`, subTaskRouter);
app.use(`${basePath}/invites`, inviteRouter);

const PORT = process.env.PORT || process.env.API_PORT;
console.log("Port: " + PORT);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
