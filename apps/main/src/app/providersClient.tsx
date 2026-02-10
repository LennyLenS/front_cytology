"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "../stores/store";
import AntDesignProvider from "../utils/AntDesignProvider";
import ReactQueryProvider from "../utils/ReactQueryProvider";
import AuthProvider from "../utils/AuthProvider";
import { NotificationProvider } from "../utils/NotificationProvider";

export default function ProvidersClient({
    children,
    session
}: {
    children: React.ReactNode;
    session: any;
}) {
    return (
        <Provider store={store}>
            <AuthProvider session={session}>
                <AntDesignProvider>
                    <ReactQueryProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </ReactQueryProvider>
                </AntDesignProvider>
            </AuthProvider>
        </Provider>
    );
};
