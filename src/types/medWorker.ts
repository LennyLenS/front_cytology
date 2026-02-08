export interface IMedWorkerRes {
  id: string; // UUID в новом API
  fullname: string; // В новом API одно поле fullname
  org?: string; // В новом API org вместо med_organization
  job: string;
  description?: string; // В новом API description вместо expert_details
  // Старые поля для обратной совместимости
  last_name?: string;
  first_name?: string;
  fathers_name?: string;
  med_organization?: string;
  is_remote_worker?: boolean;
  expert_details?: string;
};

export interface IMedWorker {
  id: string | number; // Может быть UUID (string) или number для обратной совместимости
  lastName: string;
  firstName: string;
  fathersName: string;
  medOrganization: string;
  job: string;
  isRemoteWorker: boolean;
  expertDetails: string;
};
