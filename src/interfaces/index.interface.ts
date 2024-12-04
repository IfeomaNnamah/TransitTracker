import { ReactNode } from "react";

export interface Request {
    id: number,
    params: any,
    what:string,
    data:object
}

export interface Users {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    category: string,
    department: string,
    companyName: string,
    isEnabled: boolean,
    user: any,
    roles: any,
    permissions: any
}

export interface Permissions {
    id: string,
    name: string
}

export interface Roles {
    id: string,
    name: string,
}

export interface ObjectType {
    [key: string]: string;
}

export interface Config {
    headers: object,
    withCredentials: boolean
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    handlePrevious: () => void;
    handleNext: () => void;
    setCurrentPage: (page: number) => void;
    getPageNumbers: () => number[];
    setItemsPerPage: (itemsPerPage: number) => void;
}

export interface ProofOfCollectionInfo {
    id: string,
    pocNumber: string,
    createdDate: string,
    numberOfPackage: string,
    pickUpDate: string,
    materialReadinessDocuments: any,
    supplierApproval: string,
    supplierComment: string,
    supplier: any,
    freightForwarderCompanyName: string,
    proofOfCollection: any
}

export type ReactProps = {
    children: ReactNode;
    title: string
}

export type PageProps = {
    page: string,
}


export type SelectedShippingDocuments = {
    "id": string,
    "shipmentNumber": string,
    "referenceNumber": string,
    "modeOfShipping": string,
    "destination": string,
    "createdDate": string,
}