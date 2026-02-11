import { useContext, useEffect } from "react";
import { Flex, Timeline } from "antd";

import { ModalContext } from "@/contexts";
import { ICytologyHistory } from "../../../../core/types/cytology";

import CytologyHistoryCard from "./CytologyHistoryCard/CytologyHistoryCard";

import "./CytologyHistory.css";

interface CytologyHistoryProps {
    history: ICytologyHistory;
}

const CytologyHistory: React.FC<CytologyHistoryProps> = ({ history }) => {
    const { changeModalProps } = useContext(ModalContext);

    useEffect(() => {
        changeModalProps({
            title: "История изменений",
            footer: [],
            centered: true,
            height: "80%",
            rootClassName: "cytology-history-wrapper",
        });
    }, [changeModalProps]);

    return (
        <Flex className="cytology-history-container" vertical>
            <Timeline
                mode="left"
                items={history.results.map((historyItem) => ({
                    children: <CytologyHistoryCard {...historyItem} />,
                }))}
            />
        </Flex>
    );
};

export default CytologyHistory;
