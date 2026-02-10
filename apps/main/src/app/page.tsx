"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (session) {
            router.push("/patients");
        } else {
            router.push("/auth-pages/login");
        }
    }, [session, status, router]);

    return null;
}
