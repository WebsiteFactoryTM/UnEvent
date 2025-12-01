export interface SignUpPayload {
  email: string;
  password: string;
  displayName?: string;
  roles: string[];
  agreeTermsAndConditions: boolean;
  agreePrivacyPolicy: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: {
    id: string | number;
    email: string;
    displayName?: string;
    roles: string[];
  };
  token?: string;
  message?: string;
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  // Prepare payload - omit displayName if empty
  const requestPayload: Record<string, any> = {
    email: payload.email,
    password: payload.password,
    roles: payload.roles,
    agreeTermsAndConditions: payload.agreeTermsAndConditions,
    agreePrivacyPolicy: payload.agreePrivacyPolicy,
  };

  if (payload.displayName && payload.displayName.trim()) {
    requestPayload.displayName = payload.displayName.trim();
  }

  const response = await fetch(`${apiBase}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.errors?.[0]?.message ||
      errorData.message ||
      errorData.error ||
      "Failed to create account";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    user: data.user || data.doc,
    message: "Cont creat cu succes.",
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${apiBase}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.errors?.map((err: any) => err.message).join(", ") ||
      errorData.message ||
      errorData.error ||
      "Failed to login";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    user: data.user,
    token: data.token,
    message: "Autentificare reușită.",
  };
}
