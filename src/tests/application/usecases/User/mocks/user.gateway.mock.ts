import { IUserGateway } from "@/domain/gateways/user.gateway";
import { User } from "@/domain/entities/User";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";

export const createUserGatewayMock = (): jest.Mocked<IUserGateway> => ({
  create: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  updateUserPartial: jest.fn(),
  updateUserProfilePicture: jest.fn(),
  updateUserBankingBalance: jest.fn(),
  listAllUsers: jest.fn(),
});

export const mockUser: IUser = {
  id: "user-123",
  name: "João Silva",
  email: "joao@email.com",
  address: "Rua das Flores, 123",
  profilePicture: "https://example.com/profile.jpg",
  bankingDetails: {
    agency: "1234",
    accountNumber: "567890",
    balance: 1000,
  },
};

export const createMockUserEntity = (userData: Partial<IUser> = {}): User => {
  return new User({
    ...mockUser,
    ...userData,
  });
}; 