import { createAppSelectorGeneric } from "@/hooks";
import type { RootState } from "../store/store";

const useAppSelector = createAppSelectorGeneric<RootState>();

export default useAppSelector;
