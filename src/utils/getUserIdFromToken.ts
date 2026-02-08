import { jwtDecode } from "jwt-decode";

/**
 * Извлекает UUID пользователя (врача) из JWT токена
 * @param token - JWT токен
 * @returns UUID пользователя или null, если токен невалиден
 */
export function getUserIdFromToken(token: string | null | undefined): string | null {
    if (!token) return null;

    try {
        const decoded = jwtDecode<{ user_id: string }>(token);
        return decoded.user_id || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}
