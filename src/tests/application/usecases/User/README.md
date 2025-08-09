# Testes dos Use Cases de Usuário

Este diretório contém testes automatizados completos para todos os use cases relacionados ao usuário.

## 📁 Estrutura

```
src/tests/application/usecases/User/
├── mocks/                                    # Mocks reutilizáveis
│   ├── user.gateway.mock.ts                 # Mock do IUserGateway
│   ├── user-cache.gateway.mock.ts           # Mock do IUserCacheRepository
│   └── storage-provider.mock.ts             # Mock do IStorageProvider
├── check-user-balance.usecase.test.ts       # Testes de verificação de saldo
├── find-user.usecase.test.ts                # Testes de busca de usuário
├── list-users.usecase.test.ts               # Testes de listagem de usuários
├── update-user.usecase.test.ts              # Testes de atualização de usuário
├── update-user-balance.usecase.test.ts      # Testes de atualização de saldo
├── update-user-profile-picture.usecase.test.ts # Testes de foto de perfil
└── README.md                                # Este arquivo
```

## 🧪 Use Cases Testados

### 1. ListUsersUsecase
- ✅ Listagem bem-sucedida de usuários
- ✅ Tratamento de lista vazia
- ✅ Tratamento de erros do gateway
- ✅ Respeito ao parâmetro de limite

### 2. FindUserUsecase
- ✅ Retorno de usuário do cache
- ✅ Busca no banco quando não está no cache
- ✅ Tratamento de usuário não encontrado
- ✅ Tratamento de erros do gateway e cache

### 3. CheckUserBalanceUsecase
- ✅ Verificação de saldo suficiente
- ✅ Verificação de saldo insuficiente
- ✅ Tratamento de usuário não encontrado
- ✅ Tratamento de usuários sem dados bancários
- ✅ Tratamento de erros do gateway

### 4. UpdateUserUsecase
- ✅ Atualização bem-sucedida de usuário
- ✅ Validação de todos os campos (nome, email, endereço, etc.)
- ✅ Validação de dados bancários
- ✅ Prevenção de atualização de saldo
- ✅ Tratamento de usuário não encontrado

### 5. UpdateUserBalanceUsecase
- ✅ Atualização de saldo (entrada e saída)
- ✅ Tratamento de valores zero e grandes
- ✅ Tratamento de erros do gateway
- ✅ Invalidação correta do cache

### 6. UpdateUserProfilePictureUsecase
- ✅ Upload de foto usando buffer
- ✅ Upload de foto usando caminho de arquivo
- ✅ Validação de arquivo obrigatório
- ✅ Tratamento de diferentes extensões
- ✅ Limpeza de arquivos temporários
- ✅ Tratamento de erros de storage e banco

## 🚀 Como Executar

### Executar todos os testes
```bash
npm run test
# ou
yarn test
```

### Executar testes em modo watch
```bash
npm run test:watch
# ou
yarn test:watch
```

### Executar testes com coverage
```bash
npm run test:coverage
# ou
yarn test:coverage
```

### Executar testes específicos
```bash
# Apenas testes de usuário
npm test src/tests/application/usecases/User

# Apenas um use case específico
npm test src/tests/application/usecases/User/list-users.usecase.test.ts
```

## 📊 Cobertura de Testes

Os testes cobrem:
- ✅ Casos de sucesso
- ✅ Casos de erro
- ✅ Validações de entrada
- ✅ Tratamento de exceções
- ✅ Interações com dependências
- ✅ Edge cases

## 🔧 Configuração

### Jest
A configuração do Jest está em `jest.config.js` na raiz do projeto:
- Preset TypeScript
- Mapeamento de paths (`@/` → `src/`)
- Ambiente Node.js
- Coverage configurado

### Mocks
Todos os mocks são criados com `jest.Mocked<T>` para garantir type safety:
- `IUserGateway` - Para operações de banco de dados
- `IUserCacheRepository` - Para operações de cache
- `IStorageProvider` - Para upload de arquivos

## 💡 Padrões de Teste

### Estrutura AAA (Arrange, Act, Assert)
```typescript
it("should do something", async () => {
  // Arrange - Preparar dados e mocks
  const input = { id: "test" };
  mockGateway.method.mockResolvedValue(result);

  // Act - Executar o método testado
  const result = await usecase.execute(input);

  // Assert - Verificar resultados
  expect(mockGateway.method).toHaveBeenCalledWith(input);
  expect(result).toEqual(expectedResult);
});
```

### Nomeação de Testes
- `should [ação] when [condição]`
- `should handle [cenário de erro]`
- `should validate [regra de negócio]`

## 🐛 Depuração

Para debugar testes específicos:
```bash
# Executar com verbose
npm test -- --verbose

# Executar apenas um teste
npm test -- --testNamePattern="should update user successfully"
``` 