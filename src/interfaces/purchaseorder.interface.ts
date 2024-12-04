export interface PurchaseOrderInfo {
    "id": string,
    "purchaseOrderNumber": string,
    "supplierAddress": string,
    "supplierPhoneNumber": string,
    "supplierName": string,
    "supplierEmail": string,
    "finalShippingAddress": string,
    "supplierReference": string,
    "buyerReference": string,
    "buyerName": string,
    "buyerEmail": string,
    "amount": string,
    "totalAmountTaxes": string,
    "totalNetAmountOfOrder": string,
    "totalAmountOfOrder": string,
    "purchaseOrderItems": POLineItems[],
    "createdDate": string,
    "purchaseOrderStatus": number,
    "currency": string,
    "freightForwarderAssignmentDate": string,
    "freightForwarder": any
    "freightForwarderId": string
}

export interface POLineItems {
    "id": string,
    "purchaseOrderId": string,
    "purchaseOrderNumber": string,
    "purchaseOrderItemNumber": string,
    "materialDescription": string,
    "harmonisedSystemCode": string,
    "materialNumber": string,
    "deliveryDate": string,
    "quantity": string,
    "unit": string,
    "unitPrice": string,
    "netAmount": string,
    "manufacturerPartNumber": string,
    "manufacturer": string,
    "status": string,
    "packageId": string,
    "commercialInvoiceId": string,
    "currency": string,
    "purchaseOrderItemSupplies": any,
    "isChecked": boolean,
    "itemSuppliedId": string,
    "modeOfTransportationId": string,
    "modeOfTransportation": string,
    "freightForwarderId": string
}

export interface SelectedPOLineItems {
    "id": string,
    "purchaseOrderItemNumber": number,
    "purchaseOrderId": string,
    "purchaseOrderNumber": string,
    "materialNumber": string,
    "materialDescription": string,
    "harmonisedSystemCode": string,
    "quantity": string,
    "unitPrice": string,
    "total": string,
    "purchaseOrderItemSupplies": any,
    "countryOfOrigin": string,
    "currency": string,
    "requestedQuantity": string,
    "isChecked": boolean,
    "modeOfTransportation": string,
    "outstandingQuantity"?: number
}

export interface SelectedPOLineItemsWithIdAndQty {
    "id": string,
    "purchaseOrderItemNumber": number,
    "purchaseOrderId": string,
    "purchaseOrderNumber": string,
    "materialNumber": string,
    "materialDescription": string,
    "harmonisedSystemCode": string,
    "quantity": string,
    "unitPrice": string,
    "total": string,
    "itemSupplyId": string,
    "suppliedQuantity": string
}

export interface SelectedPurchaseOrders {
    "purchaseOrderId": string,
    "purchaseOrderNumber": string,
    "purchaseOrderItems": POLineItems[],
    "finalShippingAddress": string,
    "buyerName": string,
    "createdDate": string,
}

export interface StatusProp {
    "name": string,
    "value": string | number,
}

export interface ApprovalProp {
    "name": string,
    "level": string,
}