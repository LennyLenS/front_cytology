import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./headers";
import { IApiGetMedWorker, IApiResponseGetShots } from "../types/api";
import { IMedWorkerRes } from "../types/medWorker";

// Используем прокси для всех запросов к API
const getBaseUrl = () => {
    // Всегда используем прокси на клиенте для обхода CORS
    if (typeof window !== "undefined") {
        return "/api/proxy";
    }
    // На сервере используем прямой URL (если нужно)
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
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
            query: (id) => `/med_worker/patients/${id}`,
            providesTags: ["MedWorker", "Patient"],
        }),
        editMedWorker: builder.mutation<void, { id: string; payload: Partial<IMedWorkerRes> }>({
            query: ({ id, payload }) => ({
                url: `/med_worker/update/${id}`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ["MedWorker"],
        }),
        addPatient: builder.mutation<void, { id: string; payload: Partial<any> }>({
            query: (body) => ({
                url: `/patient/create/${body.id}`,
                method: "POST",
                body: body.payload,
            }),
            invalidatesTags: ["Patient"],
        }),
        editPatient: builder.mutation<void, { id: string; payload: Partial<any> }>({
            query: ({ id, payload }) => ({
                url: `/patient/update/${id}/`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ["Patient"],
        }),
        deletePatient: builder.mutation<void, string>({
            query: (id) => ({ url: `/card/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Patient"],
        }),
        getShots: builder.query<IApiResponseGetShots, string>({
            query: (id) => `/patient/shots/${id}`,
            providesTags: ["Patient"],
        }),
    }),
});

export const {
    useGetMedWorkerQuery,
    useEditMedWorkerMutation,
    useAddPatientMutation,
    useEditPatientMutation,
    useDeletePatientMutation,
    useGetShotsQuery,
} = medWorkerAndPatientApi;
