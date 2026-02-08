import apiInstance from "@/utils/apiInstance";

export default async function loginUserInBackend(email: string, password: string) {
    console.log("loginUserInBackend");

    console.log("email", email);

    console.log("password", password);

    // В новом API endpoint /login (без префикса auth/)
    // Swagger показывает: POST http://localhost:8080/api/v1/login
    // baseURL = /api/proxy (на клиенте) или http://localhost:8080/api/v1 (на сервере)
    // Прокси PROXY_TARGET = http://localhost:8080/api/v1
    // Поэтому используем просто /login (прокси уже знает про /api/v1)
    const response = await apiInstance({
        method: "POST",
        url: `/login`,
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
