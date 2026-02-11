import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

import { useAppDispatch } from "../core/hooks";
import { setToken } from "../store/authSlice";

interface PageWrapperProps {
    children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
    const dispatch = useAppDispatch();

    const { data }: { data: (Session & { accessToken?: string }) | null } = useSession();

    useEffect(() => {
        dispatch(setToken(data?.accessToken));
    }, [data, dispatch]);

    return children;
};

export default PageWrapper;
