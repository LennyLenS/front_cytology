import { createAppDispatchGeneric } from "@/hooks";

import type { AppDispatch } from "../store/store";

const useAppDispatch = createAppDispatchGeneric<AppDispatch>();

export default useAppDispatch;
