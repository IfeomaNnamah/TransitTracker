import { useState } from 'react';
import html3pdf from 'html3pdf';
import { currentDatetime, customStyles, formatCurrency, formatDateTime } from '../../helpers';
import loading from "../../assets/images/loading.gif"
import Modal from "react-modal"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PdfGeneratorCommercialInvoice = (props) => {
  const { data, otherData } = props
  const [isLoading] = useState(false)

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
    <div style={{padding: "12px 0", minHeight: "calc(100vh - 160px)"}}>
      {/* Button to generate PDF */}
      <div style={{display: "flex",justifyContent: "end"}}>
        <div className='actions blue' style={{width: "fit-content"}} onClick={generatePdf}>
          <span className="material-symbols-rounded">download</span>
          <span>Download PDF</span>
        </div>
      </div>
      <hr style={{border: "1px solid #e9e9e9", marginTop: "12px"}} />

      {/*  div with content for PDF generation */}
      <div id="pdf-content" className='pdf-content' style={{padding: "0 24px"}}>
        <h5 className='text-center'>COMMERCIAL INVOICE</h5>
        
        <div className='d-flex mt-2' style={{gap: "24px"}}>
          <div>
            <p>ISSUANCE DATE: <span className='fw-600'>{formatDateTime(data?.createdDate)}</span></p>
            <p className='mt-1'>INVOICE NUMBER: <span className='fw-600'>{data?.invoiceNumber}</span></p>
            
            <p style={{marginTop: "18px"}}>SUPPLIER: <span className='fw-600'>{data?.supplier.toUpperCase()}</span></p>
            <p>PICKUP ADDRESS: <span className='fw-600'>{otherData.pickUpAddress}</span></p>
            <p>PURCHASE ORDER NUMBER: <span className='fw-600 text-blue'>{data ? data?.purchaseOrderItemSupplies[0]?.purchaseOrderItem.purchaseOrderNumber : ""}</span></p>         
          </div>

          <div>
            <div className='card'>
              <span className='no-textwrap'>Sold To:</span>
              <p className='fw-600'>{otherData?.soldTo}</p>
            </div>
            <div className='card mt-1'>
              <span className='no-textwrap'>Ship To:</span>
              <p className='fw-600'>{otherData?.shipTo}</p>
            </div>
          </div>
        </div>
        
        <table className='template-form' style={{ tableLayout: 'fixed', width: '100%', borderCollapse: "separate", fontSize: "10px" }}>
          <thead>
            <tr>
              <th className='text-center' style={{ width: '10%' }}>MATERIAL NUMBER</th>
              <th className='text-center' style={{ width: '10%' }}>PO ITEM NO</th>              
              <th style={{ width: '20%' }}>MATERIAL DESCRIPTION</th>
              <th style={{ width: '10%' }}>HS CODE</th>
              <th style={{ width: '10%' }}>SHIPMENT MODE</th>
              <th style={{ width: '10%' }}>COUNTRY OF ORIGIN</th>
              <th className='text-center'style={{ width: '5%' }}>QTY</th>
              <th className='text-center' style={{ width: '10%' }}>UNIT PRICE ({data?.purchaseOrderItemSupplies[0]?.purchaseOrderItem.currency})</th>
              <th className='text-center' style={{ width: '10%' }}>TOTAL ({data?.purchaseOrderItemSupplies[0]?.purchaseOrderItem.currency})</th>
            </tr>
          </thead>
          <tbody>
            {data?.purchaseOrderItemSupplies?.sort((a, b) => a.purchaseOrderItemNumber - b.purchaseOrderItemNumber)?.map((row, index) => (
              <tr 
              className='plain'
              key={index} 
              style={{color: row?.modeOfTransportationChangeStatus?.toLowerCase() === "approved" ? '#929292' : 'black'}}
              title={row?.modeOfTransportationChangeStatus?.toLowerCase() === "approved" ? "This item is approved for Air Freight" : ""}
              >
                <td className='text-center fw-600'>{row.purchaseOrderItem.materialNumber}</td>
                <td className='text-center'>Item {row.purchaseOrderItem.purchaseOrderItemNumber}</td>
                <td>{row.purchaseOrderItem.materialDescription}</td>
                <td>{row.harmonisedSystemCode}</td>
                <td>{row?.modeOfTransportation}</td>
                <td>{row.countryOfOrigin}</td>
                <td className='text-center'>{row.quantity}</td>
                <td className='text-center'>{formatCurrency(row.purchaseOrderItem.unitPrice)}</td>
                <td className='text-center'>{formatCurrency(parseInt(row.quantity)*parseFloat(row.purchaseOrderItem.unitPrice))}</td>
              </tr>
            ))}

            <tr>
              <td colSpan={6}></td>
              <td className='text-center fw-600'>Total</td>
              <td className='text-center fw-600 yellow'>{formatCurrency(data?.purchaseOrderItemSupplies.reduce((acc, item) => acc + parseFloat(item.purchaseOrderItem.unitPrice), 0))}</td>
              <td className='text-center fw-600 yellow'>
                {formatCurrency(data?.purchaseOrderItemSupplies.reduce((acc, item) => {
                    const unitPrice = parseFloat(item.purchaseOrderItem.unitPrice) || 0;
                    const quantity = parseFloat(item.quantity) || 0;
                    return acc + (unitPrice * quantity);
                }, 0))}</td>
            </tr>

            <tr>
              <td colSpan={9} style={{padding: "2px 0", backgroundColor: "white"}}></td>
            </tr>

            <tr>
              <td colSpan={2}>Country of Supply</td>
              <td colSpan={7}>{data?.countryOfSupply}</td>
            </tr>
            <tr>
              <td colSpan={2}>Destination</td>
              <td colSpan={7}>{data?.destination}</td>
            </tr>            
          </tbody>
        </table>
        <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
            <div className="loader">
                <img src={loading} alt="loading" />
                <p>Loading data...</p>
            </div>
        </Modal> 
        <ToastContainer />
      </div>
    </div>
  );
};

export default PdfGeneratorCommercialInvoice;
