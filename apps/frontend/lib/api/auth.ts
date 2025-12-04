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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${apiBase}/api/users/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.errors?.[0]?.message ||
      errorData.message ||
      errorData.error ||
      "Failed to send reset email";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    message: data.message || "Email de resetare trimis cu succes.",
  };
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<{ message: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${apiBase}/api/users/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: payload.token,
      password: payload.password,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.errors?.[0]?.message ||
      errorData.message ||
      errorData.error ||
      "Failed to reset password";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    message: data.message || "Parola a fost resetată cu succes.",
  };
}

export interface ChangePasswordPayload {
  userId: string | number;
  email: string;
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  let accessToken = null;
  // First verify current password by attempting login
  try {
    const verifyResponse = await fetch(`${apiBase}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.currentPassword,
      }),
      cache: "no-store",
    });

    // If login fails, current password is incorrect
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      const errorMessage =
        errorData.errors?.[0]?.message ||
        errorData.message ||
        "Parola curentă este incorectă.";
      throw new Error(errorMessage);
    }
    const data = await verifyResponse.json();
    accessToken = data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Eroare la verificarea parolei curente.");
  }

  // Update password using user ID - requires authentication via cookies/headers
  const response = await fetch(`${apiBase}/api/users/${payload.userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify({
      password: payload.newPassword,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.errors?.[0]?.message ||
      errorData.message ||
      errorData.error ||
      "Failed to change password";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    message: data.message || "Parola a fost schimbată cu succes.",
  };
}
