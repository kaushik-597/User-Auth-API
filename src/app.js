import express from "express";
import cors from "cors";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  //we use middlewares inside the .use()
  //here we are using cors to secure the access to backend and limit it
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

//some common middlewares are those that allow the backend to import
//different types of data such as json, urlencoded or static data available on our device such as images or stuff
//the immediate down this line is the middleware for allowing json data upto the limit of
//16kb to be imported in backend
app.use(express.json({ limit: "16kb" }));

//this middleware is for the urlencoded format of data to be imported in its new form i.e. extended upto 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//this middleware allows the backend to access the static data available on our workspace in some directory
app.use(express.static("public"));

//logic for getting the cookies and setting up the cookieParser as middleware
app.use(cookieParser());

app.get("/", function (req, res) {
  console.log("Cookies", req.cookies);
});

// ok now we are upto the routes of the first controller i built i.e. healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// here im writing the route for user controller
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);

export { app };
