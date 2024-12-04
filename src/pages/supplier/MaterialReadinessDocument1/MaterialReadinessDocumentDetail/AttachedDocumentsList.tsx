import { customStyles, formatDateTime, getStatusAndColorForMRDUploads, handleDownloadForPackageAttachment, handlePreviewForPackageAttachment } from "helpers";
import loading from "../../../../assets/images/loading.gif"
import Modal from "react-modal"
import { useState } from "react";

const AttachedDocumentsList = (props: any) => {
    const { packageAttachments } = props
    const [isLoading, setIsLoading] = useState(false)
    // const accessToken:any = useSelector((state: any) => state.accessToken.value);

    const handleDownloadClick = async (packageId: any, documentBlobStorageName: string, documentName: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handleDownloadForPackageAttachment(packageId, documentBlobStorageName, documentName)
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };

    const handlePreviewClick = async (packageId: string, documentName: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handlePreviewForPackageAttachment(packageId, documentName)
    
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
                            <th>Attachment Type</th>
                            <th>Date Uploaded</th>
                            <th>Approval Status</th>
                            <th style={{width: "200px"}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            packageAttachments?.map((attachment: any, index :number) => {
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{attachment.documentName.replaceAll("_"," ")}</td>
                                        <td>{formatDateTime(attachment.createdDate)}</td>
                                        <td>
                                            <span className={`status ${getStatusAndColorForMRDUploads(attachment.status).color}`}>{`${getStatusAndColorForMRDUploads(attachment.status).statusText}`}</span>
                                        </td>
                                        <td style={{display:"flex", gap: "24px"}}>                                                
                                            <button className="actions blue" onClick={() => handleDownloadClick(attachment.packageId, attachment.documentBlobStorageName,attachment.documentName)}>
                                                <span className="material-symbols-rounded">download</span>
                                                <span>Download</span>
                                            </button>
                                            {attachment.documentBlobStorageName.split(".")[1] === "pdf" &&<button className='actions blue mr-1'
                                                onClick={() => handlePreviewClick(attachment.packageId, attachment.documentName)}>
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
                {false ? <div className="loader">
                            <img src={loading} alt="loading" />
                            <p>Loading data...</p>
                        </div> : null}
            </div>
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
        </div>
    )
}

export default AttachedDocumentsList