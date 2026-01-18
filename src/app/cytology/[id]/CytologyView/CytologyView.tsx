import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { skipToken } from "@reduxjs/toolkit/query";

import { useAppDispatch, useAppSelector } from "@cytology/core/hooks";
import {
    setCytologyId,
    setCytologyInfo,
    setEditedCytologyInfo,
    setInitSegments,
    setSegmentsStack,
} from "@cytology/core/store";
import {
    useGetCytologyInfoQuery,
    useGetCytologySegmentQuery,
} from "@cytology/core/service/cytology";
import { Modes } from "@/app/cytology/[id]/core/types/basic";

import CytologyDiagnosisPanel from "./CytologyDiagnosisPanel/CytologyDiagnosisPanel";
import CytologyViewer from "./CytologyViewer/CytologyViewer";

import "./CytologyView.css";

interface CytologyViewProps {
    generalCytologyId: string;
}

const CytologyView: React.FC<CytologyViewProps> = ({ generalCytologyId }) => {
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const currentSegment = useAppSelector((state) => state.segment.currentSegment);
    const segmentStack = useAppSelector((state) => state.segment.segmentStack);

    const [mode, setMode] = useState<Modes>("view");

    // Проверяем наличие токена: из .env или из Redux store
    const hasToken = !!accessToken || !!process.env.NEXT_PUBLIC_API_TOKEN;

    // Проверяем, что ID не пустой и есть токен
    const canFetchData = hasToken && generalCytologyId && generalCytologyId !== "";

    const {
        data: cytologyInfoData,
        isLoading: isLoadingInfo,
        isError: isErrorInfo,
        error: errorInfo,
        refetch: refetchInfo
    } = useGetCytologyInfoQuery(
        canFetchData ? generalCytologyId : skipToken,
        {
            skip: !canFetchData,
            refetchOnMountOrArgChange: false,
            refetchOnFocus: false,
            refetchOnReconnect: false,
        }
    );

    const {
        data: segmentsData,
        isLoading: isLoadingSegments,
        isError: isErrorSegments,
        error: errorSegments,
        refetch: refetchSegments
    } = useGetCytologySegmentQuery(
        canFetchData ? generalCytologyId : skipToken,
        {
            skip: !canFetchData,
            refetchOnMountOrArgChange: false,
            refetchOnFocus: false,
            refetchOnReconnect: false,
        }
    );

    useEffect(() => {
        dispatch(setCytologyId(generalCytologyId));
    }, [dispatch, generalCytologyId]);

    useEffect(() => {
        if (cytologyInfoData && mode === "view") {
            dispatch(setCytologyInfo(cytologyInfoData.info));
            dispatch(setEditedCytologyInfo(null));
        }
    }, [cytologyInfoData, dispatch, mode]);

    useEffect(() => {
        if (mode === "view") {
            dispatch(setInitSegments(segmentsData || []));
            dispatch(setSegmentsStack(segmentsData || []));
        }
    }, [dispatch, mode, segmentsData]);

    // Отладочная информация (можно убрать в продакшене)
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            if (isErrorInfo || isErrorSegments) {
                console.error("Cytology API Error:", {
                    infoError: errorInfo,
                    segmentsError: errorSegments,
                    cytologyId: generalCytologyId,
                    hasToken,
                });
            }
        }
    }, [isErrorInfo, isErrorSegments, errorInfo, errorSegments, generalCytologyId, hasToken]);

    if (isLoadingInfo || isLoadingSegments) {
        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    if (isErrorInfo || isErrorSegments) {
        const error = errorInfo || errorSegments;
        const errorMessage = error
            ? ('data' in error && error.data
                ? (typeof error.data === 'string' ? error.data : JSON.stringify(error.data))
                : ('status' in error ? `Ошибка ${error.status}` : JSON.stringify(error)))
            : "Неизвестная ошибка";

        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                <p style={{ color: "red" }}>
                    Ошибка загрузки данных: {errorMessage}
                </p>
                {!hasToken && (
                    <p style={{ color: "orange", marginTop: "10px" }}>
                        Возможно, требуется авторизация. Токен не найден.
                    </p>
                )}
            </div>
        );
    }

    if (!cytologyInfoData) {
        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                <p>Данные не найдены</p>
            </div>
        );
    }

    return (
        <>
            <Row className="cytology-view" gutter={24}>
                <Col span={16} className="cytology-viewer-wrapper">
                    <CytologyViewer
                        isEditMode={mode === "edit"}
                        segments={(segmentStack ?? []).flatMap((item) =>
                            item.seg_type === currentSegment ? item.segments : []
                        )}
                        imageUrl={cytologyInfoData?.original_image.image}
                        filePath={cytologyInfoData?.original_image.file_path}
                    />
                </Col>
                <Col span={8} className="cytology-diagnosis">
                    <CytologyDiagnosisPanel
                        mode={mode}
                        segments={segmentStack}
                        changeMode={setMode}
                    />
                </Col>
            </Row>
        </>
    );
};

export default CytologyView;
