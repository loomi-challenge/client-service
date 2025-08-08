import amqp from "amqplib";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { UserRepository } from "../repositories/prisma/User/user.repository";
import { UserCacheRepository } from "../repositories/cache/User/user-cache.repository";

export async function startBalanceCheckConsumer() {
  console.log("🐰 Iniciando consumer de verificação de saldo...");

  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();
  const queue = "check-balance";
  const findUserUsecase = new FindUserUsecase(
    new UserRepository(),
    new UserCacheRepository()
  );

  await channel.assertQueue(queue);

  console.log(
    `📥 Consumer conectado à queue '${queue}' - aguardando mensagens...`
  );

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    console.log("📨 Nova mensagem de verificação de saldo recebida:");
    console.log("  - Conteúdo:", msg.content.toString());
    console.log("  - CorrelationId:", msg.properties.correlationId);
    console.log("  - ReplyTo:", msg.properties.replyTo);

    try {
      const { senderUserId, amount } = JSON.parse(msg.content.toString());

      if (!senderUserId || !amount) {
        console.log("❌ Formato inválido: esperado senderUserId e amount");
        return channel.nack(msg, false, false);
      }

      console.log(
        `💰 Verificando saldo do usuário ${senderUserId} para transação de ${amount}`
      );

      let user = null;
      let hasSufficientBalance = false;
      let currentBalance = 0;
      let errorMessage = null;

      try {
        console.log(`👤 Buscando usuário: ${senderUserId}`);
        user = await findUserUsecase.execute(senderUserId);

        if (!user) {
          console.log(`❌ Usuário ${senderUserId}: NÃO ENCONTRADO`);
          errorMessage = "Usuário não encontrado";
        } else {
          currentBalance = user.bankingDetails?.balance || 0;
          hasSufficientBalance = currentBalance >= amount;

          console.log(
            `${hasSufficientBalance ? "✅" : "❌"} Usuário ${senderUserId}: ${
              hasSufficientBalance
                ? `SALDO SUFICIENTE (${currentBalance} >= ${amount})`
                : `SALDO INSUFICIENTE (${currentBalance} < ${amount})`
            }`
          );
        }
      } catch (error) {
        console.log(
          `❌ Erro ao buscar usuário ${senderUserId}: ${
            (error as Error).message
          }`
        );
        errorMessage = `Erro ao buscar usuário: ${(error as Error).message}`;
      }

      const response = {
        hasSufficientBalance,
        currentBalance,
        requiredAmount: amount,
        senderUserId,
        userExists: !!user,
        errorMessage,
      };

      console.log(
        `${hasSufficientBalance ? "✅" : "❌"} Verificação final: ${
          hasSufficientBalance
            ? `SALDO SUFICIENTE`
            : `SALDO INSUFICIENTE${errorMessage ? ` (${errorMessage})` : ""}`
        }`
      );

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(response)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      console.log(`📤 Resposta enviada para: ${msg.properties.replyTo}`);
      console.log(
        `📊 Resultado: Saldo ${currentBalance} ${
          hasSufficientBalance ? ">=" : "<"
        } ${amount} (${hasSufficientBalance ? "APROVADO" : "REJEITADO"})`
      );
      console.log("─".repeat(50));

      channel.ack(msg);
    } catch (error) {
      console.log(
        `❌ Erro ao processar verificação de saldo: ${(error as Error).message}`
      );

      const errorResponse = {
        hasSufficientBalance: false,
        currentBalance: 0,
        requiredAmount: 0,
        senderUserId: "unknown",
        userExists: false,
        errorMessage: `Erro no processamento: ${(error as Error).message}`,
      };

      try {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(errorResponse)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        console.log(
          `📤 Resposta de erro enviada para: ${msg.properties.replyTo}`
        );
      } catch (replyError) {
        console.log(
          `❌ Erro ao enviar resposta de erro: ${(replyError as Error).message}`
        );
      }

      channel.nack(msg, false, false);
    }
  });
}
