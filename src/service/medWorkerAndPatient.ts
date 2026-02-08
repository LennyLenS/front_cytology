import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./headers";
import { IApiGetMedWorker, IApiResponseGetShots } from "../types/api";
import { IMedWorkerRes } from "../types/medWorker";
import { ICardRes } from "../types/card";

// Используем прокси для всех запросов к API
// Swagger показывает base URL: http://localhost:8080/api/v1
const getBaseUrl = () => {
    // Всегда используем прокси на клиенте для обхода CORS
    // Прокси PROXY_TARGET = http://localhost:8080/api/v1
    if (typeof window !== "undefined") {
        return "/api/proxy";
    }
    // На сервере используем прямой URL с /api/v1
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    return baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
};

export const medWorkerAndPatientApi = createApi({
    reducerPath: "medWorkerAndPatientApi",
    tagTypes: ["MedWorker", "Patient"],
    baseQuery: fetchBaseQuery({
        baseUrl: getBaseUrl(),
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getMedWorker: builder.query<IApiGetMedWorker, string>({
            query: (id) => `/med/doctor/${id}`,
            providesTags: ["MedWorker"],
        }),
        getMedWorkerPatients: builder.query<any[], { doctorId: string; status?: boolean }>({
            query: ({ doctorId, status }) => {
                const url = `/med/doctor/${doctorId}/patients`;
                // Добавляем query параметр status если указан
                return status !== undefined ? `${url}?status=${status}` : url;
            },
            providesTags: ["Patient"],
        }),
        editMedWorker: builder.mutation<void, { id: string; payload: Partial<IMedWorkerRes> }>({
            query: ({ id, payload }) => ({
                url: `/med/doctor/${id}`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ["MedWorker"],
        }),
        addPatient: builder.mutation<{ id: string }, { payload: { fullname: string; email: string; policy: string; active: boolean; malignancy: boolean; birth_date: string } }>({
            query: (body) => ({
                url: `/med/patient`,
                method: "POST",
                body: body.payload,
            }),
            invalidatesTags: ["Patient"],
            transformResponse: (response: any): { id: string } => {
                // API возвращает { id: uuid }
                return { id: response.id || "" };
            },
        }),
        addCard: builder.mutation<void, { doctorId: string; patientId: string; diagnosis: string }>({
            query: ({ doctorId, patientId, diagnosis }) => ({
                url: `/med/card`,
                method: "POST",
                body: {
                    patient_id: patientId,
                    doctor_id: doctorId,
                    diagnosis: diagnosis,
                },
            }),
            invalidatesTags: ["Patient"],
        }),
        editPatient: builder.mutation<void, { id: string; payload: { active?: boolean; malignancy?: boolean } }>({
            query: ({ id, payload }) => ({
                url: `/med/patient/${id}`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ["Patient"],
        }),
        editCard: builder.mutation<void, { doctorId: string; patientId: string; diagnosis: string }>({
            query: ({ doctorId, patientId, diagnosis }) => ({
                url: `/med/card/${doctorId}/${patientId}`,
                method: "PATCH",
                body: { diagnosis },
            }),
            invalidatesTags: ["Patient"],
        }),
        deletePatient: builder.mutation<void, { doctorId: string; patientId: string }>({
            query: ({ doctorId, patientId }) => ({
                url: `/med/card/${doctorId}/${patientId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Patient"],
        }),
        getCard: builder.query<ICardRes, { doctorId: string; patientId: string }>({
            query: ({ doctorId, patientId }) => `/med/card/${doctorId}/${patientId}`,
            providesTags: ["Patient"],
        }),
        getPatient: builder.query<any, string>({
            query: (id) => `/med/patient/${id}`,
            providesTags: ["Patient"],
        }),
        getShots: builder.query<IApiResponseGetShots, { doctorId: string; patientId: string }>({
            query: ({ doctorId, patientId }) => `/cytologies/patient-card/${doctorId}/${patientId}`,
            providesTags: ["Patient"],
            transformResponse: (response: any): IApiResponseGetShots => {
                // Новый API возвращает массив цитологических исследований
                // Преобразуем в формат, ожидаемый фронтендом
                const cytologyImages = Array.isArray(response) ? response : response.cytology_images || [];
                return {
                    count: cytologyImages.length,
                    next: null,
                    previous: null,
                    results: {
                        patient: {} as any, // Пациент не возвращается в этом endpoint
                        shots: cytologyImages.map((img: any) => ({
                            id: img.id, // UUID (string) в новом API
                            patient_card: {} as any,
                            is_last: img.is_last || false,
                            diagnos_date: img.diagnos_date || "",
                            details: img.details || { probs: [], cell_characteristics: {} as any, cluster_characteristics: {} as any, ai_info: [] },
                            diagnostic_marking: img.diagnostic_marking || "",
                            diagnostic_number: img.diagnostic_number || 0,
                            material_type: img.material_type || "",
                            calcitonin: img.calcitonin || 0,
                            calcitonin_in_flush: img.calcitonin_in_flush || 0,
                            thyroglobulin: img.thyroglobulin || 0,
                            prev: img.prev || null, // UUID (string) в новом API
                            parent_prev: img.parent_prev || "", // UUID (string) в новом API
                            original_image: img.original_image || "", // UUID (string) в новом API
                        })),
                    },
                };
            },
        }),
    }),
});

export const {
    useGetMedWorkerQuery,
    useGetMedWorkerPatientsQuery,
    useGetCardQuery,
    useGetPatientQuery,
    useEditMedWorkerMutation,
    useAddPatientMutation,
    useAddCardMutation,
    useEditPatientMutation,
    useEditCardMutation,
    useDeletePatientMutation,
    useGetShotsQuery,
} = medWorkerAndPatientApi;
