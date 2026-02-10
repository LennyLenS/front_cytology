import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { authHeaders } from "@/utils/authHeaders";

import { IPoint } from "@cytology/CytologyView/CytologyViewer/Viewer/interfaces/queries";
import { ICytolgyInfoPatch, ICytology, ICytologyHistory } from "@cytology/core/types/cytology";
import {
    IGroupedSegments,
    ISegmentCreate,
    ISegmentResponse,
    ISegmentStack,
} from "@cytology/core/types/segments";

// Формируем baseURL правильно (убираем лишние слэши)
// Используем прокси через Next.js API routes для обхода CORS
const getBaseUrl = () => {
    // Если используем прокси, запросы идут через /api/cytology
    // Иначе используем прямой URL к API
    const useProxy = process.env.NEXT_PUBLIC_USE_API_PROXY !== "false";

    if (useProxy && typeof window !== "undefined") {
        // Используем относительный путь через Next.js API proxy
        return "/api/cytology/";
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://109.73.201.164:8000/api/v3";
    // Убираем trailing slash если есть
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    return `${cleanBaseUrl}/cytology/`;
};

// Обертка для baseQuery с логированием
const baseQueryWithLogging = fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: authHeaders,
});

const baseQuery = async (args: any, api: any, extraOptions: any) => {
    // Логирование запроса перед отправкой
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const url = typeof args === 'string' ? args : args.url || 'unknown';
        const fullUrl = `${getBaseUrl()}${url}`;
        console.log("🔵 API Request:", {
            endpoint: url,
            fullUrl,
            method: args?.method || "GET",
            baseUrl: getBaseUrl(),
        });
    }

    const result = await baseQueryWithLogging(args, api, extraOptions);

    // Логирование результата
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const url = typeof args === 'string' ? args : args.url || 'unknown';
        const fullUrl = `${getBaseUrl()}${url}`;
        if (result.error) {
            console.error("🔴 API Error:", {
                endpoint: url,
                fullUrl,
                error: result.error,
                status: 'status' in result.error ? result.error.status : 'unknown',
                data: 'data' in result.error ? result.error.data : 'no data',
            });
        } else {
            console.log("🟢 API Success:", {
                endpoint: url,
                fullUrl,
                hasData: !!result.data,
            });
        }
    }

    return result;
};

export const cytologyApi = createApi({
    reducerPath: "cytologyApi",
    baseQuery,
    tagTypes: ["Segments", "Cytology"],
    endpoints: (builder) => ({
        getCytologyInfo: builder.query<ICytology, string>({
            query: (id) => {
                const url = `${id}`;
                if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
                    console.log("getCytologyInfo query:", { id, url, fullUrl: `${getBaseUrl()}${url}` });
                }
                return url;
            },
            providesTags: ["Cytology"],
        }),
        getCytologySegment: builder.query<IGroupedSegments[], string>({
            query: (id) => {
                const url = `${id}/segments`;
                if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
                    console.log("getCytologySegment query:", { id, url, fullUrl: `${getBaseUrl()}${url}` });
                }
                return url;
            },
            providesTags: ["Segments"],
            transformResponse: (response: ISegmentResponse) =>
                response.results.reduce((acc: IGroupedSegments[], segment) => {
                    const existingGroup = acc.find((group) => group.seg_type === segment.seg_type);
                    const { data, seg_type, is_ai } = segment;
                    const segmentsToStack: ISegmentStack[] = data.map((segmentData) => ({
                        id: segmentData.id,
                        seg_type,
                        is_ai,
                        points: segmentData.points,
                        details: segmentData.details,
                    }));

                    if (existingGroup) {
                        existingGroup.segments.push(...segmentsToStack);
                    } else {
                        acc.push({
                            seg_type: seg_type,
                            segments: segmentsToStack,
                        });
                    }

                    return acc;
                }, []),
        }),
        addSegment: builder.mutation<void, { cytologyId: string; segment: ISegmentCreate }>({
            query: ({ cytologyId, segment }) => ({
                url: `/segment/group/create/${cytologyId}`,
                method: "POST",
                body: segment,
            }),
            invalidatesTags: ["Segments"],
        }),
        patchSegment: builder.mutation<void, { segmentId: string | number; points: IPoint[] }>({
            query: ({ segmentId, points }) => ({
                url: `/segment/update/${segmentId}`,
                method: "PATCH",
                body: { points },
            }),
            invalidatesTags: ["Segments"],
        }),
        deleteSegment: builder.mutation<void, number>({
            query: (segmentId) => ({
                url: `/segment/update/${segmentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Segments"],
        }),
        addNewRevise: builder.mutation<{ id: string }, string>({
            query: (pk) => ({
                url: `/copy`,
                method: "POST",
                body: { pk },
            }),
            invalidatesTags: ["Cytology"],
        }),
        patchCytologyInfo: builder.mutation<void, { id: string; body: ICytolgyInfoPatch }>({
            query: (data) => ({
                url: `/${data.id}/update`,
                method: "PATCH",
                body: { ...data.body },
            }),
            invalidatesTags: ["Cytology"],
        }),
        getCytologyHistory: builder.query<ICytologyHistory, string>({
            query: (id) => {
                if (!id || id === "") {
                    throw new Error("Cytology ID is required for history query");
                }
                const url = `/history/${id}`;
                if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
                    console.log("getCytologyHistory query:", { id, url, fullUrl: `${getBaseUrl()}${url}` });
                }
                return url;
            },
            providesTags: ["Cytology"],
        }),
    }),
});

export const {
    useGetCytologyInfoQuery,
    useGetCytologySegmentQuery,
    useLazyGetCytologySegmentQuery,
    useAddSegmentMutation,
    usePatchSegmentMutation,
    useDeleteSegmentMutation,
    useAddNewReviseMutation,
    usePatchCytologyInfoMutation,
    useGetCytologyHistoryQuery,
} = cytologyApi;
