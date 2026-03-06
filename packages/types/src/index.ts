export type Gate = "gate1" | "gate2";
export type Direction = "IN" | "OUT";
export type PassType = "resident" | "visitor" | "delivery";

export type ScanResult =
  | "VALID"
  | "INVALID"
  | "EXPIRED"
  | "REVOKED"
  | "USED"
  | "DENIED_RULE";

export type ValidateScanResponse = {
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
