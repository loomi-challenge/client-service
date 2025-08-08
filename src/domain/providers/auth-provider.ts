export interface IAuthProvider {
  signIn(
    email: string,
    password: string
  ): Promise<{ accessToken: string; idToken: string }>;
  signUp(email: string, password: string): Promise<any>;
  confirmSignUp(
    username: string,
    code: string
  ): Promise<{
    session: string;
  }>;
  resendConfirmationCode(email: string): Promise<{
    data: any;
  }>;
}
