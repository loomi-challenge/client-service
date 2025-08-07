import "reflect-metadata";
import "./infra/config/container";
import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./infra/http/routes/User/route";
import { startConsumer } from "./infra/rabbitmq/user-validation";
import { startTransactionConsumer } from "./infra/rabbitmq/user-balance";
import { authRouter } from "./infra/http/routes/Auth/route";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Access the API at: http://localhost:${port}`);
  startConsumer().catch((err) => {
    console.error("❌ Erro ao iniciar o consumer:", err);
  });
  startTransactionConsumer().catch((err) => {
    console.error("❌ Erro ao iniciar o consumer:", err);
  });
});
