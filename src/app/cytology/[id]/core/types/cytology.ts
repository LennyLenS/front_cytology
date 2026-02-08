import { IPaginated } from "./basic";
import { IPatientInfo } from "./patient";

export type MaterialType = "GS" | "BP" | "TP" | "PTP" | "LNP";
export type DiagnosisMarking = "П11" | "Л23";

export interface ICytology {
    original_image: ICytologyImage;
    info: ICytologyInfo;
}

export interface ICytologyImage {
    id: string; // UUID в новом API
    create_date: string;
    delay_time: number;
    viewed_flag: boolean;
    image: string;
    file_path?: string; // Путь к файлу для DZI
}

export interface ICytologyInfo {
    patient: IPatientInfo;
    acceptance_datetime: string;
    diagnosis: string;
    patient_card_id: string; // UUID в новом API
    id: string; // UUID в новом API
    is_last: boolean;
    diagnos_date: string;
    details: ICytologyInfoDetails | null;
    diagnostic_marking: DiagnosisMarking;
    diagnostic_number: number;
    material_type: MaterialType;
    calcitonin: number;
    calcitonin_in_flush: number;
    thyroglobulin: number;
    prev: null | string; // UUID в новом API
    parent_prev: null | string; // UUID в новом API
    original_image: null | string; // UUID в новом API
}

export interface ICytologyInfoDetails {
    probs: number[];
    cell_characteristics: ICytologyInfoCellCharacteristics;
    cluster_characteristics: ICytologyInfoClusterCharacteristics;
}

export interface ICytologyInfoCellCharacteristics {
    cellularity: number;
    lymphocyte_num: number;
    th_norm_cell_num: number;
    mean_th_cell_area: number;
    th_groove_cell_num: number;
    th_gurtle_cell_num: number;
    mean_th_cell_diameter: number;
    mean_th_cell_circularity: number;
    mean_th_cell_aspect_ratio: number;
    th_multiple_nuclei_cell_num: number;
    th_pseudoinclusion_cell_num: number;
    mean_th_cell_nuclear_cytoplasmic_ratio: number;
}

export interface ICytologyInfoClusterCharacteristics {
    papillary_num: number;
    trabecula_num: number;
    mean_cluster_area: number;
    microfollicle_num: number;
    mean_th_cell_num_in_clusters: number;
    ordered_cells_shapeless_cluster_num: number;
    disordered_cells_shapeless_cluster_num: number;
}

export interface ICytolgyInfoPatch {
    patient_card: {
        patient: string; // UUID в новом API
        diagnosis: string;
    };
    diagnostic_number: number;
    details?: {
        material_type: MaterialType;
        calcitonin: number;
        calcitonin_in_flush: number;
        thyroglobulin: number;
    };
    material_type: MaterialType;
    calcitonin: number;
    calcitonin_in_flush: number;
    thyroglobulin: number;
}

export type ICytologyHistory = IPaginated<ICytologyHistoryItem>;

export interface ICytologyHistoryItem {
    calcitonin: number;
    calcitonin_in_flush: number;
    details: ICytologyInfoDetails | null;
    diagnos_date: string;
    diagnostic_marking: DiagnosisMarking;
    diagnostic_number: number;
    id: string; // UUID в новом API
    is_last: boolean;
    material_type: MaterialType;
    original_image: string; // UUID в новом API
    parent_prev: string | null; // UUID в новом API
    patient_card: string; // UUID в новом API
    prev: string | null; // UUID в новом API
    thyroglobulin: number;
}
