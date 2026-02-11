import React from "react";

import { useAppDispatch, useAppSelector } from "../../core/hooks";
import { setCurrentSegment } from "../../core/store";
import { Modes } from "../../core/types/basic";
import { IGroupedSegments, SegmentType } from "../../core/types/segments";

import CytologyDiagnosisEdit from "./CytologyDiagnosisEdit/CytologyDiagnosisEdit";
import CytologyDiagnosis from "./CytologyDiagnosis/CytologyDiagnosis";

interface CytologyDiagnosisPanelProps {
    mode: Modes;
    segments: IGroupedSegments[];
    changeMode: (newMode: Modes) => void;
}

const CytologyDiagnosisPanel: React.FC<CytologyDiagnosisPanelProps> = ({
    segments,
    mode,
    changeMode,
}) => {
    const dispatch = useAppDispatch();
    const currentSegment = useAppSelector((state) => state.segment.currentSegment);

    const handleClickCard = (segmentType: SegmentType) => {
        dispatch(setCurrentSegment(segmentType === currentSegment ? null : segmentType));
    };

    return (
        <>
            {mode === "view" ? (
                <CytologyDiagnosis
                    segments={segments}
                    openEdit={() => changeMode("edit")}
                    currentSegment={currentSegment}
                    onClickCard={handleClickCard}
                />
            ) : (
                <CytologyDiagnosisEdit
                    segments={segments}
                    currentSegment={currentSegment}
                    closeEdit={() => changeMode("view")}
                    onClickCard={handleClickCard}
                />
            )}
        </>
    );
};

export default CytologyDiagnosisPanel;
