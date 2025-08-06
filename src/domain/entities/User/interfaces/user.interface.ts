import { BankingDetails } from "../types/banking-details.type";

export interface IUser {
  id: string;
  name: string;
  email: string;
  address?: string;
  profilePicture?: string;
  bankingDetails?: BankingDetails;
}
