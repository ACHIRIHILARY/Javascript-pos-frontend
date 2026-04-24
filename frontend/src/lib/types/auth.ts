export type Role = 'OWNER' | 'ADMIN' | 'CASHIER'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: Role
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: SessionUser
}
