import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

export type ErrorHandlerArgs = { setError: (text: string) => void };

export const createErrorHandler =
    (errorMethods: ErrorHandlerArgs): Middleware =>
    () =>
    (next) =>
    (action) => {
        if (isRejectedWithValue(action)) {
            errorMethods.setError(
                (action.payload as { error?: string })?.error || "Что-то пошло не так"
            );
        }

        return next(action);
    };
