import { AuthState } from "../stores/authSlice";

export const prepareHeaders = (headers: Headers, { getState }: { getState: () => unknown }) => {
    // Приоритет: токен из .env > токен из Redux store
    const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
    const storeToken = (getState() as { auth: AuthState })?.auth?.accessToken;

    const token = envToken || storeToken || "";

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Не устанавливаем Content-Type здесь - RTK Query автоматически обработает FormData
    // Если body - FormData, RTK Query не будет устанавливать Content-Type,
    // чтобы браузер сам установил правильный boundary

    return headers;
};
