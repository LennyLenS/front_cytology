import axiosInstance from '@/utils/apiInstance'

export async function uploadUzi(
    body: {
        fileImg: File
        projection: string
        patientId: string
        deviceId: string
    },
    token?: string | undefined | null
) {
    try {
        const formData = new FormData()
        formData.append('file', body.fileImg)
        formData.append('projection', body.projection)
        formData.append('external_id', body.patientId)
        formData.append('device_id', body.deviceId)
        const response = await axiosInstance.post('/uzi', formData, {
            headers: {
                'Content-Type': 'multipart/form-data;',
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error: any) {
        throw error
    }
}

export async function uploadCytology(
    body: {
        fileImg: File
        patientId: string
        deviceId: string
    },
    token?: string | undefined | null
) {
    try {
        const formData = new FormData()
        formData.append('file', body.fileImg)
        formData.append('external_id', body.patientId)
        formData.append('device_id', body.deviceId)

        // Используем прокси /api/cytology/[...path]
        // Для создания новой цитологии путь должен быть пустым, поэтому используем /api/cytology
        // Next.js catch-all route [...path] обработает это как пустой массив
        const response = await fetch('/api/cytology', {
            method: 'POST',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
            body: formData,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`)
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        throw error
    }
}
