export * from "./store";
export * from "./slices/cytology.slice";
export * from "./slices/ref.slice";
export * from "./slices/segment.slice";

// Re-export all actions for convenience
export {
    setCytologyId,
    setCytologyInfo,
    setEditedCytologyInfo,
} from "./slices/cytology.slice";

export {
    setCurrentSegment,
    setSegmentsStack,
    addNewSegmentToStack,
    editPointSegment,
    setInitSegments,
    markAsDeleted,
    markAsUnDeleted,
    addNewGroupedType,
} from "./slices/segment.slice";

export { setToolPanelHeight } from "./slices/ref.slice";
