export interface Asset {
  id: number;
  AssetTag: string;
  Description: string;
  Location: string;
  SerialNumber: string;
  AssetCondition: string;
  Specification: string;
  GroupAssetCategory: string;
  PoNumber: string;
  Warranty: string | null;
  DateAcquired: string | null;
  CheckoutTo: string | null;
  AssetCategory: string;
  CostCenter: string;
  ScrumTeam: string;
  AgileReleaseTrain: string;
  // Add any other properties your assets have
}
