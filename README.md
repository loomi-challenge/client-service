# Serviço de Clientes (Client Service)

Este serviço é responsável pelo gerenciamento das informações dos clientes, incluindo seus dados pessoais e bancários, além de oferecer a camada de autenticação via Amazon Cognito. Faz parte de uma arquitetura de microsserviços para um sistema bancário.

---

## Funcionalidades principais

### 1. Gerenciamento de usuários

- Criação, consulta e atualização parcial dos dados dos clientes:
  - Nome, email, endereço e foto de perfil.
  - Dados bancários (agência, conta e saldo/balance).
- Acesso aos dados do cliente via endpoints RESTful.

### 2. Dados bancários

- Modelo separado para os detalhes bancários (`BankingDetails`), incluindo:
  - Agência
  - Conta corrente
  - Saldo inicial padrão (balance), atualizado automaticamente via eventos de transação.
- Comunicação assíncrona com o serviço de transações para atualizar o saldo dos usuários em tempo real.

### 3. Autenticação e autorização

- Integração com Amazon Cognito para autenticação segura.
- Abstração da lógica de autenticação via interface `IAuthProvider`.
- Implementação dos principais fluxos de autenticação:
  - Cadastro de usuário (signup)
  - Login (signin)
  - Verificação de email (confirmar usuário)
  - Reenvio de código de verificação
- Rotas públicas para os endpoints de autenticação.
- Casos de uso e controladores organizados segundo a Clean Architecture.

### 4. Comunicação via mensageria

- Possui múltiplos consumers RabbitMQ para gerenciar eventos de transações:
  - **startConsumer**: escuta eventos de nova transação para validar se os usuários envolvidos existem.
  - **startBalanceCheckConsumer**: verifica se o usuário remetente possui saldo suficiente para realizar a transferência.
  - **startTransactionConsumer**: atualiza os saldos bancários dos usuários após a confirmação da transação, garantindo a consistência dos dados entre os microsserviços.


## Tecnologias e ferramentas

- Node.js com Express para API RESTful
- PostgreSQL para armazenamento relacional dos dados dos usuários e banking details
- Redis (opcional, para cache de dados que não mudam com frequência)
- RabbitMQ para comunicação assíncrona entre microsserviços
- Amazon Cognito para autenticação e gerenciamento de usuários
- TypeScript para tipagem e melhor organização do código
- Arquitetura limpa (Clean Architecture) para separar domínio, aplicação e infraestrutura

