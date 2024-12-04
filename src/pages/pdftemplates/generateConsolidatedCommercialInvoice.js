// import React, { useState } from 'react';
import html3pdf from 'html3pdf';
import { currentDatetime, formatCurrency, formatDateTime } from '../../helpers';

const PdfGenerator = (props) => {
  const {data} = props
  const purchaseOrderItems = data?.purchaseOrderItemSupplies?.map((item) => { return ({
    item: item.purchaseOrderItem,
    suppliedQty: item.quantity,
    purchaseOrderItemQty: item.purchaseOrderItem.quantity,
    purchaseOrderNumber: item.purchaseOrderItem.purchaseOrderNumber,
    harmonisedSystemCode: item.harmonisedSystemCode,
    countryOfOrigin: item.countryOfOrigin,
    currency: item.currency
  }) })

  const generatePdf = () => {
    const pdfContent = document.getElementById('pdf-content');

    html3pdf(pdfContent, {
      margin: 10,
      filename: `${data?.invoiceNumber}-${currentDatetime.substring(0, 10)}.pdf`,
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
        <h5 className='text-center'>CONSOLIDATED COMMERCIAL INVOICE</h5>

        <div>
          <p className='fw-600'>Supplier(s)</p>
          {
            data?.supplier?.split(";").map(supplier => {
              return (
                <p>{supplier}</p>
              )
            })
          }
        </div>

        <div className='d-flex mt-2 mb-2' style={{alignItems: "start"}}>
          <div>
            <p>CREATED DATE: <span className='fw-600'>{formatDateTime(data?.createdDate)}</span></p>
            <p className='mt-1'>INVOICE NUMBER: <span className='fw-600'>{data?.invoiceNumber}</span></p>
            {data.modeOfShipping === "AIR" && 
              <>
                <p className='mt-1'>Form M: <span className='fw-600'>{data?.formM}</span></p>
                <p className='mt-1'>BA Number: <span className='fw-600'>{data?.baNumber}</span></p>
              </>}
          </div>
          <div>
            <div className='card'>
              <span>Sold To:</span>
              <p className='fw-600'>{data?.soldTo}</p>
            </div>
            <div className='card mt-1'>
              <span>Ship To:</span>
              <p className='fw-600'>{data?.shipTo}</p>
            </div>
          </div>
        </div>
        
        <table className='custom-table'>
          <thead>
            <tr>
              <th className='text-center'>PO NUMBER</th>
              <th className='text-center'>MATERIAL NUMBER</th>
              <th className='text-center'>PO ITEM N<sup>0</sup></th>
              <th>MATERIAL DESCRIPTION</th>
              <th>HS CODE</th>
              <th>COUNTRY OF ORIGIN</th>
              <th className='text-center'>QTY</th>
              <th className='text-center'>UNIT PRICE ({purchaseOrderItems ? purchaseOrderItems[0]?.currency : null})</th>
              <th className='text-center'>TOTAL ({purchaseOrderItems ? purchaseOrderItems[0]?.currency : null})</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrderItems?.sort((a, b) => a.purchaseOrderNumber - b.purchaseOrderNumber)?.map((row, index, arr) => (
              <>
              <tr key={index}>
                <td className='text-center'>{row.item.purchaseOrderNumber}</td>
                <td className='text-center fw-600'>{row.item.materialNumber}</td>
                <td className='text-center'>{row.item.purchaseOrderItemNumber}</td>
                <td>{row.item.materialDescription}</td>
                <td>{row.harmonisedSystemCode}</td>
                <td>{row.countryOfOrigin}</td>
                <td className='text-center'>{row.suppliedQty}</td>
                <td className='text-center'>{formatCurrency(row.item.unitPrice)}</td>
                <td className='text-center'>{formatCurrency(parseInt(row.item.quantity)*parseFloat(row.item.unitPrice))}</td>
              </tr>
              {/* Add a blank row if the next row has a different purchaseOrderNumber */}
                {index < arr.length - 1 && row.item.purchaseOrderNumber !== arr[index + 1].item.purchaseOrderNumber && (
                  <tr key={`blank-${index}`}><td colSpan="9" className='blank-row' style={{height:"8px",backgroundColor:"#e9e9e9"}}></td></tr>
                )}
              </>
            ))}

            <tr>
              <td colSpan={6}></td>
              <td className='text-center fw-600'>Total</td>
              <td className='text-center fw-600 yellow'>{formatCurrency(data.totalUnitPrice)}</td>
              <td className='text-center fw-600 yellow'>{formatCurrency(data.sumTotal)}</td>
            </tr>

            <tr>
              <td colSpan={9} style={{padding: "8px 0"}}></td>
            </tr>
            <tr>
              <td className='no-textwrap'>Country of Supply</td>
              <td className='fw-600' colSpan={9}>{data.countryOfSupply.replaceAll(";", ", ")}</td>
            </tr>
            <tr>
              <td>Mode of Shipping</td>
              <td className='fw-600' colSpan={9}>{data.modeOfShipping}</td>
            </tr>
            <tr>
              <td>Destination</td>
              <td className='fw-600' colSpan={9}>{data.destination}</td>
            </tr>            
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PdfGenerator;
