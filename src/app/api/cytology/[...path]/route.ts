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

        // Получаем тело запроса если есть
        let body = null;
        if (method !== "GET" && method !== "DELETE") {
            try {
                body = await request.json();
            } catch {
                // Если не JSON, пробуем как FormData
                try {
                    const formData = await request.formData();
                    body = formData;
                } catch {
                    body = null;
                }
            }
        }

        // Получаем токен из заголовков или из .env
        const authHeader = request.headers.get("authorization");
        const token = API_TOKEN || authHeader?.replace("Bearer ", "");

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Копируем другие заголовки если нужно
        const contentType = request.headers.get("content-type");
        if (contentType && contentType.includes("multipart/form-data")) {
            delete headers["Content-Type"]; // Пусть fetch установит правильный Content-Type для FormData
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
