import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./infra/http/routes/User/route";
import { startConsumer } from "./infra/rabbitmq/user-validation";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Access the API at: http://localhost:${port}`);
  startConsumer().catch((err) => {
    console.error("❌ Erro ao iniciar o consumer:", err);
  });
});
