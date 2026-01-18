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

                                // Если есть file_path, добавляем его как параметр запроса
                                if (filePath) {
                                    const separator = baseUrl.includes("?") ? "&" : "?";
                                    return `${baseUrl}/${imagePath}${separator}file_path=${encodeURIComponent(filePath)}`;
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
