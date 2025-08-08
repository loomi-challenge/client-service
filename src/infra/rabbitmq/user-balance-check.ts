import amqp from "amqplib";
import { CheckUserBalanceUsecase } from "@/application/usecases/User/check-user-balance.usecase";
import { container } from "tsyringe";

export async function startBalanceCheckConsumer() {
  console.log("🐰 Iniciando consumer de verificação de saldo...");

  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();
  const queue = "check-balance";
  
  const checkUserBalanceUsecase = container.resolve(CheckUserBalanceUsecase);

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

      const result = await checkUserBalanceUsecase.execute({
        userId: senderUserId,
        amount: amount,
      });

      console.log(
        `${result.hasSufficientBalance ? "✅" : "❌"} Usuário ${senderUserId}: ${
          result.hasSufficientBalance
            ? `SALDO SUFICIENTE (${result.currentBalance} >= ${amount})`
            : `SALDO INSUFICIENTE (${result.currentBalance} < ${amount})`
        }${result.errorMessage ? ` - ${result.errorMessage}` : ""}`
      );

      const response = {
        hasSufficientBalance: result.hasSufficientBalance,
        currentBalance: result.currentBalance,
        requiredAmount: result.requiredAmount,
        senderUserId: result.userId,
        userExists: result.userExists,
        errorMessage: result.errorMessage,
      };

      console.log(
        `${result.hasSufficientBalance ? "✅" : "❌"} Verificação final: ${
          result.hasSufficientBalance
            ? `SALDO SUFICIENTE`
            : `SALDO INSUFICIENTE${result.errorMessage ? ` (${result.errorMessage})` : ""}`
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
        `📊 Resultado: Saldo ${result.currentBalance} ${
          result.hasSufficientBalance ? ">=" : "<"
        } ${amount} (${result.hasSufficientBalance ? "APROVADO" : "REJEITADO"})`
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
