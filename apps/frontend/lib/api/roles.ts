export interface ChangeRoleResponse {
  user: {
    id: number;
    email: string;
    roles: string[];
  };
  message: string;
}

export async function changeRole(
  role: string,
  action: "add" | "remove",
  accessToken: string,
): Promise<ChangeRoleResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${apiBase}/api/users/changeRole`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ role, action }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error || errorData.message || "Failed to change role";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}
