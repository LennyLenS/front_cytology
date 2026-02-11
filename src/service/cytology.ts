import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { prepareHeaders } from './headers'

export const cytologyApi = createApi({
    reducerPath: 'cytologyApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            'http://194.226.121.145:8080/api/v1/'
        }cytology/`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getCytology: builder.query<any, string>({
            query: (id) => `${id}`,
        }),
        editCytology: builder.mutation<void, { id: string; payload: Partial<any> }>({
            query: ({ id, payload }) => ({
                url: `${id}/update`,
                method: 'PATCH',
                body: payload,
            }),
        }),
        getHistory: builder.query<any, string>({
            query: (id) => `history/${id}`,
        }),
        createCytology: builder.mutation<
            { image_id: number },
            { payload: FormData | Partial<any> }
        >({
            query: (body) => ({
                url: 'create/',
                method: 'POST',
                body: body.payload,
            }),
        }),
    }),
})

export const {
    useCreateCytologyMutation,
    useGetHistoryQuery,
    useGetCytologyQuery,
    useEditCytologyMutation,
} = cytologyApi
