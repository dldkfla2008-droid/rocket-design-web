export type PartCategory =
  | "Nose"
  | "Body"
  | "Fins"
  | "Electronics"
  | "Payload"
  | "Recovery"
  | "Other";

export type Part = {
  id: string;
  name: string;
  category: PartCategory;
  mass_g: number;
  x_cm: number; // nose 기준 위치
  material?: string;
  note?: string;
};

export type Revision = {
  id: string;
  name: string;
  createdAt: string;
  parts: Part[];
};
