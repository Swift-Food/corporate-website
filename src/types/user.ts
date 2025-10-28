// User Roles
export enum UserRole {
  CONSUMER = 'CONSUMER',
  RESTAURANT_USER = 'RESTAURANT_USER',
  CORPORATE_EMPLOYEE =  'corporate_employee',
  ADMIN = 'admin',
}

// Corporate User Roles
export enum CorporateUserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

// Corporate User Status
export enum CorporateUserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

// Base User interface
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  verified: boolean;
  isGoogleUser?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Corporate User interface
export interface CorporateUser {
  id: string;
  userId: string;
  organizationId: string;
  corporateRole: CorporateUserRole;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
  dailyBudgetLimit: number;
  monthlyBudgetLimit: number;
  dailyBudgetSpent: number;
  monthlyBudgetSpent: number;
  dailyBudgetRemaining: number;
  monthlyBudgetRemaining: number;
  dietaryRestrictions?: string[];
  defaultDeliveryAddressId?: string;
  status: CorporateUserStatus;
  canOrder: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  jobTitleId: string;
  jobTitleName?: string;
  // Relations
  user?: User;
  email?: string;
  phoneNumber?: string;
}

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;

}

export interface LoginResponse {
  access_token: string;
}

export interface LoginErrorResponse {
  needsVerification?: boolean;
  message: string;
  email?: string;
}

export interface RegisterCorporateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
}

export interface RegisterCorporateResponse {
  message: string;
  userId?: string;
  requiresVerification: boolean;
  status?: CorporateUserStatus;
}

export interface CheckDomainDto {
  email: string;
}

export interface CheckDomainResponse {
  eligible: boolean;
  organizationName?: string;
  requiresVerification?: boolean;
  autoApprove?: boolean;
  message: string;
}

export interface VerifyCorporateEmailDto {
  email: string;
  code: string;
}

export interface VerifyCorporateEmailResponse {
  message: string;
  status: CorporateUserStatus;
}

// JWT Payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  verified: boolean;
  iat?: number;
  exp?: number;
}

// Auth Context State
export interface AuthState {
  user: User | null;
  corporateUser: CorporateUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}