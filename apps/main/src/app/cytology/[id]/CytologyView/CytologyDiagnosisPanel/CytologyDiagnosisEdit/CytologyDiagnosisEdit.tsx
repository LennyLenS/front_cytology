import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Flex, Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@cytology/core/hooks";
import { ModalContext } from "@/contexts";
import {
    useAddNewReviseMutation,
    useAddSegmentMutation,
    useDeleteSegmentMutation,
    useLazyGetCytologySegmentQuery,
    usePatchCytologyInfoMutation,
    usePatchSegmentMutation,
} from "@cytology/core/service/cytology";
import { prepareCytologyInfo } from "@cytology/core/functions/prepareCytologyInfo";

import {
    IGroupedSegments,
    ISegmentStack,
    SegmentType,
    segmentTypes,
} from "@cytology/core/types/segments";

import DiagnosisCard from "@cytology/common/DiagnosisCard/DiagnosisCard";

import BlockSpace from "../BlockSpace/BlockSpace";
import AddSegment from "./AddSegment/AddSegment";
import ViewEditConclusion from "../ViewEditConclusion/ViewEditConclusion";

import "./CytologyDiagnosisEdit.css";

const { Text } = Typography;

interface CytologyDiagnosisEditProps {
    segments: IGroupedSegments[];
    currentSegment: SegmentType | null;
    closeEdit: () => void;
    onClickCard: (newValue: SegmentType) => void;
}

const CytologyDiagnosisEdit: React.FC<CytologyDiagnosisEditProps> = ({
    segments,
    currentSegment,
    closeEdit,
    onClickCard,
}) => {
    const router = useRouter();
    const { open } = useContext(ModalContext);
    const [availableOptions, setAvailableOptions] = useState<SegmentType[]>([]);

    const cytologyId = useAppSelector((state) => state.cytology.cytologyId);
    const segmentStack = useAppSelector((state) => state.segment.segmentStack);
    const initSegments = useAppSelector((state) => state.segment.initSegmentStack);
    const cytologyInfo = useAppSelector((state) => state.cytology.cytologyInfo);
    const cytologyEditedInfo = useAppSelector((state) => state.cytology.cytologyInfoEdited);

    const cytologyEditedInfoRef = useRef(cytologyEditedInfo);

    const [addSegment] = useAddSegmentMutation();
    const [patchSegment] = usePatchSegmentMutation();
    const [deleteSegment] = useDeleteSegmentMutation();
    const [addNewRevise] = useAddNewReviseMutation();
    const [getSegmentsLazy] = useLazyGetCytologySegmentQuery();
    const [patchCytologyInfo] = usePatchCytologyInfoMutation();

    useEffect(() => {
        cytologyEditedInfoRef.current = cytologyEditedInfo;
    }, [cytologyEditedInfo]);

    useEffect(() => {
        const options = new Set(segmentTypes).difference(
            new Set(segmentStack.map((item) => item.seg_type))
        );

        setAvailableOptions(Array.from(options));
    }, [segmentStack]);

    const handleSave = useCallback(async () => {
        const newReviseId = (await addNewRevise(cytologyId).unwrap()).id;
        const newSegments = await getSegmentsLazy(newReviseId).unwrap();
        const allOldSegments: ISegmentStack[] = [];
        const allNewSegments: ISegmentStack[] = [];
        const newSegmentsMap = new Map<string, ISegmentStack>();
        const idMap = new Map<number | string, number | string>();

        const createSegmentKey = (segment: ISegmentStack): string => {
            const sortedPoints = [...segment.points]
                .sort((a, b) => a.x - b.x || a.y - b.y)
                .map((p) => `${p.x},${p.y}`)
                .join("|");

            return `${segment.seg_type}:${segment.is_ai}:${sortedPoints}`;
        };

        initSegments.forEach((group) => {
            allOldSegments.push(...group.segments);
        });
        newSegments.forEach((group) => {
            allNewSegments.push(...group.segments);
        });
        allNewSegments.forEach((seg) => {
            const key = createSegmentKey(seg);
            newSegmentsMap.set(key, seg);
        });

        allOldSegments.forEach((oldSeg) => {
            const key = createSegmentKey(oldSeg);
            const newSeg = newSegmentsMap.get(key);

            if (newSeg) {
                idMap.set(oldSeg.id, newSeg.id);
                newSegmentsMap.delete(key);
            }
        });

        segmentStack
            .flatMap((item) => item.segments)
            .forEach((segment) => {
                if (segment.isNew) {
                    addSegment({
                        cytologyId: newReviseId,
                        segment: {
                            data: {
                                points: segment.points,
                            },
                            seg_type: segment.seg_type,
                        },
                    }).catch((error) => console.warn(error));
                } else if (segment.isEdited) {
                    if (idMap.get(segment.id)) {
                        patchSegment({ segmentId: idMap.get(segment.id)!, points: segment.points });
                    } else {
                        console.error("Not in idMap", segment);
                    }
                } else if (segment.isDeleted) {
                    console.log(segment, segment.id);
                    deleteSegment(segment.id as number);
                }
            });

        if (cytologyEditedInfoRef.current) {
            patchCytologyInfo({ id: newReviseId, body: cytologyEditedInfoRef.current });
        }

        closeEdit();
        router.push(`/cytology/${newReviseId}`);
    }, [cytologyEditedInfoRef]);

    const handleAddSegmentType = useCallback(async () => {
        open({
            content: <AddSegment options={availableOptions} />,
        });
    }, [open, availableOptions]);

    const handleEditConclusion = useCallback(async () => {
        const initData = cytologyEditedInfoRef.current
            ? cytologyEditedInfoRef.current
            : cytologyInfo
            ? prepareCytologyInfo(cytologyInfo)
            : null;

        if (initData) {
            open({
                content: <ViewEditConclusion editMode={true} initData={initData} />,
            });
        }
    }, [open, cytologyInfo, cytologyEditedInfoRef]);

    return (
        <Flex vertical justify="space-between" gap={20} className="cytology-edit-panel">
            <BlockSpace />
            <Flex vertical gap={10} className="cytology-diagnosis-cards-wrapper">
                {segments.map((segment) => (
                    <DiagnosisCard
                        segmentType={segment.seg_type}
                        isActive={currentSegment === segment.seg_type}
                        onClick={() => onClickCard(segment.seg_type)}
                        key={segment.seg_type}
                    />
                ))}
            </Flex>
            <Flex vertical gap={30} className="cytology-diagnosis-edit-wrapper">
                {availableOptions.length > 0 && (
                    <Button className="cytology-diagnosis-button" onClick={handleAddSegmentType}>
                        <PlusOutlined />
                        <Text className="text-inherit">Добавить тип сегмента</Text>
                    </Button>
                )}
                <Flex vertical gap={10}>
                    <Button className="cytology-diagnosis-button" onClick={handleEditConclusion}>
                        Редактировать заключение
                    </Button>
                    <Button type="primary" onClick={handleSave}>
                        Сохранить и вернуться в режим просмотра
                    </Button>
                    <Button type="primary" onClick={closeEdit}>
                        Вернуться в режим просмотра без сохранения
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default CytologyDiagnosisEdit;
