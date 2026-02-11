import express, { Request, Response } from "express";
import { matchRouter } from "./routes/matches";


const app = express();
const PORT = 8000;


app.use(express.json());


app.use("/matches", matchRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
