export interface IPatientInfo {
    id: string; // UUID в новом API
    first_name: string;
    last_name: string;
    fathers_name: string;
    birth_date: string;
    personal_policy: string;
    email: string;
    is_active: boolean;
}
