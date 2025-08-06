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

    const { senderUserId, receiverUserId } = JSON.parse(msg.content.toString());
    
    console.log(`🔍 Validando usuários - Sender: ${senderUserId}, Receiver: ${receiverUserId}`);

    let sender = null;
    let receiver = null;
    let valid = false;

    try {
      console.log(`👤 Buscando sender: ${senderUserId}`);
      sender = await findUserUsecase.execute(senderUserId);
      console.log(`✅ Sender encontrado: ${sender ? 'SIM' : 'NÃO'}`);
    } catch (error) {
      console.log(`❌ Erro ao buscar sender: ${(error as Error).message}`);
    }

    try {
      console.log(`👤 Buscando receiver: ${receiverUserId}`);
      receiver = await findUserUsecase.execute(receiverUserId);
      console.log(`✅ Receiver encontrado: ${receiver ? 'SIM' : 'NÃO'}`);
    } catch (error) {
      console.log(`❌ Erro ao buscar receiver: ${(error as Error).message}`);
    }

    valid = !!sender && !!receiver;

    if (!valid) {
      if (!sender) console.log(`❌ Sender ${senderUserId} não encontrado`);
      if (!receiver) console.log(`❌ Receiver ${receiverUserId} não encontrado`);
      return channel.nack(msg, false, false);
    }
    
    console.log(`✅ Validação final: ${valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    
    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify({ valid })),
      {
        correlationId: msg.properties.correlationId,
      }
    );

    console.log(`📤 Resposta enviada para: ${msg.properties.replyTo}`);
    console.log("─".repeat(50));

    channel.ack(msg);
  });
}

startConsumer();
