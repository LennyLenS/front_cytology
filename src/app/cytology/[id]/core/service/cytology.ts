import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { authHeaders } from "@/utils/authHeaders";

import { IPoint } from "@cytology/CytologyView/CytologyViewer/Viewer/interfaces/queries";
import {
    ICytolgyInfoPatch,
    ICytology,
    ICytologyHistory,
    ICytologyImage,
    ICytologyInfo,
    DiagnosisMarking,
    MaterialType,
} from "@cytology/core/types/cytology";
import {
    IGroupedSegments,
    ISegmentCreate,
    ISegmentResponse,
    ISegmentStack,
    ISegmentDetails,
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
            transformResponse: (response: any): ICytology => {
                // Преобразуем ответ API в формат, ожидаемый фронтендом
                // API возвращает структуру с опциональными полями, которые могут быть обернуты в Opt* типы
                // При сериализации в JSON они преобразуются в обычные значения или null
                const apiResponse = response as {
                    original_image: {
                        id?: string; // UUID в новом API
                        create_date: string;
                        delay_time?: number;
                        viewed_flag: boolean;
                        image?: string;
                        file_path?: string;
                    };
                    info: {
                        patient: any;
                        patient_card: {
                            patient?: string; // UUID в новом API
                            med_worker?: string; // UUID в новом API
                            diagnosis?: string;
                        };
                        image_group: {
                            id?: string; // UUID в новом API
                            diagnostic_number: number;
                            diagnostic_marking?: string;
                            material_type?: string;
                            calcitonin?: number;
                            calcitonin_in_flush?: number;
                            thyroglobulin?: number;
                            is_last: boolean;
                            diagnos_date: string;
                            prev?: string; // UUID в новом API
                            parent_prev?: string; // UUID в новом API
                        };
                    };
                };

                // Преобразуем original_image
                const originalImage = apiResponse.original_image;
                const transformedOriginalImage: ICytologyImage = {
                    id: originalImage.id || "", // UUID (string) в новом API
                    create_date: originalImage.create_date || "",
                    delay_time: originalImage.delay_time || 0,
                    viewed_flag: originalImage.viewed_flag || false,
                    image: originalImage.image || "",
                    file_path: originalImage.file_path,
                };

                // Преобразуем info
                const imageGroup = apiResponse.info.image_group;
                const transformedInfo: ICytologyInfo = {
                    patient: apiResponse.info.patient,
                    acceptance_datetime: imageGroup.diagnos_date || "",
                    diagnosis: apiResponse.info.patient_card.diagnosis || "",
                    patient_card_id: apiResponse.info.patient_card.patient || "", // UUID (string) в новом API
                    id: imageGroup.id || "", // UUID (string) в новом API
                    is_last: imageGroup.is_last || false,
                    diagnos_date: imageGroup.diagnos_date || "",
                    details: null, // Details не передаются в ответе
                    diagnostic_marking: (imageGroup.diagnostic_marking as DiagnosisMarking) || "П11",
                    diagnostic_number: imageGroup.diagnostic_number || 0,
                    material_type: (imageGroup.material_type as MaterialType) || "GS",
                    calcitonin: imageGroup.calcitonin || 0,
                    calcitonin_in_flush: imageGroup.calcitonin_in_flush || 0,
                    thyroglobulin: imageGroup.thyroglobulin || 0,
                    prev: imageGroup.prev || null, // UUID (string) в новом API
                    parent_prev: imageGroup.parent_prev || null, // UUID (string) в новом API
                    original_image: transformedOriginalImage.id, // UUID (string) в новом API
                };

                return {
                    original_image: transformedOriginalImage,
                    info: transformedInfo,
                };
            },
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
                    const segmentsToStack: ISegmentStack[] = data.map((segmentData) => {
                        // Преобразуем points из формата {id, uid, x, y} в {x, y}
                        const points: IPoint[] = segmentData.points.map((p) => ({
                            x: p.x,
                            y: p.y,
                        }));

                        // Преобразуем details из строки JSON в объект, если есть
                        let details: ISegmentDetails | undefined;
                        if (segmentData.details) {
                            try {
                                // Если details - это строка JSON, парсим её
                                const parsed = typeof segmentData.details === 'string'
                                    ? JSON.parse(segmentData.details)
                                    : segmentData.details;
                                details = parsed as ISegmentDetails;
                            } catch (e) {
                                // Если не удалось распарсить, оставляем undefined
                                console.warn('Failed to parse segment details:', e);
                            }
                        }

                        return {
                            id: segmentData.id,
                            seg_type,
                            is_ai,
                            points,
                            details,
                        };
                    });

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
        patchSegment: builder.mutation<void, { segmentId: string; points: IPoint[] }>({
            query: ({ segmentId, points }) => ({
                url: `/segment/update/${segmentId}`,
                method: "PATCH",
                body: { points },
            }),
            invalidatesTags: ["Segments"],
        }),
        deleteSegment: builder.mutation<void, string>({
            query: (segmentId) => ({
                url: `/segment/update/${segmentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Segments"],
        }),
        addNewRevise: builder.mutation<{ id: string }, string>({
            query: (id) => ({
                url: `/copy`,
                method: "POST",
                body: { id: id },
            }),
            invalidatesTags: ["Cytology"],
            transformResponse: (response: any): { id: string } => {
                // API возвращает { pk: uuid, id: uuid }, но фронтенд ожидает { id: string }
                return { id: response.id || response.pk || "" };
            },
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
