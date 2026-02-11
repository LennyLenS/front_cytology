import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://109.73.201.164:8000/api/v3";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, params, "GET");
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, params, "POST");
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, params, "PATCH");
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, params, "DELETE");
}

async function handleRequest(
    request: NextRequest,
    params: { path: string[] },
    method: string
) {
    try {
        // params.path может быть пустым массивом для /api/cytology
        const path = params.path && params.path.length > 0 ? params.path.join("/") : "";
        const url = new URL(request.url);
        const searchParams = url.searchParams.toString();
        const queryString = searchParams ? `?${searchParams}` : "";

        // Формируем правильный URL к API
        const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
        // Если path пустой, создаем новую цитологию (POST /cytology/)
        const apiUrl = path
            ? `${cleanBaseUrl}/cytology/${path}${queryString}`
            : `${cleanBaseUrl}/cytology${queryString}`;

        // Логирование в development
        if (process.env.NODE_ENV === "development") {
            console.log("🔵 Proxy Request:", {
                method,
                path,
                apiUrl,
                hasToken: !!API_TOKEN,
            });
        }

        // Получаем Content-Type из запроса
        const contentType = request.headers.get("content-type") || "";
        const isFormData = contentType.includes("multipart/form-data");

        // Логирование Content-Type
        if (process.env.NODE_ENV === "development") {
            console.log("🔵 Content-Type:", contentType, "isFormData:", isFormData);
        }

        // Получаем тело запроса если есть
        let body = null;
        if (method !== "GET" && method !== "DELETE") {
            if (isFormData) {
                // Если это FormData, парсим как FormData
                try {
                    body = await request.formData();
                    if (process.env.NODE_ENV === "development") {
                        console.log("🔵 FormData parsed successfully, entries:", Array.from(body.entries()).map(([key]) => key));
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("❌ Failed to parse FormData:", error);
                    }
                    body = null;
                }
            } else {
                // Иначе парсим как JSON
                try {
                    body = await request.json();
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("❌ Failed to parse JSON:", error);
                    }
                    body = null;
                }
            }
        }

        // Получаем токен из заголовков или из .env
        const authHeader = request.headers.get("authorization");
        const token = API_TOKEN || authHeader?.replace("Bearer ", "");

        const headers: HeadersInit = {};

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Для FormData не устанавливаем Content-Type - браузер сам установит с boundary
        // Для JSON устанавливаем Content-Type
        if (!isFormData && body) {
            headers["Content-Type"] = "application/json";
        }

        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (body) {
            if (body instanceof FormData) {
                fetchOptions.body = body;
            } else {
                fetchOptions.body = JSON.stringify(body);
            }
        }

        const response = await fetch(apiUrl, fetchOptions);

        // Логирование в development
        if (process.env.NODE_ENV === "development") {
            console.log("🟢 Proxy Response:", {
                method,
                path,
                status: response.status,
                statusText: response.statusText,
            });
        }

        const responseData = await response.text();
        let parsedData;
        try {
            parsedData = JSON.parse(responseData);
        } catch {
            parsedData = responseData;
        }

        // Копируем заголовки из ответа API
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
        });

        // Добавляем CORS заголовки
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        return NextResponse.json(parsedData, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("API Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
