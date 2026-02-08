"use client";

import "./upload_photo.css";
import { useEffect, useState } from "react";
import { Flex, Form, Select, Input, Space, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Page from "@/components/Page/Page";
import Text from "@/components/Universal/Text/Text";
import Spacer from "@/components/Universal/Spacer/Spacer";
import Button from "@/components/Universal/Button/Button";
import MethodsPatientModal from "@/components/Modals/MethodsPatientsModal/methodsPatientModal";
import UploadPhotoModal from "./components/UploadPhotoModal/uploadPhotoModal";
import { useDispatch, useSelector } from "react-redux";
import { handleShow as uploadPhotoCardHandleShow } from "../../stores/uploadPhotoSlice";
import { handleShow as methodsPatientModalHandleShow } from "../../stores/methodsPatientModalSlice";
import { useGetMedWorkerQuery, useGetMedWorkerPatientsQuery } from "../../service/medWorkerAndPatient";
import { useRTKEffects } from "../../service/hook";
import { IPatient } from "../../types/patient";
import { localizations, markings } from "../../types/constants";
import { useAppSelector } from "@/stores/hook";
import { skipToken } from "@reduxjs/toolkit/query";

const { useWatch, useForm, Item } = Form;

function formatPolicy(str: string) {
    return str.replace(/(.{4})/g, "$1 ");
}

export default function UploadPhoto() {
    const dispatch = useDispatch();
    const [form] = useForm();
    const [isPatientData, setIsPatientData] = useState<IPatient[]>([]);
    const [medWorkerId, setMedWorkerId] = useState<string | null>(null);
    const token = useAppSelector((state) => state.auth.accessToken);

    // Проверяем наличие токена: из .env или из Redux store
    const hasToken = !!token || !!process.env.NEXT_PUBLIC_API_TOKEN;

    // Безопасное получение ID из localStorage (только на клиенте)
    useEffect(() => {
        if (typeof window !== "undefined" && hasToken) {
            const id = localStorage.getItem("id");
            // Проверяем что ID не null, не "null", не "undefined" и не пустая строка
            const validId = id && id !== "null" && id !== "undefined" && id.trim() !== "" ? id : null;
            setMedWorkerId(validId);
        }
    }, [hasToken]);

    const {
        isLoading: isMedWorkerLoading,
        data: medWorkerData,
        error: errorMedWorker,
    } = useGetMedWorkerQuery(hasToken && medWorkerId ? medWorkerId : skipToken);
    useRTKEffects({ isLoading: isMedWorkerLoading, error: errorMedWorker }, "Get medworker");

    const {
        isLoading: isPatientsLoading,
        data: patientsData,
        error: errorPatients,
    } = useGetMedWorkerPatientsQuery(
        hasToken && medWorkerId ? { doctorId: medWorkerId } : skipToken
    );
    useRTKEffects({ isLoading: isPatientsLoading, error: errorPatients }, "Get patients");

    useEffect(() => {
        if (patientsData && Array.isArray(patientsData)) {
            // Новый API возвращает массив пациентов напрямую
            const patients: IPatient[] = patientsData.map((patient: any) => ({
                idCard: patient.id,
                id: patient.id,
                fullName: patient.fullname || "",
                birthDate: patient.birth_date,
                diagnosis: "", // Диагноз нужно получать из карты отдельно
                email: patient.email,
                personalPolicy: patient.policy || "",
                isActive: patient.active,
            }));
            setIsPatientData(patients);
        }
    }, [patientsData]);

    const watchedValues = useWatch([], form);
    const isValidForm =
        watchedValues?.marking &&
        watchedValues?.number &&
        watchedValues?.localization &&
        watchedValues?.calcitonin &&
        watchedValues?.thyroglobulin &&
        watchedValues?.calcInSense;
        // idCard больше не обязателен

    return (
        <>
            <Page className="upload-photo-form">
                <Spacer space={50} />
                <Flex justify="center">
                    {hasToken ? (
                        <Flex vertical className="flex">
                            <Text className="title">Новый пунктат</Text>

                            <Form form={form} style={{ fontWeight: 600 }}>
                                <Spacer space={20} />
                                <Item
                                    label="Доп. маркировка"
                                    layout="vertical"
                                    name="marking"
                                    required={true}
                                >
                                    <Select
                                        options={Object.entries(markings).map(([key, value]) => {
                                            return {
                                                label: value,
                                                value: key,
                                            };
                                        })}
                                        placeholder="Доп. маркировка"
                                        size="large"
                                    />
                                </Item>

                                <Spacer space={35} />
                                <Item
                                    label="Номер исследования"
                                    layout="vertical"
                                    name="number"
                                    required={true}
                                >
                                    <Input
                                        type="number"
                                        size="large"
                                        placeholder="Номер исследования"
                                    />
                                </Item>

                                <Spacer space={35} />
                                <Item
                                    label="Локализация"
                                    layout="vertical"
                                    name="localization"
                                    required={true}
                                >
                                    <Select
                                        options={Object.entries(localizations).map(
                                            ([key, value]) => {
                                                return {
                                                    label: value,
                                                    value: key,
                                                };
                                            }
                                        )}
                                        placeholder="Локализация"
                                        size="large"
                                    />
                                </Item>

                                <Spacer space={35} />
                                <Item
                                    label="Кальцитонин"
                                    layout="vertical"
                                    name="calcitonin"
                                    required={true}
                                >
                                    <Input type="number" size="large" placeholder="Кальцитонин" />
                                </Item>

                                <Spacer space={35} />
                                <Item
                                    label="Тиреоглобулин в смыве"
                                    layout="vertical"
                                    name="thyroglobulin"
                                    required={true}
                                >
                                    <Input
                                        type="number"
                                        size="large"
                                        placeholder="Тиреоглобулин в смыве"
                                    />
                                </Item>

                                <Spacer space={35} />
                                <Item
                                    label="Кальцитонин в смыве"
                                    layout="vertical"
                                    name="calcInSense"
                                    required={true}
                                >
                                    <Input
                                        type="number"
                                        size="large"
                                        placeholder="Кальцитонин в смыве"
                                    />
                                </Item>

                                <Spacer space={35} />
                                <Item
                                    label="Пациент (необязательно)"
                                    layout="vertical"
                                    name="idCard"
                                    required={false}
                                >
                                    <Select
                                        size="large"
                                        allowClear
                                        options={
                                            Array.isArray(isPatientData)
                                                ? isPatientData.map((patient) => ({
                                                      value: patient.idCard,
                                                      label: patient.fullName,
                                                      policy: patient.personalPolicy,
                                                  }))
                                                : []
                                        }
                                        optionRender={(option) => (
                                            <Space>
                                                <div>{option.label}</div>
                                                <div>{formatPolicy(option.data.policy)}</div>
                                            </Space>
                                        )}
                                        placeholder="Пациент (опционально)"
                                    ></Select>
                                </Item>
                            </Form>

                            <Spacer space={50} />
                            <Button
                                className="button button-upload"
                                onClick={() => {
                                    dispatch(
                                        uploadPhotoCardHandleShow({
                                            idCard: watchedValues?.idCard,
                                            marking: watchedValues?.marking,
                                            number: watchedValues?.number,
                                            localization: watchedValues?.localization,
                                            calcitonin: watchedValues?.calcitonin,
                                            thyroglobulin: watchedValues?.thyroglobulin,
                                            calcInSense: watchedValues?.calcInSense,
                                        })
                                    );
                                }}
                                title="Загрузить снимок"
                                type="primary"
                                disabled={!isValidForm}
                            />

                            <Spacer space={30} />
                            <Button
                                className="button button-new-card"
                                type="primary"
                                onClick={() =>
                                    dispatch(methodsPatientModalHandleShow({ method: "create" }))
                                }
                                title={
                                    <Text>
                                        <PlusOutlined /> Добавить нового пациента
                                    </Text>
                                }
                            />
                        </Flex>
                    ) : (
                        <Spin size="large" />
                    )}
                </Flex>
            </Page>

            <UploadPhotoModal />

            <MethodsPatientModal />
        </>
    );
}
