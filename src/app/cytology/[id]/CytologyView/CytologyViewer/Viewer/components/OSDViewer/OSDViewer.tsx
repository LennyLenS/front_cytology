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

                                // Если есть file_path, извлекаем UUID из него и формируем правильный путь
                                if (filePath) {
                                    // Извлекаем UUID из file_path
                                    // Формат file_path: {uuid1}/{uuid2}/{uuid2}_files/{level}/{x}_{y}.jpeg
                                    // Нужно извлечь uuid1 и uuid2
                                    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
                                    const uuids = filePath.match(uuidRegex);

                                    if (uuids && uuids.length >= 2) {
                                        // Первый UUID - это первый сегмент пути
                                        const uuid1 = uuids[0];
                                        // Второй UUID - это второй сегмент (может повторяться)
                                        const uuid2 = uuids[1];

                                        // Формируем путь в формате: /tiler/dzi/{uuid1}/{uuid2}/{uuid2}
                                        // OpenSeadragon автоматически добавит /files/{level}/{x}_{y}.jpeg
                                        return `${baseUrl}/tiler/dzi/${uuid1}/${uuid2}/${uuid2}`;
                                    }
                                }

                                // Fallback: используем старый формат, если file_path не в ожидаемом формате
                                const imagePath = imageUrl.replace("/media/", "");
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
