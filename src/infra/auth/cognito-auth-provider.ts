import { IAuthProvider } from "@/application/interfaces/auth-provider";
import { cognitoClient } from "../aws/cognito-client";
import {
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  InitiateAuthCommand,
  InitiateAuthCommandOutput,
  InitiateAuthRequest,
  ResendConfirmationCodeCommand,
  ResendConfirmationCodeCommandInput,
  ResendConfirmationCodeCommandOutput,
  SignUpCommand,
  SignUpRequest,
} from "@aws-sdk/client-cognito-identity-provider";
import * as crypto from "crypto";
import { AppError } from "@/domain/errors/app-error";

export class CognitoAuthProvider implements IAuthProvider {
  private readonly clientId = process.env.COGNITO_CLIENT_ID;
  private readonly clientSecret = process.env.COGNITO_CLIENT_SECRET;

  private calculateSecretHash(username: string): string {
    if (!this.clientSecret) {
      throw new AppError("COGNITO_CLIENT_SECRET environment variable is required", 500);
    }

    const message = username + this.clientId;
    const hmac = crypto.createHmac("sha256", this.clientSecret);
    hmac.update(message);
    return hmac.digest("base64");
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ accessToken: string; idToken: string }> {
    const params: InitiateAuthRequest = {
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.calculateSecretHash(email),
      },
      ClientId: this.clientId,
    };
    
    try {
      const data: InitiateAuthCommandOutput = await cognitoClient.send(
        new InitiateAuthCommand(params)
      );

      return {
        accessToken: data.AuthenticationResult?.AccessToken || "",
        idToken: data.AuthenticationResult?.IdToken || "",
      };
    } catch (error: any) {
      if (error.__type === 'NotAuthorizedException' || error.name === 'NotAuthorizedException') {
        throw new AppError("Credenciais inválidas", 401);
      }
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<any> {
    const params: SignUpRequest = {
      ClientId: this.clientId,
      Password: password,
      Username: email,
      SecretHash: this.calculateSecretHash(email),
    };
    
    try {
      const data = await cognitoClient.send(new SignUpCommand(params));
      return data;
    } catch (error: any) {
      if (error.__type === 'UsernameExistsException' || error.name === 'UsernameExistsException') {
        throw new AppError("Este email já está cadastrado", 409);
      }
      if (error.__type === 'InvalidPasswordException' || error.name === 'InvalidPasswordException') {
        throw new AppError("A senha não atende aos critérios de segurança", 400);
      }
      if (error.__type === 'InvalidParameterException' || error.name === 'InvalidParameterException') {
        throw new AppError("Parâmetros inválidos fornecidos", 400);
      }
      throw error;
    }
  }

  async confirmSignUp(
    username: string,
    code: string
  ): Promise<{
    session: string;
  }> {
    const params = {
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: code,
      SecretHash: this.calculateSecretHash(username),
    };
    
    try {
      const data: ConfirmSignUpCommandOutput = await cognitoClient.send(
        new ConfirmSignUpCommand(params)
      );
      return {
        session: data.Session || "",
      };
    } catch (error: any) {
      if (error.__type === 'ExpiredCodeException' || error.name === 'ExpiredCodeException') {
        throw new AppError("Código de confirmação expirado. Solicite um novo código.", 400);
      }
      throw error;
    }
  }

  async resendConfirmationCode(email: string): Promise<{
    data: any;
  }> {
    const params: ResendConfirmationCodeCommandInput = {
      ClientId: this.clientId,
      Username: email,
      SecretHash: this.calculateSecretHash(email),
    };
    
    try {
      const data: ResendConfirmationCodeCommandOutput = await cognitoClient.send(
        new ResendConfirmationCodeCommand(params)
      );
      return {
        data: data.CodeDeliveryDetails,
      };
    } catch (error: any) {
      if (error.__type === 'UserNotFoundException' || error.name === 'UserNotFoundException') {
        throw new AppError("Usuário não encontrado", 404);
      }
      if (error.__type === 'LimitExceededException' || error.name === 'LimitExceededException') {
        throw new AppError("Limite de tentativas excedido. Tente novamente mais tarde.", 429);
      }
      if (error.__type === 'InvalidParameterException' || error.name === 'InvalidParameterException') {
        throw new AppError("Parâmetros inválidos fornecidos", 400);
      }
      throw error;
    }
  }


}
