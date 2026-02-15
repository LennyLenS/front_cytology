import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://109.73.201.164:8000/api/v3";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

// Увеличиваем таймаут для больших файлов (максимум 300 секунд = 5 минут)
export const maxDuration = 300;

// Используем nodejs runtime для больших файлов
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        const path = params.path.join("/");
        const url = new URL(request.url);
        const searchParams = url.searchParams.toString();
        const queryString = searchParams ? `?${searchParams}` : "";

        // Формируем правильный URL к API
        const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
        const apiUrl = `${cleanBaseUrl}/cytology/${path}${queryString}`;

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
                        const entries = Array.from(body.entries());
                        const fileEntries = entries.filter(([key]) => key === 'image');
                        const fileSize = fileEntries.length > 0 && fileEntries[0][1] instanceof File
                            ? (fileEntries[0][1] as File).size
                            : 0;
                        console.log("🔵 FormData parsed successfully, entries:", entries.map(([key]) => key));
                        if (fileSize > 0) {
                            console.log("🔵 File size:", (fileSize / 1024 / 1024).toFixed(2), "MB");
                        }
                    }
                } catch (error) {
                    console.error("❌ Failed to parse FormData:", error);
                    return NextResponse.json(
                        { error: "Failed to parse FormData", details: error instanceof Error ? error.message : String(error) },
                        { status: 400 }
                    );
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

        let response: Response;
        try {
            response = await fetch(apiUrl, fetchOptions);
        } catch (fetchError) {
            console.error("❌ Fetch Error:", fetchError);
            return NextResponse.json(
                {
                    error: "Failed to fetch",
                    details: fetchError instanceof Error ? fetchError.message : String(fetchError),
                    message: "Не удалось подключиться к серверу API. Проверьте доступность сервера и сетевые настройки."
                },
                { status: 503 }
            );
        }

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
