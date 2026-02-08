import { ICell } from "./cell";
import { ICardReq } from "./card";

export interface IShot {
  id: string; // UUID в новом API
  number: string;
  cytologyDate: string;
  materialType: string;
  bethesda: string;
  punkt: string;
};

export interface IAiInfo {
  is_ai: boolean;
  id: number;
  details: Record<string, any>;
};

export interface IShotDetails {
  probs: number[];
  cell_characteristics: ICell;
  cluster_characteristics: ICell;
  ai_info: IAiInfo[];
};

export interface IShotReq {
  id: string; // UUID в новом API
  patient_card: ICardReq;
  is_last: boolean;
  diagnos_date: string;
  details: {
    probs: number[];
    cell_characteristics: ICell;
    cluster_characteristics: ICell;
    ai_info: IAiInfo[];
  };
  diagnostic_marking: string;
  diagnostic_number: number;
  material_type: string;
  calcitonin: number;
  calcitonin_in_flush: number;
  thyroglobulin: number;
  prev: string | null; // UUID в новом API
  parent_prev: string; // UUID в новом API
  original_image: string; // UUID в новом API
};
