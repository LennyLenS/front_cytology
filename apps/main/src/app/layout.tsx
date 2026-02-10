import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import {
    LoadingWrapper,
    MessageWrapper,
    ModalWrapper,
    SyncAuthWrapper,
} from "@/components/wrappers";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import ProvidersClient from "./providersClient";

import "../styles/reset.css";
import "../styles/global.css";

export const metadata: Metadata = {
    title: "MedML - Медицинская система",
    description: "Система для работы с пациентами, врачами, картами, УЗИ и цитологией",
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
                                    <Header />
                                    {children}
                                    <Footer />
                                </SyncAuthWrapper>
                            </ModalWrapper>
                        </MessageWrapper>
                    </LoadingWrapper>
                </ProvidersClient>
            </body>
        </html>
    );
}
