import { IPatientRes } from "./patient"

export interface ICardRes {
  id: string; // UUID в новом API
  patient: IPatientRes;
  acceptance_datetime: string;
  diagnosis: string;
  has_nodules?: any;
};

export interface ICardReq {
  id?: string; // UUID в новом API
  patient?: IPatientRes;
  acceptance_datetime?: string;
  has_nodules?: string;
  diagnosis: string;
};
