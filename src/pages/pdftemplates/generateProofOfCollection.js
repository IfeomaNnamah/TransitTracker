import html3pdf from 'html3pdf';
import { formatDateTime } from '../../helpers';

const PdfGenerator = (props) => {
  const { proofOfCollection, selectedPackingListPackages } = props

  const packageAttachments = selectedPackingListPackages?.packages ? selectedPackingListPackages?.packages[0]?.packageAttachments : []
  const purchaseOrderItemSupplies = selectedPackingListPackages?.packages?.flatMap((item) => item.purchaseOrderItemSupplies)
  const purchaseOrderItemAtatchments = purchaseOrderItemSupplies?.map((record) => ({
    purchaseOrderItemNumber: record.purchaseOrderItem.purchaseOrderItemNumber,
    documentName: record.purchaseOrderItemSupplyAttachments?.map((attachment) => attachment.documentName.replaceAll("_", " ")).join(", "),
  })) 

  const columnStyle = (alignment) => {
    return {
      padding: "0",
      backgroundColor: "transparent",
      width: "100%",
      textAlign: alignment
    }
  }
  const generatePdf = () => {
    const pdfContent = document.getElementById('pdf-content');
    const purchaseOrderNumber = selectedPackingListPackages?.packages[0]?.purchaseOrderItemSupplies[0]?.purchaseOrderItem?.purchaseOrderNumber
    const packingListTrailingNumber = selectedPackingListPackages?.packingListNumber
    html3pdf(pdfContent, {
      margin: 10,
      filename: `PO-${purchaseOrderNumber}-${packingListTrailingNumber?.split("-")?.pop()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html3canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    });
  };

  return (
    <div style={{padding: "16px 0px"}}>
      {/* Button to generate PDF */}
      <div style={{display: "flex",justifyContent: "end", margin: "0 16px"}}>
        <div className='actions blue' style={{width: "fit-content"}} onClick={generatePdf}>
          <span className="material-symbols-rounded">download</span>
          <span>Download PDF</span>
        </div>
      </div>
      <hr style={{border: ".4px solid #e9e9e9", marginTop: "16px"}} />

      {/*  div with content for PDF generation */}
      <div id="pdf-content" className='pdf-content' style={{padding: "0 24px"}}>
        <div className='mb-2'>
          <p style={{margin: "16px 0 6px 0"}} className='fw-600'>{proofOfCollection?.freightForwarderCompanyName}</p>
          <p style={{width: "200px", margin: "0"}}>{proofOfCollection?.freightForwarderAddress}</p>            
        </div>
        <h4 className='text-center' style={{color: "#002d7c"}}>PROOF OF COLLECTION</h4>

        <div className='d-flex mt-2 mb-2' style={{alignItems: "start"}}>
          <div>
            <p className='mt-1'>Proof of Collection Number: <span className='fw-600 text-blue'>{ proofOfCollection?.pocNumber }</span></p>
            <p className='mt-1'>Material Readiness Document Number: <span className='fw-600'>{proofOfCollection?.materialReadinessDocuments ? proofOfCollection?.materialReadinessDocuments[0]?.mrdNumber : null}</span></p>
            <p className='mt-1'>Pick Up Date: <span className='fw-600'>{formatDateTime(proofOfCollection?.pickUpDate).substring(0, 10)}</span></p>
            <p>Created Date: <span className='fw-600'>{formatDateTime(proofOfCollection?.createdDate)}</span></p>
          </div>

          <div style={{textAlign: "right"}}>
          <p className='mt-1'>Freight Forwarder Reference: <span className='fw-600'>{ proofOfCollection?.freightForwarderReference?.toUpperCase() }</span></p>
            <p>Client: <span className='fw-600'>{ proofOfCollection?.clientName }</span></p>
            <p>Country of Supply: <span className='fw-600'>{ proofOfCollection.materialReadinessDocuments ? proofOfCollection.materialReadinessDocuments[0].countryOfSupply : null }</span></p>
          </div>
        </div>

        <table className='custom-table custom' style={{tableLayout: 'fixed', width: '100%',}}>
          <thead>
            <tr>
              <th className='text-center' style={{ width: '33.30%' }}>PO Number</th>
              <th className='text-center' style={{ width: '33.30%' }}>PO Line Items</th>
              <th className='text-center' style={{ width: '33.30%' }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr className='plain'>
              <td className='text-center'>{selectedPackingListPackages.packages ? selectedPackingListPackages?.packages[0]?.purchaseOrderItemSupplies[0]?.purchaseOrderItem?.purchaseOrderNumber : ""}</td>
              <td className='text-center'>
                {purchaseOrderItemSupplies 
                  ? purchaseOrderItemSupplies
                      .sort((a, b) => a.purchaseOrderItem?.purchaseOrderItemNumber - b.purchaseOrderItem?.purchaseOrderItemNumber) // Correct sorting
                      //unque values
                      .filter((item, index, array) => array.findIndex((item2) => item2.purchaseOrderItem?.purchaseOrderItemNumber === item.purchaseOrderItem?.purchaseOrderItemNumber) === index)
                      .map((item) => `Item ${item.purchaseOrderItem?.purchaseOrderItemNumber}`) // Mapping after sorting
                      .join(", ") 
                  : ""}
              </td>
              <td className='text-center'>{selectedPackingListPackages?.packages
                      ?.flatMap(item => item.purchaseOrderItemSupplies)
                      ?.map(item => item.quantity)
                      .reduce((acc, item) => acc + Number(item), 0)}</td>
            </tr>
          </tbody>
        </table>

        <table className='custom-table custom mt-2' style={{tableLayout: 'fixed', width: '100%',}}>
          <thead>
            <tr>
              <th className='text-center' style={{ width: '10%' }}>Package Number</th>
              <th className='text-center' style={{ width: '10%' }}>Dimensions (LxWxH)</th>
              <th className='text-center' style={{ width: '10%' }}>Cubic Meter (M<sup>3</sup>)</th>
              <th className='text-center' style={{ width: '10%' }}>Gross Weight (Kg)</th>
              {/* <th className='text-center' style={{ width: '10%' }}>PO Number</th> */}              
              <th className='text-center' style={{ width: '10%' }}>PO Item Number</th>
              <th className='text-center' style={{ width: '10%' }}>Material Number</th>
              <th style={{ width: '20%', padding: "8px 6px" }}>Material Description</th>
              {/* <th className='text-center' style={{ width: '10%' }}>Shipment Mode</th>
              <th className='text-center' style={{ width: '10%' }}>HS Code</th> */}
              <th style={{ width: '10%', padding: "8px 6px" }}>Country Of Origin</th>
              <th className='text-center' style={{ width: '5%' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {
              selectedPackingListPackages?.packages
              ?.map((pck, index) => {
                return (
                    <tr className='plain' key={index}>
                      <td className='text-center'>Package {index + 1}</td>
                      <td className='text-center'>{pck.length} x {pck.width} x {pck.height}cm</td>
                      <td className='text-center'>{pck.cubicMeter}</td>
                      <td className='text-center'>{pck.grossWeight}</td>

                      {/* Purchase Order Number Column */}
                      {/* <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          {item.purchaseOrderItem.purchaseOrderNumber}
                                      </div>
                                  ))}
                          </div>
                      </td>                     */}
                      {/* Item Number Column */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          Item {item.purchaseOrderItem.purchaseOrderItemNumber}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Supplier Material Column */}
                      <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          {item.purchaseOrderItem.materialNumber}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Material Desc Column */}
                      <td style={columnStyle("left")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          {item.purchaseOrderItem.materialDescription}
                                      </div>
                                  ))}
                          </div>
                      </td>
                      {/* Mode of Shipping */}
                      {/* <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          {item.modeOfTransportationChangeStatus?.toLowerCase() === "approved" ? "Air": "Sea"}
                                      </div>
                                  ))}
                          </div>
                      </td> */}
                      {/* HS Code Column */}
                      {/* <td style={columnStyle("center")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          {item.harmonisedSystemCode}
                                      </div>
                                  ))}
                          </div>
                      </td> */}
                      {/* Country of Origin Column */}
                      <td style={columnStyle("left")}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {pck.purchaseOrderItemSupplies
                                  .map((item, idx) => (
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
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
                                      <div key={idx} style={{padding: "5px", borderBottom: (pck?.purchaseOrderItemSupplies?.length > 1 && idx !== pck?.purchaseOrderItemSupplies?.length - 1) ? "1px solid #d1d1d1" : "none"}}>
                                          {item.quantity}
                                      </div>
                                  ))}
                          </div>
                      </td>
                    </tr> 
                  )
              })
            }
            {/* <tr>
              <td colSpan={10}></td>
              <td className='fw-600'>Total PCS</td>
              <td className='text-center yellow'>{selectedPackingListPackages?.packages
                                ?.flatMap(item => item.purchaseOrderItemSupplies)
                                ?.map(item => item.quantity)
                                .reduce((acc, item) => acc + Number(item), 0)}</td>
              
            </tr>      */}
          </tbody>
        </table>
        <div className='d-flex' style={{alignItems: "start", marginTop: "12px"}}>
          <div style={{flex:"1 100%"}}>
            {
              packageAttachments?.map((attachment, index) => {
                return (
                  <p key={index} className='d-flex-2' style={{margin: "0"}}>
                    <span className='material-symbols-rounded text-green mr-2'>check</span>
                    <span>{attachment.documentName.replaceAll("_", " ")} ({formatDateTime(attachment.createdDate)})</span>
                  </p>
                )
            })} 
          </div>
          <div style={{flex:"1 100%"}}>
            {
              purchaseOrderItemAtatchments?.map((attachment, index) => {
                return (
                  <p key={index} className='d-flex-2' style={{margin: "0"}}>
                    <span className='material-symbols-rounded text-green mr-2'>check</span>
                    <span>Item {attachment.purchaseOrderItemNumber}: {attachment.documentName}</span>
                  </p>
                )
            })} 
          </div>
        </div>     

        {proofOfCollection?.supplierApproval === "APPROVED" && 
        <div className='mt-2'>
          <p>ACKNOWLEDGED BY:</p>
          <p className='fw-600 blue-text'>SUPPLIER ({proofOfCollection?.supplier.companyName})</p>
          {proofOfCollection?.transitOfficerAcknowledgement === "ACKNOWLEDGED" && <p className='fw-600 blue-text mt-1'>TRANSIT TEAM</p>}
        </div>
        } 
      </div>
    </div>
  );
};

export default PdfGenerator;
