import type { User } from "@/types/payload-types"

// Sign up payload
export interface SignUpPayload {
  email: string
  password: string
  displayName?: string
  agreeTermsAndConditions: boolean
  agreePrivacyPolicy: boolean
  roles: string[]
}

// Login payload
export interface LoginPayload {
  email: string
  password: string
}

// Auth response
export interface AuthResponse {
  user: User
  token: string
  message?: string
}

// Error response
export interface AuthError {
  message: string
  field?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

/**
 * Sign up a new user
 * TODO: Replace with real endpoint when backend is ready
 */
export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_URL}/auth/signup`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })
  // if (!response.ok) throw new Error('Sign up failed')
  // return response.json()

  // Mock response for now
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate validation error
  if (payload.email === "test@error.com") {
    throw new Error("Această adresă de email este deja înregistrată.")
  }

  const mockUser: User = {
    id: Math.floor(Math.random() * 10000),
    email: payload.email,
    displayName: payload.displayName || null,
    avatarURL: null,
    roles: payload.roles as ("organizer" | "host" | "provider" | "client" | "admin")[],
    status: "active",
    agreeTermsAndConditions: payload.agreeTermsAndConditions,
    agreePrivacyPolicy: payload.agreePrivacyPolicy,
    profile: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    resetPasswordToken: null,
    resetPasswordExpiration: null,
    salt: null,
    hash: null,
    loginAttempts: null,
    lockUntil: null,
    sessions: null,
    password: null,
  }

  return {
    user: mockUser,
    token: "mock-jwt-token-" + mockUser.id,
    message: "Cont creat cu succes.",
  }
}

/**
 * Log in an existing user
 * TODO: Replace with real endpoint when backend is ready
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })
  // if (!response.ok) throw new Error('Login failed')
  // return response.json()

  // Mock response for now
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate authentication error
  if (payload.password === "wrongpassword") {
    throw new Error("Autentificarea a eșuat. Verifică datele și încearcă din nou.")
  }

  const mockUser: User = {
    id: 1,
    email: payload.email,
    displayName: "Utilizator Demo",
    avatarURL: null,
    roles: ["client"],
    status: "active",
    agreeTermsAndConditions: true,
    agreePrivacyPolicy: true,
    profile: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    resetPasswordToken: null,
    resetPasswordExpiration: null,
    salt: null,
    hash: null,
    loginAttempts: null,
    lockUntil: null,
    sessions: null,
    password: null,
  }

  return {
    user: mockUser,
    token: "mock-jwt-token-" + mockUser.id,
    message: "Autentificat cu succes.",
  }
}

/**
 * Get the current authenticated user
 * TODO: Replace with real endpoint when backend is ready
 */
export async function getCurrentUser(): Promise<User | null> {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_URL}/auth/me`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${getToken()}`,
  //   },
  // })
  // if (!response.ok) return null
  // return response.json()

  // Mock response for now - simulating a logged-in user
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return null to simulate not logged in
  // Change this to return a mock user to test the logged-in state
  return null

  // Uncomment below to test logged-in state with different roles:
  /*
  const mockUser: User = {
    id: 1,
    email: "demo@unevent.ro",
    displayName: "Demo User",
    avatarURL: null,
    roles: ["organizer", "host", "provider", "client"], // Test with multiple roles
    status: "active",
    agreeTermsAndConditions: true,
    agreePrivacyPolicy: true,
    profile: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    resetPasswordToken: null,
    resetPasswordExpiration: null,
    salt: null,
    hash: null,
    loginAttempts: null,
    lockUntil: null,
    sessions: null,
    password: null,
  }
  return mockUser
  */
}
