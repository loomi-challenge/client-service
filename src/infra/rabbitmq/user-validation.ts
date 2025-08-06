import amqp from "amqplib";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { UserRepository } from "../repositories/prisma/User/user.repository";

export async function startConsumer() {
  console.log("🐰 Iniciando consumer de validação de usuários...");
  
  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();
  const queue = "validate-users";
  const findUserUsecase = new FindUserUsecase(new UserRepository());

  await channel.assertQueue(queue);
  
  console.log(`📥 Consumer conectado à queue '${queue}' - aguardando mensagens...`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    console.log("📨 Nova mensagem recebida:");
    console.log("  - Conteúdo:", msg.content.toString());
    console.log("  - CorrelationId:", msg.properties.correlationId);
    console.log("  - ReplyTo:", msg.properties.replyTo);

    const { userIds } = JSON.parse(msg.content.toString());
    
    if (!Array.isArray(userIds)) {
      console.log("❌ Formato inválido: esperado array de userIds");
      return channel.nack(msg, false, false);
    }
    
    console.log(`🔍 Validando ${userIds.length} usuários: [${userIds.join(', ')}]`);

    const validationResults = [];
    let allValid = true;

    for (const userId of userIds) {
      let user = null;
      let isValid = false;

      try {
        console.log(`👤 Buscando usuário: ${userId}`);
        user = await findUserUsecase.execute(userId);
        isValid = !!user;
        console.log(`${isValid ? '✅' : '❌'} Usuário ${userId}: ${isValid ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
      } catch (error) {
        console.log(`❌ Erro ao buscar usuário ${userId}: ${(error as Error).message}`);
        isValid = false;
      }

      validationResults.push({
        userId,
        valid: isValid
      });

      if (!isValid) {
        allValid = false;
      }
    }

    console.log(`✅ Validação final: ${allValid ? 'TODOS VÁLIDOS' : 'ALGUNS INVÁLIDOS'}`);
    
    const response = {
      allValid,
      results: validationResults,
      totalUsers: userIds.length,
      validUsers: validationResults.filter(r => r.valid).length
    };
    
    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(response)),
      {
        correlationId: msg.properties.correlationId,
      }
    );

    console.log(`📤 Resposta enviada para: ${msg.properties.replyTo}`);
    console.log(`📊 Resultado: ${response.validUsers}/${response.totalUsers} usuários válidos`);
    console.log("─".repeat(50));

    channel.ack(msg);
  });
}

startConsumer();
