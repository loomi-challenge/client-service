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

export class CognitoAuthProvider implements IAuthProvider {
  private readonly clientId = process.env.COGNITO_CLIENT_ID;
  private readonly clientSecret = process.env.COGNITO_CLIENT_SECRET;

  private calculateSecretHash(username: string): string {
    if (!this.clientSecret) {
      throw new Error("COGNITO_CLIENT_SECRET environment variable is required");
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
    const data: InitiateAuthCommandOutput = await cognitoClient.send(
      new InitiateAuthCommand(params)
    );
    return {
      accessToken: data.AuthenticationResult?.AccessToken || "",
      idToken: data.AuthenticationResult?.IdToken || "",
    };
  }

  async signUp(email: string, password: string): Promise<any> {
    const params: SignUpRequest = {
      ClientId: this.clientId,
      Password: password,
      Username: email,
      SecretHash: this.calculateSecretHash(email),
    };
    const data = await cognitoClient.send(new SignUpCommand(params));
    return data;
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
    const data: ConfirmSignUpCommandOutput = await cognitoClient.send(
      new ConfirmSignUpCommand(params)
    );
    return {
      session: data.Session || "",
    };
  }

  async resendConfirmationCode(email: string): Promise<{
    data: any;
  }> {
    const params: ResendConfirmationCodeCommandInput = {
      ClientId: this.clientId,
      Username: email,
      SecretHash: this.calculateSecretHash(email),
    };
    const data: ResendConfirmationCodeCommandOutput = await cognitoClient.send(
      new ResendConfirmationCodeCommand(params)
    );
    return {
      data: data.CodeDeliveryDetails,
    };
  }


}
