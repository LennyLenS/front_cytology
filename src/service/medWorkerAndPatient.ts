import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./headers";
import { IApiGetMedWorker, IApiResponseGetShots } from "../types/api";
import { IMedWorkerRes } from "../types/medWorker";

// Используем прокси для всех запросов к API
const getBaseUrl = () => {
    // Всегда используем прокси на клиенте для обхода CORS
    if (typeof window !== "undefined") {
        return "/api/proxy/api/v1";
    }
    // На сервере используем прямой URL (если нужно)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    return `${baseUrl}/api/v1`;
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
        getMedWorkerPatients: builder.query<any[], string>({
            query: (id) => `/med/doctor/${id}/patients`,
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
        addPatient: builder.mutation<void, { id: string; payload: Partial<any> }>({
            query: (body) => ({
                url: `/med/patient`,
                method: "POST",
                body: body.payload,
            }),
            invalidatesTags: ["Patient"],
        }),
        editPatient: builder.mutation<void, { id: string; payload: Partial<any> }>({
            query: ({ id, payload }) => ({
                url: `/med/patient/${id}`,
                method: "PATCH",
                body: payload,
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
        getCard: builder.query<any, { doctorId: string; patientId: string }>({
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
                            id: typeof img.id === 'string' ? parseInt(img.id) : img.id,
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
                            prev: img.prev || null,
                            parent_prev: img.parent_prev || 0,
                            original_image: img.original_image || 0,
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
    useEditPatientMutation,
    useDeletePatientMutation,
    useGetShotsQuery,
} = medWorkerAndPatientApi;
