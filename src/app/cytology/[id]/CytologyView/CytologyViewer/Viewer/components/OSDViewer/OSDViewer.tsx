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

                const size = image.querySelector("Size");
                const tileSize = image.querySelector("TileSize");
                const format = image.querySelector("Format");
                const overlap = image.querySelector("Overlap");

                // Создаем объект tileSource с правильными путями к тайлам
                const source = {
                    type: "dzi",
                    width: parseInt(size?.getAttribute("Width") || "0"),
                    height: parseInt(size?.getAttribute("Height") || "0"),
                    tileSize: parseInt(tileSize?.getAttribute("Width") || "256"),
                    tileOverlap: parseInt(overlap?.getAttribute("Width") || "0"),
                    tileFormat: format?.getAttribute("Extension") || "jpeg",
                    // Переопределяем путь к тайлам - используем /files вместо _files
                    getTileUrl: function(level: number, x: number, y: number) {
                        return `${tilesBaseUrl}/${level}/${x}_${y}.jpeg`;
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
