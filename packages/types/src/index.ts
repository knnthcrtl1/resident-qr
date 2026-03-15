export type Gate = "gate1" | "gate2";
export type Direction = "IN" | "OUT";
export type PassType = "resident" | "visitor" | "delivery";
export type PassKind = "visitor" | "delivery";
export type UserRole = "resident" | "guard" | "admin";

export type ScanResult =
  | "VALID"
  | "INVALID"
  | "EXPIRED"
  | "REVOKED"
  | "USED"
  | "DENIED_RULE";

export type ValidateScanResponse = {
  success?: boolean;
  ok: boolean;
  result: ScanResult;
  message?: string;
  display?: {
    type: PassType;
    householdId?: number;
    visitorName?: string | null;
    plateNo?: string | null;
    deliveryType?: string | null;
    directionAllowed: Direction[];
  };
};

export type User = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  householdId?: number | null;
};

export type LoginResponse = {
  success?: boolean;
  ok: boolean;
  user?: User;
  token?: string;
  message?: string;
};

export type IssueResidentTokenResponse = {
  success?: boolean;
  ok: boolean;
  qrToken: string;
  expiresIn: number;
  message?: string;
};

export type CreatePassPayload = {
  pass_type: PassKind;
  household_id: number;
  issued_by_user_id: number;
  visitor_name?: string;
  has_vehicle?: boolean;
  plate_no?: string;
  delivery_type?: string;
  valid_from: string;
  valid_until: string;
  idempotencyKey?: string;
};

export type PassRecord = {
  id: number;
  pass_type: PassKind;
  household_id: number;
  issued_by_user_id: number;
  visitor_name?: string | null;
  has_vehicle: boolean;
  plate_no?: string | null;
  delivery_type?: string | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  usage_count: number;
  status: string;
  token_jti?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreatePassResponse = {
  success?: boolean;
  ok: boolean;
  message?: string;
  pass?: PassRecord;
  qrToken?: string;
  guestUrl?: string;
};

export type ValidateScanPayload = {
  token: string;
  guard_user_id: number;
  gate: Gate;
  direction: Direction;
  note?: string;
};
