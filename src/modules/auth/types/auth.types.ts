export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "operator" | "viewer";
};

export type LoginInput = {
  email: string;
  password: string;
};
