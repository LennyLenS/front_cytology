import { isRejectedWithValue, isFulfilled, isPending } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

export type LoadingHandlerArgs = {
    addLoading: (key: string) => void;
    removeLoading: (key: string) => void;
};

export const createLoadingHandler =
    (loadingMethods: LoadingHandlerArgs): Middleware =>
    () =>
    (next) =>
    (action) => {
        if (isPending(action)) {
            const actionMetaArgs = action.meta.arg as { queryCacheKey: string };
            loadingMethods.addLoading(actionMetaArgs.queryCacheKey);
        } else if (isFulfilled(action) || isRejectedWithValue(action)) {
            const actionMetaArgs = action.meta.arg as { queryCacheKey: string };
            loadingMethods.removeLoading(actionMetaArgs.queryCacheKey);
        }

        return next(action);
    };
