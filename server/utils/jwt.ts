import jwt, { SignOptions } from "jsonwebtoken";

/**
 * Generates a JSON Web Token (JWT).
 * @param payload - Data to be encoded into the token.
 * @param expiresIn - Token expiration duration (default: "7d").
 */
export interface TokenPayload {
  userId: string;
}

/**
 * Generates a JSON Web Access Token (JWT).
 * @param payload - Object containing payload data (e.g. userId).
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET?.trim() || "reqforge_jwt_default_secret_key_2026";

  const expiresIn = (process.env.JWT_EXPIRES_IN?.trim() || "7d") as SignOptions["expiresIn"];

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

/**
 * Verifies a JSON Web Token (JWT).
 * @param token - JWT string to verify.
 */
export const verifyToken = <T = any>(token: string): T => {
  const secret = process.env.JWT_SECRET?.trim() || "reqforge_jwt_default_secret_key_2026";

  return jwt.verify(token, secret) as T;
};

