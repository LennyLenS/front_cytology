import { createAppDispatchGeneric } from "@/hooks";

import type { AppDispatch } from "../store";

const useAppDispatch = createAppDispatchGeneric<AppDispatch>();

export default useAppDispatch;
