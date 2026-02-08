export interface IPatientRes {
    id: string; // UUID в новом API
    fullname: string; // В новом API одно поле fullname вместо first_name, last_name, fathers_name
    email: string;
    policy: string; // В новом API policy вместо personal_policy
    active: boolean; // В новом API active вместо is_active
    malignancy: boolean;
    birth_date: string;
    last_uzi_date?: string;
    // Старые поля для обратной совместимости
    first_name?: string;
    last_name?: string;
    fathers_name?: string;
    personal_policy?: string;
    is_active?: boolean;
};

export interface IPatient {
    idCard: string; // UUID карты пациента
    id: string; // UUID пациента (в новом API все ID - UUID)
    fullName: string;
    birthDate: string;
    personalPolicy: string;
    email: string;
    diagnosis: string;
    isActive: boolean;
};

export interface IPatientReq {
    first_name: string;
    last_name: string;
    fathers_name: string;
    birth_date: string;
    personal_policy: string;
    email: string;
    is_active: boolean;
};
