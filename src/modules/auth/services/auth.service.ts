import type { AuthUser, LoginInput } from "@/modules/auth/types/auth.types";
import { AppError } from "@/shared/errors/app-error";

/**
 * Placeholder auth service — integrate with your identity provider.
 */
export const authService = {
  async login(_input: LoginInput): Promise<AuthUser> {
    throw new AppError(
      "NOT_IMPLEMENTED",
      "Authentication is not configured yet",
      501,
    );
  },
};
