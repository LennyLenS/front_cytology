import { IPatientRes } from "./patient"

// Схема для GET /med/card/{doctor_id}/{patient_id} согласно Swagger
export interface ICardRes {
  patient_id: string; // UUID пациента
  doctor_id: string; // UUID врача
  diagnosis: string; // Диагноз
};

// Схема для POST /med/card согласно Swagger
export interface ICardReq {
  patient_id: string; // UUID пациента
  doctor_id: string; // UUID врача
  diagnosis: string; // Диагноз
};
