import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import {
    LoadingWrapper,
    MessageWrapper,
    ModalWrapper,
    SyncAuthWrapper,
} from "@/components/wrappers";

import ProvidersClient from "./providersClient";

import "../styles/reset.css";
import "../styles/global.css";

export const metadata: Metadata = {
    title: "Цитология",
    description: "Система анализа цитологии",
};

export default async function RootLayout({ children }: React.PropsWithChildren) {
    const session = await getServerSession();

    return (
        <html lang="ru">
            <body>
                <ProvidersClient session={session}>
                    <LoadingWrapper>
                        <MessageWrapper>
                            <ModalWrapper>
                                <SyncAuthWrapper>
                                    {children}
                                </SyncAuthWrapper>
                            </ModalWrapper>
                        </MessageWrapper>
                    </LoadingWrapper>
                </ProvidersClient>
            </body>
        </html>
    );
}
