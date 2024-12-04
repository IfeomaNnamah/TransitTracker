import { useState, } from 'react';
import html3pdf from 'html3pdf';
import { currentDatetime, customStyles, formatDateTime} from '../../helpers';
import loading from "../../assets/images/loading.gif"
import Modal from "react-modal"
// import { makeGetRequest, makePatchRequest } from "../../request";
// import { useParams } from "react-router-dom";
import { ToastContainer,  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { useSelector } from 'react-redux';
// import { useNavigate } from "react-router-dom";

const PdfGeneratorPackingList = (props) => {
  const { data, otherData } = props
  const packageInformation = data.packages[0]
  const listOfPackages = data.packages
  const [isLoading,] = useState(false)
  
  const generatePdf = () => {
    const pdfContent = document.getElementById('pdf-content');

    html3pdf(pdfContent, {
      margin: 10,
      filename: `${data?.packingListNumber}-${currentDatetime.substring(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html3canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    });
  };

  const columnStyle = (alignment) => {
    return {
      padding: 0,
      backgroundColor: "transparent",
      width: "100%",
      verticalAlign: "top",
      textAlign: alignment
    }
  }

  const customColumnStyle = (modeOfTransportationChangeStatus) => {
    
    return {
      padding: "5px", 
      minHeight: "35px", 
      backgroundColor: "#F5F5F5",
      color: modeOfTransportationChangeStatus?.toLowerCase() === "approved" ? "#929292" : "black",
    }
  }

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
        <h5 className='text-center'>PACKING LIST</h5>
        <div className='d-flex mt-2' style={{gap: "24px"}}>
          <div>
            <p>ISSUANCE DATE: <span className='fw-600'>{formatDateTime(data?.createdDate)}</span></p>
            <p className='mt-1'>PACKING LIST NUMBER: <span className='fw-600'>{data?.packingListNumber}</span></p>

            <p style={{marginTop: "18px"}}>SUPPLIER: <span className='fw-600'>{data?.supplier.toUpperCase()}</span></p>
            <p>PICKUP ADDRESS: <span className='fw-600'>{otherData?.pickUpAddress}</span></p>
            <p>PURCHASE ORDER NUMBER: <span className='fw-600 text-blue'>{packageInformation ? packageInformation.purchaseOrderItemSupplies[0]?.purchaseOrderItem.purchaseOrderNumber : ""}</span></p>
            
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
        
        <table className='template-form f-10' style={{tableLayout: 'fixed', width: '100%', borderCollapse: "separate" }}>
          <thead>
            <tr>
              <th className='text-center' style={{ width: '10%' }}>PACKAGE NUMBER</th>
              <th className='text-center' style={{ width: '10%' }}>DIMENSIONS (LxWxH)</th>
              <th className='text-center' style={{ width: '10%' }}>CUBIC METER (M<sup>3</sup>)</th>
              <th className='text-center' style={{ width: '10%' }}>GROSS WEIGHT (KG)</th>
              <th className='text-center' style={{ width: '10%' }}>MATERIAL NUMBER</th>              
              <th className='text-center' style={{ width: '10%' }}>ITEM NUMBER</th>
              <th style={{ width: '20%' }}>MATERIAL DESCRIPTION</th>     
              <th className='text-center' style={{ width: '10%' }}>SHIPMENT MODE</th>        
              <th className='text-center' style={{ width: '10%' }}>HS CODE</th>
              <th style={{ width: '10%' }}>COUNTRY OF ORIGIN</th>
              <th className='text-center' style={{ width: '5%' }}>QTY</th>
            </tr>
          </thead>
          <tbody>
            {
              listOfPackages?.map((pck, index) => {
                return (
                    <tr className='plain'>
                      <td className='text-center'>Package {index + 1}</td>
                      <td className='text-center'>{pck.length} x {pck.width} x {pck.height}cm</td>
                      <td className='text-center'>{pck.cubicMeter}</td>
                      <td className='text-center'>{pck.grossWeight}</td>
                      {/* Supplier Material Column */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          {item.purchaseOrderItem.materialNumber}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Item Number Column */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          Item {item.purchaseOrderItem.purchaseOrderItemNumber}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Material Desc Column */}
                      <td style={columnStyle("left")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          {item.purchaseOrderItem.materialDescription}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Mode of Shipping */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          {item?.modeOfTransportationChangeStatus?.toLowerCase() === "approved" ? "Air": "Sea"}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* HS Code Column */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          {item.harmonisedSystemCode}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Country of Origin Column */}
                      <td style={columnStyle("left")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          {item.countryOfOrigin}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Quantity Column */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={customColumnStyle(item?.modeOfTransportationChangeStatus)}>
                                          {item.quantity}
                                      </div>
                                  ))}
                          </div>
                      </td>
                    </tr> 
                  )
              })
            }
            <tr>
              <td colSpan={9}></td>
              <td className='fw-600'>Total PCS</td>
              <td className='text-center yellow'>{listOfPackages
                                ?.map(item => item.purchaseOrderItemSupplies)
                                ?.flat()
                                ?.map(item => item.quantity)
                                .reduce((acc, item) => acc + Number(item), 0)}</td>
              
            </tr>
            <tr>
              <td colSpan={9} style={{padding: "2px 0", backgroundColor: "white"}}></td>
            </tr>

            <tr>
              <td colSpan={2}>Country of Supply</td>
              <td colSpan={9}>{data?.countryOfSupply}</td>
            </tr>
            <tr>
              <td colSpan={2}>Destination</td>
              <td colSpan={9}>{data?.destination}</td>
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

export default PdfGeneratorPackingList;
