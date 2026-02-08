import apiInstance from "@/utils/apiInstance";

export default async function loginUserInBackend(email: string, password: string) {
    console.log("loginUserInBackend");

    console.log("email", email);

    console.log("password", password);

    // В новом API endpoint /login (без префикса auth/)
    // baseURL = /api/proxy, который проксирует на http://localhost:8080
    // Прокси добавляет путь к базовому URL, поэтому используем /api/v1/login
    const response = await apiInstance({
        method: "POST",
        url: `/api/v1/login`,
        data: {
            email,
            password,
        },
    });

    // Новый API возвращает access_token и refresh_token (с подчеркиванием)
    const { access_token, refresh_token } = response.data;
    console.log("Login response:", response.data);

    // Возвращаем в формате, ожидаемом NextAuth
    return {
        access: access_token,
        refresh: refresh_token
    };
}
