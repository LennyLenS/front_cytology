import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./headers";

// Формируем baseURL правильно (убираем лишние слэши)
// ВСЕГДА используем прокси через Next.js API routes для обхода CORS
const getBaseUrl = () => {
    // Всегда используем прокси - это обходит CORS проблемы
    // Прокси находится в /api/cytology/[...path]/route.ts
    return "/api/cytology/";
};

// Кастомный baseQuery, который динамически вычисляет baseUrl при каждом запросе
const baseQuery = async (args: any, api: any, extraOptions: any) => {
    // Вычисляем baseUrl динамически при каждом запросе
    const baseUrl = getBaseUrl();

    // Логирование для отладки
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const url = typeof args === 'string' ? args : args.url || 'unknown';
        console.log("🔵 Cytology API Request:", {
            endpoint: url,
            baseUrl,
            fullUrl: `${baseUrl}${url}`,
            method: args?.method || "GET",
            isFormData: args?.body instanceof FormData,
        });
    }

    // Создаем fetchBaseQuery с динамическим baseUrl
    const dynamicBaseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers, { getState }) => {
            // Сначала вызываем стандартный prepareHeaders для токена
            const headersWithAuth = prepareHeaders(headers, { getState });
            return headersWithAuth;
        },
    });

    // Вызываем baseQuery
    return dynamicBaseQuery(args, api, extraOptions);
};

export const cytologyApi = createApi({
    reducerPath: "cytologyApi",
    tagTypes: ["Cytology"],
    baseQuery,
    endpoints: (builder) => ({
        getCytology: builder.query<any, string>({
            query: (id) => `/${id}`,
            providesTags: ["Cytology"],
        }),
        editCytology: builder.mutation<void, { id: string; payload: Partial<any> }>({
            query: ({ id, payload }) => ({ url: `/${id}/update`, method: "PATCH", payload }),
            invalidatesTags: ["Cytology"],
        }),
        getHistory: builder.query<any, string>({
            query: (id) => `/history/${id}`,
            providesTags: ["Cytology"],
        }),
        createCytology: builder.mutation<{ id: string }, { payload: FormData | Partial<any> }>({
            query: (body) => ({
                url: "/create",
                method: "POST",
                body: body.payload,
            }),
            invalidatesTags: ["Cytology"],
            transformResponse: (response: any): { id: string } => {
                // Новый API возвращает { id: uuid } вместо { image_id: number }
                return { id: response.id || response.image_id?.toString() || "" };
            },
        }),
    }),
});

export const {
    useCreateCytologyMutation,
    useGetHistoryQuery,
    useGetCytologyQuery,
    useEditCytologyMutation,
} = cytologyApi;
