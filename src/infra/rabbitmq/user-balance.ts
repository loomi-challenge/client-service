import amqp from "amqplib";
import { UpdateUserBalanceUsecase } from "@/application/usecases/User/update-user-balance.usecase";
import { UserRepository } from "../repositories/prisma/User/user.repository";
import { UserCacheRepository } from "../repositories/cache/User/user-cache.repository";

export async function startTransactionConsumer() {
  console.log("🐰 Iniciando consumer de transações...");

  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();
  const queue = "new-transactions";
  const updateUserBalanceUsecase = new UpdateUserBalanceUsecase(
    new UserRepository(),
    new UserCacheRepository()
  );

  await channel.assertQueue(queue);

  console.log(
    `📥 Consumer conectado à queue '${queue}' - aguardando transações...`
  );

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    console.log("📨 Nova transação recebida:");
    console.log("  - Conteúdo:", msg.content.toString());

    try {
      const { receiverid, senderid, amount } = JSON.parse(
        msg.content.toString()
      );

      if (!receiverid || !senderid || !amount) {
        console.log(
          "❌ Formato inválido: esperado receiverid, senderid e amount"
        );
        return channel.nack(msg, false, false);
      }

      console.log(
        `💰 Processando transação: ${senderid} → ${receiverid} (${amount})`
      );

      console.log(`📤 Diminuindo saldo do usuário ${senderid}: -${amount}`);
      await updateUserBalanceUsecase.execute({
        id: senderid,
        amount: amount,
        type: "out",
      });

      console.log(`📥 Aumentando saldo do usuário ${receiverid}: +${amount}`);
      await updateUserBalanceUsecase.execute({
        id: receiverid,
        amount: amount,
        type: "in",
      });

      console.log("✅ Saldos atualizados com sucesso!");
      console.log("─".repeat(50));

      channel.ack(msg);
    } catch (error) {
      console.log(
        `❌ Erro ao processar transação: ${(error as Error).message}`
      );
      channel.nack(msg, false, false);
    }
  });
}
