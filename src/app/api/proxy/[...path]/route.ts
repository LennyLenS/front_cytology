import { NextRequest, NextResponse } from "next/server";

// Универсальный прокси для всех запросов к localhost:8080
// Если NEXT_PUBLIC_API_BASE_URL указан, используем его, иначе localhost:8080
// Swagger показывает base URL: http://localhost:8080/api/v1
// Поэтому PROXY_TARGET должен быть http://localhost:8080/api/v1
const PROXY_TARGET = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_PROXY_TARGET || "http://localhost:8080/api/v1";
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, params, "PUT");
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
        // Если PROXY_TARGET уже содержит путь (например, http://localhost:8080/api/v1),
        // то просто добавляем path к нему
        const cleanTarget = PROXY_TARGET.replace(/\/+$/, "");
        const apiUrl = `${cleanTarget}/${path}${queryString}`;

        // Логирование в development
        if (process.env.NODE_ENV === "development") {
            console.log("🔵 Universal Proxy Request:", {
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

        // Копируем важные заголовки из оригинального запроса
        const contentType = request.headers.get("content-type");
        if (contentType && contentType.includes("multipart/form-data")) {
            delete headers["Content-Type"]; // Пусть fetch установит правильный Content-Type для FormData
        }

        // Копируем другие заголовки если нужно
        const acceptHeader = request.headers.get("accept");
        if (acceptHeader) {
            headers["Accept"] = acceptHeader;
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
            console.log("🟢 Universal Proxy Response:", {
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
            // Пропускаем некоторые заголовки, которые не должны копироваться
            if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        // Добавляем CORS заголовки
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

        return NextResponse.json(parsedData, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("Universal Proxy Error:", error);
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
            "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
    });
}
