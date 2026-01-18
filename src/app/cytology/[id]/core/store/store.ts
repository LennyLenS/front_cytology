import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import {
    createLoadingHandler,
    createErrorHandler,
    ErrorHandlerArgs,
    LoadingHandlerArgs,
} from "@/middlewares";

import authSlice from "@/stores/authSlice";

import cytologySlice from "./slices/cytology.slice";
import refSlice from "./slices/ref.slice";
import segmentSlice from "./slices/segment.slice";

import { cytologyApi } from "../service/cytology";

export const createStore = (loadingMethods: LoadingHandlerArgs, errorMethods: ErrorHandlerArgs) => {
    const store = configureStore({
        reducer: {
            auth: authSlice.reducer,
            cytology: cytologySlice.reducer,
            ref: refSlice.reducer,
            segment: segmentSlice.reducer,
            [cytologyApi.reducerPath]: cytologyApi.reducer,
        },

        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .concat(cytologyApi.middleware)
                .concat(createLoadingHandler(loadingMethods))
                .concat(createErrorHandler(errorMethods)),
    });

    setupListeners(store.dispatch);

    return store;
};

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
