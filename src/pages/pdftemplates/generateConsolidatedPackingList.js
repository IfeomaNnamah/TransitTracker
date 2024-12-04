import html3pdf from 'html3pdf';
import { currentDatetime, formatDateTime } from '../../helpers';

const PdfGenerator = (props) => {
  const {data} = props
  const packages = data?.packages.flat()

  const purchaseOrderItems = packages.map((item) => item.purchaseOrderItemSupplies).flat().map((item) => { 
    if (!item.purchaseOrderItem) return null
    return ({
      purchaseOrderNumber: item.purchaseOrderItem.purchaseOrderNumber,
      materialNumber: item.purchaseOrderItem.materialNumber,
      purchaseOrderItemNumber: item.purchaseOrderItem.purchaseOrderItemNumber,
      materialDescription: item.purchaseOrderItem.materialDescription,
      suppliedQty: item.quantity,
      harmonisedSystemCode: item.harmonisedSystemCode,
      purchaseOrderItemQty: item.purchaseOrderItem.quantity,
      countryOfOrigin: item.countryOfOrigin
    }) 
  }).filter(item => item !== null)

  const generatePdf = () => {
    const pdfContent = document.getElementById('pdf-content');

    html3pdf(pdfContent, {
      margin: 10,
      filename: `${data?.packingListNumber}-${currentDatetime.substring(0, 10)}.pdf`,
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
        <h5 className='text-center'>CONSOLIDATED PACKING LIST</h5>

        <div className='mb-2'>
          <p className='fw-600'>Supplier(s)</p>
          {
            data.supplier?.split(";").map(supplier => {
              return (
                <p>{supplier}</p>
              )
            })
          }
        </div>

        <div className='d-flex mt-2 mb-2' style={{alignItems: "start"}}>
          <div>
            <p>CREATED DATE: <span className='fw-600'>{formatDateTime(data?.createdDate)}</span></p>
            <p className='mt-1'>PACKING LIST NUMBER: <span className='fw-600'>{data?.packingListNumber}</span></p>
            {data.modeOfShipping === "Air" && 
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
        
        <table className='custom-table'  style={{marginTop: "8px"}}>
          <thead>
            <tr>
              <th className='text-center'>PACKAGES</th>
              <th className='text-center'>PO NUMBER</th>
              <th className='text-center'>LENGTH</th>
              <th className='text-center'>WIDTH</th>
              <th className='text-center'>HEIGHT</th>
              <th className='text-center'>CUBIC METER</th>
              <th className='text-center'>GROSS WEIGHT</th>
            </tr>
          </thead>
          <tbody>
            {data.packages?.map((row, index) => (              
              <tr key={index}>
                <td className='text-center w-col7'>Package {index+1}</td>
                <td className='text-center w-col7'>{row?.purchaseOrderItemSupplies[0]?.purchaseOrderItem?.purchaseOrderNumber}</td>
                <td className='text-center w-col7'>{row.length}</td>
                <td className='text-center w-col7'>{row.width}</td>
                <td className='text-center w-col7'>{row.height}</td>
                <td className='text-center w-col7'>{row.cubicMeter}</td>
                <td className='text-center w-col7'>{row.grossWeight}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className='custom-table mt-2'>
          <thead>
            <tr>
              <th className='text-center'>PO NUMBER</th>
              <th className='text-center'>MATERIAL NUMBER</th>
              <th className='text-center'>PO ITEM NUMBER</th>
              <th>MATERIAL DESCRIPTION</th>
              <th className='text-center'>HS CODE</th>
              <th className='text-center'>COUNTRY OF ORIGIN</th>
              {/* SUPPLIED QTY */}
              <th className='text-center'>QUANTITY</th> 
            </tr>
          </thead>
          <tbody>
            {purchaseOrderItems?.sort((a, b) => a.purchaseOrderNumber - b.purchaseOrderNumber)?.map((row, index, arr) => (
                <>
                  <tr key={index}>
                    <td className='text-center'>{row.purchaseOrderNumber}</td>
                    <td className='text-center fw-600'>{row.materialNumber}</td>
                    <td className='text-center'>{row.purchaseOrderItemNumber}</td>
                    <td>{row.materialDescription}</td>
                    <td className='text-center'>{row.harmonisedSystemCode}</td>
                    <td className='text-center'>{row.countryOfOrigin}</td>
                    <td className='text-center'>{row.suppliedQty}</td>
                  </tr>
                  {/* Add a blank row if the next row has a different purchaseOrderNumber */}
                  {index < arr.length - 1 && row.purchaseOrderNumber !== arr[index + 1].purchaseOrderNumber && (
                    <tr key={`blank-${index}`}><td colSpan="9" className='blank-row' style={{height:"8px",backgroundColor:"#e9e9e9"}}></td></tr>
                  )}
                </>
            ))}

            <tr>
              <td colSpan={6} className='fw-600' style={{textAlign: "right", marginRight: "12px"}}>Total PCS</td>
              <td className='text-center fw-600 yellow'>{purchaseOrderItems?.reduce((acc, item) => acc + parseFloat(item.suppliedQty), 0)}</td>
            </tr>
            <tr>
              <td className='no-textwrap'>Country of Supply</td>
              <td className='fw-600' colSpan={7}>{data.countryOfSupply.replaceAll(";", ", ")}</td>
            </tr>
            <tr>
              <td>Mode of Shipping</td>
              <td className='fw-600' colSpan={7}>{data.modeOfShipping}</td>
            </tr>
            <tr>
              <td>Destination</td>
              <td className='fw-600' colSpan={7}>{data.destination}</td>
            </tr>            
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PdfGenerator;
