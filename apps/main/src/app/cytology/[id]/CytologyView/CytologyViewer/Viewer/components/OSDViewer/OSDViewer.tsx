import React, { useState, useEffect } from "react";

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
    const [tileSource, setTileSource] = useState<any>(null);

    useEffect(() => {
        if (!filePath || !imageUrl) {
            // Fallback для старого формата
            const baseUrl = process.env.NEXT_PUBLIC_DZI_API_BASE_URL || "";
            const imagePath = imageUrl.replace("/media/", "");
            setTileSource(`${baseUrl}/${imagePath}`);
            return;
        }

        const loadDziTileSource = async () => {
            try {
                let baseUrl = process.env.NEXT_PUBLIC_DZI_API_BASE_URL || "";
                baseUrl = baseUrl.replace(/\/+$/, "");

                // Извлекаем UUID из file_path
                const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
                const uuids = filePath.match(uuidRegex);

                if (!uuids || uuids.length < 2) {
                    // Fallback
                    const imagePath = imageUrl.replace("/media/", "");
                    setTileSource(`${baseUrl}/${imagePath}`);
                    return;
                }

                const uuid1 = uuids[0];
                const uuid2 = uuids[1];

                const tilerBasePath = baseUrl.includes("tiler/dzi")
                    ? `${uuid1}/${uuid2}/${uuid2}`
                    : `tiler/dzi/${uuid1}/${uuid2}/${uuid2}`;

                const xmlUrl = `${baseUrl}/${tilerBasePath}`;
                const tilesBaseUrl = `${baseUrl}/${tilerBasePath}/files`;

                // Загружаем XML
                const response = await fetch(xmlUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load DZI XML: ${response.status}`);
                }
                const xmlText = await response.text();

                // Парсим XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");

                const parseError = xmlDoc.querySelector("parsererror");
                if (parseError) {
                    throw new Error("Failed to parse DZI XML");
                }

                const image = xmlDoc.querySelector("Image");
                if (!image) {
                    throw new Error("Invalid DZI XML: Image element not found");
                }

                // Парсим DZI XML правильно:
                // TileSize, Overlap, Format - это атрибуты элемента Image
                // Size - это элемент с атрибутами Width и Height
                const size = image.querySelector("Size");
                const tileSizeAttr = image.getAttribute("TileSize");
                const formatAttr = image.getAttribute("Format");
                const overlapAttr = image.getAttribute("Overlap");

                // Получаем значения из DZI XML
                const width = parseInt(size?.getAttribute("Width") || "0");
                const height = parseInt(size?.getAttribute("Height") || "0");
                const tileSizeValue = parseInt(tileSizeAttr || "0");
                const overlapValue = parseInt(overlapAttr || "0");
                // Format в DZI XML - это "jpeg", но для расширения файла нужно "jpeg" или "jpg"
                const formatValue = formatAttr || "jpeg";
                const fileExtension = formatValue === "jpeg" ? "jpeg" : formatValue;

                // Валидация: если значения не получены из XML, это ошибка
                if (width === 0 || height === 0 || tileSizeValue === 0) {
                    throw new Error(`Invalid DZI XML: missing required attributes (width=${width}, height=${height}, tileSize=${tileSizeValue})`);
                }

                // Создаем объект tileSource с правильными путями к тайлам
                const source = {
                    type: "dzi",
                    width: width,
                    height: height,
                    tileSize: tileSizeValue, // Используем реальное значение из DZI XML (510)
                    tileOverlap: overlapValue, // Используем реальное значение из DZI XML (1)
                    tileFormat: formatValue,
                    // Переопределяем путь к тайлам - используем /files вместо _files
                    // OpenSeadragon передает x и y как координаты тайла (col, row)
                    getTileUrl: function(level: number, x: number, y: number) {
                        // Используем формат из DZI XML
                        return `${tilesBaseUrl}/${level}/${x}_${y}.${fileExtension}`;
                    },
                };

                setTileSource(source);
            } catch (error) {
                console.error("Failed to load DZI tileSource:", error);
                // Fallback
                const baseUrl = process.env.NEXT_PUBLIC_DZI_API_BASE_URL || "";
                const imagePath = imageUrl.replace("/media/", "");
                setTileSource(`${baseUrl}/${imagePath}`);
            }
        };

        loadDziTileSource();
    }, [filePath, imageUrl]);

    if (!tileSource) {
        return <p style={{ width: "100%", height: "100%", margin: 0 }}>Загрузка...</p>;
    }

    return (
        <>
            {imageUrl !== "" ? (
                <OpenSeadragonAnnotator
                    drawingEnabled={drawingEnable && tool !== "move" && selected}
                    tool={tool !== "move" ? tool : null}
                >
                    <OpenSeadragonViewer
                        options={{
                            tileSources: tileSource,
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
