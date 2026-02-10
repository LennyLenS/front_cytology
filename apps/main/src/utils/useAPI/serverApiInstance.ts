'use client'
import { serverApiInstanceProps } from '@/utils/useAPI/Types'
import apiInstance from '@/utils/apiInstance'
import axios, { AxiosResponse } from 'axios'

export async function serverApiInstance<T>({
    data,
    method,
    params,
    url,
    accessToken,
}: serverApiInstanceProps): Promise<T> {
    console.log('serverApiInstance')
    console.log('accessToken', accessToken)
    console.log('url', url)
    console.log('data', data)
    console.log('params', params)

    try {
        const baseURL = typeof window !== 'undefined'
            ? '/api/proxy'
            : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        const config: any = {
            method,
            url: `${baseURL}/${url}`,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        if (data) {
            config.data = data;
        }

        if (params) {
            config.params = params;
        }

        const res: AxiosResponse<T> = await axios(config);

        return res.data
    } catch (err) {
        console.log('err', err)
        throw err
    }
}
