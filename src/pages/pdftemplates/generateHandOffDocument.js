// import React, { useState } from 'react';
import html3pdf from 'html3pdf';
import { currentDatetime, formatDateTime } from '../../helpers';
import logo from '../../assets/images/logo-1.png'

const PdfGenerator = (props) => {
  const {referenceNumber, localClearingAgent, shippingDocument} = props
  
  const packingList = shippingDocument?.consolidatedPackingList?.packages?.map((data) => { 
    return data.purchaseOrderItemSupplies.map((item) => {
      return ({
        purchaseOrderItemSuppliesId: item.id,
        supplier: data.user?.companyName
      })
    })    
  }).flat()
  // console.log(packingList.flat())
  const purchaseOrderItems = shippingDocument?.consolidatedCommercialInvoice?.purchaseOrderItemSupplies?.map((item) => { return ({
    item: item.purchaseOrderItem,
    suppliedQty: item.quantity,
    purchaseOrderItemQty: item.purchaseOrderItem.quantity,
    purchaseOrderNumber: item.purchaseOrderItem.purchaseOrderNumber,
    harmonisedSystemCode: item.harmonisedSystemCode,
    countryOfOrigin: item.countryOfOrigin,
    currency: item.currency,
    supplier: packingList.find((data) => data.purchaseOrderItemSuppliesId === item.id)?.supplier
  }) })

  const generatePdf = () => {
    const pdfContent = document.getElementById('pdf-content');

    html3pdf(pdfContent, {
      margin: 10,
      filename: `HandOffDocument-${referenceNumber ? referenceNumber : ""}-${currentDatetime.substring(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html3canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    });
  };

  return (
    <div style={{padding: "16px 0"}}>
      {/* Button to generate PDF */}
      <div className='actions blue' style={{marginLeft: "16px", width: "fit-content"}} onClick={generatePdf}>
        <span className="material-symbols-rounded">download</span>
        <span>Download PDF</span>
      </div>
      <hr style={{border: "1px solid #e9e9e9", marginTop: "16px"}} />

      {/*  div with content for PDF generation */}
      <div id="pdf-content" className='pdf-content' style={{padding: "0 24px"}}>
        <img src={logo} alt='' width="80px" />
        <h6 className='m-0'>Total E & P Nigeria Limited</h6>
        <h6 className='m-0'>Procurement & Contracts Department</h6>

        <h5 className='text-center' style={{textDecoration:"underline"}}>MATERIAL DELIVERY WAYBILL</h5>
        <div className='d-flex' style={{alignItems: "start", fontWeight: "500 !important"}}>
          <div>
            <h6 className='m-0 fw-500'>VESSEL: <strong>{shippingDocument?.vesselName}</strong></h6>
            <h6 className='m-0 mt-1 fw-500'>CONTAINERS: <strong>{shippingDocument?.containerDescription}</strong></h6>
            <h6 className='m-0 mt-1 fw-500'>B/L: <strong>{referenceNumber ? referenceNumber : ""}</strong></h6>
          </div>
          <div>
            <h6 className='m-0 mt-1 fw-500'>DATE OF RECEIPT: <strong>{formatDateTime(shippingDocument?.dateOfReceipt)?.substring(0, 10)} </strong></h6>
            <h6 className='m-0 mt-1 fw-500'>DATE OF TRANSFER TO RECEPTION: <strong>{formatDateTime(shippingDocument?.dateOfTransferToReception)?.substring(0, 10)} </strong></h6>
            <p className='m-0 mt-1 fw-500 uppercase'>CLEARING AGENT: <strong>{localClearingAgent ? localClearingAgent?.firstName : null} {localClearingAgent ? localClearingAgent?.lastName : null}</strong></p>
            <h6 className='m-0 mt-1 fw-500'>CLEARING AGENT WAYBILL NUMBER: <strong>{shippingDocument?.clearingAgentWaybillNumber}</strong></h6>            
          </div>
        </div>
        
        <table className='custom-table mt-2'>
          <thead>
            <tr>
              <th className='text-center'>PO NUMBER</th>
              <th className='text-center'>MATERIAL NUMBER</th>
              <th className='text-center'>PO ITEM N<sup>0</sup></th>
              <th>MATERIAL DESCRIPTION</th>
              {/* <th>PROJECT</th> */}
              <th className='text-center'>QTY</th>
              <th>SUPPLIER</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrderItems?.sort((a, b) => a.purchaseOrderNumber - b.purchaseOrderNumber)?.map((row, index, arr) => (
              <>
              <tr key={index}>
                <td className='text-center'>{row.item.purchaseOrderNumber}</td>
                <td className='text-center'>{row.item.materialNumber}</td>
                <td className='text-center'>Item {row.item.purchaseOrderItemNumber}</td>
                <td>{row.item.materialDescription}</td>
                {/* <td></td> */}
                <td className='text-center'>{row.suppliedQty}</td>
                <td>{row.supplier}</td>
              </tr>
              {/* Add a blank row if the next row has a different purchaseOrderNumber */}
                {index < arr.length - 1 && row.item.purchaseOrderNumber !== arr[index + 1].item.purchaseOrderNumber && (
                  <tr key={`blank-${index}`}><td colSpan="9" className='blank-row' style={{height:"8px",backgroundColor:"#e9e9e9"}}></td></tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {/* <h6 className='m-0 mt-2'>DELIVERED BY: </h6> */}
        <h6 className='m-0 mt-2'>RECIEVED BY (NAME & SIGNATURE): </h6>
      </div>
    </div>
  );
};

export default PdfGenerator;
