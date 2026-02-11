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
        const response = await axiosInstance.post('/cytology', formData, {
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
