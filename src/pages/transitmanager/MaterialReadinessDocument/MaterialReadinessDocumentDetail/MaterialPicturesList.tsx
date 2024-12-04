import { customStyles, formatDateTime, getStatusAndColorForMRDUploads, handleDownloadForPOItemSupplyAttachment, handlePreviewForPoItemSupply } from "helpers";
import loading from "../../../../assets/images/loading.gif"
import Modal from "react-modal"
import { useState } from "react";

const MaterialPicturesList = (props: any) => {
    const { purchaseOrderItems } = props
    const [isLoading, setIsLoading] = useState(false)
    // const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [viewUploadsModal, setViewUploadsModal] = useState(false)
    const [purchaseOrderItemSuppliesId, setPurchaseOrderItemSuppliesId] = useState("")
    const [selectedItemMaterialPictures, setSelectedItemMaterialPictures] = useState<Record <string, any>>([])

    const handleDownloadClick = async (documentBlobStorageName: any, documentName: string, purchaseOrderItemSuppliesId: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handleDownloadForPOItemSupplyAttachment(
          documentBlobStorageName,
          documentName,
          purchaseOrderItemSuppliesId
        )
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };

    const handlePreviewClick = async (documentName: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);

        // Call the function to handle the document download
        const result = await handlePreviewForPoItemSupply(
            documentName,
            purchaseOrderItemSuppliesId
        )

        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };

    return (
        <div className="mt-1">
            <div className='table-container custom' style={{minHeight: "300px"}}>
                <table>
                    <thead>
                        <tr className="no-textwrap">
                            <th>SN</th>
                            <th>Item No</th>
                            <th>Material No</th>
                            <th>Material Description</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            purchaseOrderItems?.map((data: any, index :number) => {
                                return (
                                    <tr key={index}>
                                        <td>{ index+1 }</td>
                                        <td>Item { data.purchaseOrderItem.purchaseOrderItemNumber }</td>
                                        <td>{ data.purchaseOrderItem.materialNumber }</td>
                                        <td>{ data.purchaseOrderItem.materialDescription }</td>
                                        <td>{ data.quantity }</td>
                                        <td>
                                            {data.purchaseOrderItemSupplyAttachments.every((attachment: any) => attachment.status === true) ? (
                                                <span className="status green">All Approved</span>
                                            ) : data.purchaseOrderItemSupplyAttachments.every((attachment: any) => attachment.status === false) ? (
                                                <span className="status red">All Rejected</span>
                                            ) : data.purchaseOrderItemSupplyAttachments.some((attachment: any) => attachment.status === true || attachment.status === false) ? (
                                                <span className="status blue">Some Awaiting Approval</span>
                                            ) : (
                                                <span className="status yellow">All Awaiting Approval</span>
                                            )}
                                        </td> 
                                        <td>
                                            <button className="actions blue" onClick={() => {setViewUploadsModal(true); setSelectedItemMaterialPictures(data.purchaseOrderItemSupplyAttachments); setPurchaseOrderItemSuppliesId(data.id)}}>
                                                <span className="material-symbols-rounded" style={{fontSize:"18px"}}>visibility</span>
                                                <span>{data.purchaseOrderItemSupplyAttachments.length} File{data.purchaseOrderItemSupplyAttachments.length > 1 ? "s" : ""}</span>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                {false ? <div className="loader">
                            <img src={loading} alt="loading" />
                            <p>Loading data...</p>
                        </div> : null}
            </div>
            <Modal isOpen={viewUploadsModal} style={customStyles} className="modal modal-8" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Attached Files</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => setViewUploadsModal(false)}>close</span>
                </div>
                <div className="modal-body table-container custom" style={{minHeight: "320px"}}>
                    <table>
                        <thead>
                            <tr className="no-textwrap">
                                <th style={{borderTop: "none"}}>SN</th>
                                <th style={{borderTop: "none"}}>File Type</th>
                                {/* <th style={{borderTop: "none"}}>File Format</th> */}
                                <th style={{borderTop: "none"}}>Date Uploaded</th>
                                <th style={{borderTop: "none"}}>Approval Status</th>
                                <th style={{borderTop: "none"}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                selectedItemMaterialPictures.map((attachment: any, index: number) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index+1}</td>
                                            <td>{attachment.documentName.replaceAll("_"," ")}</td>
                                            <td>{formatDateTime(attachment.createdDate)}</td>
                                            <td>
                                                <span className={`status ${getStatusAndColorForMRDUploads(attachment.status).color}`}>{`${getStatusAndColorForMRDUploads(attachment.status).statusText}`}</span>
                                            </td>
                                            <td className="d-flex">                                                
                                                <button className="actions blue" onClick={() => handleDownloadClick(attachment.documentBlobStorageName,attachment.documentName, purchaseOrderItemSuppliesId)}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                                </button>
                                                {attachment.documentBlobStorageName.split(".")[1] === "pdf" &&<button className='actions blue mr-1'
                                                    onClick={() => handlePreviewClick(attachment.documentName)}>
                                                        <span className="material-symbols-rounded">preview</span>
                                                        <span>Preview</span>
                                                </button>}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            
                        </tbody>
                    </table>
                </div>
            </Modal>
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
        </div>
    )
}

export default MaterialPicturesList