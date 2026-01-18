import { AuthState } from "@/stores/authSlice";

export const authHeaders = (headers: Headers, { getState }: { getState: () => unknown }) => {
    // Приоритет: токен из .env > токен из Redux store
    const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
    const storeToken = (getState() as { auth: AuthState })?.auth?.accessToken;

    const token = envToken || storeToken || "";

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);

        // Отладочная информация
        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
            console.log("Auth header set:", {
                hasEnvToken: !!envToken,
                hasStoreToken: !!storeToken,
                tokenLength: token.length,
            });
        }
    } else {
        // Отладочная информация (можно убрать в продакшене)
        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
            console.warn("API Token not found. Check NEXT_PUBLIC_API_TOKEN in .env or Redux store.");
        }
    }

    return headers;
};
