import { IUser } from "./interfaces/user.interface";
import { BankingDetails } from "./types/banking-details.type";

export class User implements IUser {
  private _id: string;
  private _name: string;
  private _email: string;
  private _address?: string;
  private _profilePicture?: string;
  private _bankingDetails?: BankingDetails;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor({
    id,
    name,
    email,
    address,
    profilePicture,
    bankingDetails,
  }: IUser) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._address = address;
    this._profilePicture = profilePicture;
    this._bankingDetails = bankingDetails;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }
  get email() {
    return this._email;
  }
  get address() {
    return this._address;
  }
  get profilePicture() {
    return this._profilePicture;
  }
  get bankingDetails() {
    return this._bankingDetails;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
