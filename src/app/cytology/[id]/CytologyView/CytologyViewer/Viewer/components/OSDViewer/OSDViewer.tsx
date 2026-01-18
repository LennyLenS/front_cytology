import React from "react";

import {
    OpenSeadragonAnnotationPopup,
    OpenSeadragonAnnotator,
    OpenSeadragonViewer,
} from "@annotorious/react";

import CommentPopup from "../CommentPopup/CommentPopup";

interface OSDViewerProps {
    drawingEnable?: boolean;
    needPopup?: boolean;
    tool: "rectangle" | "polygon" | "move";
    selected: boolean;
    imageUrl: string;
    filePath?: string;
    needInputPopup?: boolean;
}

const OSDViewer: React.FC<OSDViewerProps> = ({
    drawingEnable = false,
    needPopup = false,
    tool,
    imageUrl,
    filePath,
    selected,
    needInputPopup = false,
}) => {
    return (
        <>
            {imageUrl !== "" ? (
                <OpenSeadragonAnnotator
                    drawingEnabled={drawingEnable && tool !== "move" && selected}
                    tool={tool !== "move" ? tool : null}
                >
                    <OpenSeadragonViewer
                        options={{
                            tileSources: (() => {
                                const baseUrl = process.env.NEXT_PUBLIC_DZI_API_BASE_URL || "";
                                const imagePath = imageUrl.replace("/media/", "");

                                // Если есть file_path, извлекаем id из него и передаем как параметр
                                if (filePath) {
                                    // Извлекаем id из file_path
                                    // Пробуем несколько способов извлечения ID
                                    let fileId: string | null = null;

                                    try {
                                        // Вариант 1: последний сегмент пути без расширения (наиболее вероятный)
                                        const pathParts = filePath.split("/").filter(Boolean);
                                        if (pathParts.length > 0) {
                                            const fileName = pathParts[pathParts.length - 1];
                                            // Убираем расширение файла
                                            fileId = fileName.replace(/\.[^.]+$/, "");
                                        }

                                        // Вариант 2: если не получилось, ищем число в пути (UUID или числовой ID)
                                        if (!fileId || fileId === "") {
                                            // Ищем UUID или числовой ID в пути
                                            const uuidMatch = filePath.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                                            if (uuidMatch) {
                                                fileId = uuidMatch[0];
                                            } else {
                                                // Ищем числовой ID
                                                const numberMatch = filePath.match(/\/(\d+)(?:\.|$|\/)/);
                                                if (numberMatch) {
                                                    fileId = numberMatch[1];
                                                }
                                            }
                                        }

                                        // Вариант 3: если file_path уже является ID (просто число или UUID)
                                        if (!fileId || fileId === "") {
                                            const trimmedPath = filePath.trim();
                                            // Проверяем, является ли file_path уже ID
                                            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedPath) || /^\d+$/.test(trimmedPath)) {
                                                fileId = trimmedPath;
                                            }
                                        }
                                    } catch (e) {
                                        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
                                            console.warn("Failed to extract id from file_path:", filePath, e);
                                        }
                                    }

                                    if (fileId) {
                                        const separator = baseUrl.includes("?") ? "&" : "?";
                                        return `${baseUrl}/${imagePath}${separator}id=${encodeURIComponent(fileId)}`;
                                    }
                                }

                                return `${baseUrl}/${imagePath}`;
                            })(),
                            prefixUrl: "/openseadragon-images/",
                            gestureSettingsMouse: {
                                clickToZoom: false,
                            },
                        }}
                        className="osd"
                    />
                    {needPopup && (
                        <OpenSeadragonAnnotationPopup
                            popup={(props) => (
                                <CommentPopup
                                    {...props}
                                    needInput={needInputPopup}
                                    isEditingMode={drawingEnable}
                                />
                            )}
                        />
                    )}
                </OpenSeadragonAnnotator>
            ) : (
                <p style={{ width: "100%", height: "100%", margin: 0 }}>Изображение отсутствует</p>
            )}
        </>
    );
};

export default OSDViewer;
