import { customStyles, formatDateTime, getStatusAndColorForMRDUploads, handleDownloadForPackageAttachment, handlePreviewForPackageAttachment } from "helpers";
import loading from "../../../../assets/images/loading.gif"
import Modal from "react-modal"
import { FormEvent, useState } from "react";
import { useSelector } from "react-redux";
import { makePatchRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttachedDocumentsList = (props: any) => {
    const { packageAttachments, getMaterialReadinessDocumentById, packageId, materialReadinessDocument, selectedPurchaseOrderNumber, isApprovedByCAndP } = props
    const [isLoading, setIsLoading] = useState(false)
    const [attachment, setAttachment] = useState({
        id: "",
        documentName: ""
    })
    // const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);

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

    const [openChatModal, setOpenChatModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chatData, setChatData] = useState({
        comment: "",
    })
    const clearChatData = () => {
        setChatData({
            comment: "",
        })
    }
    // Called to send the reason for rejection
    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formattedComment = chatData.comment 
            + `|Document Name: ${attachment.documentName.replaceAll("_", " ")}.`
            + `|Purchase Order Number: ${selectedPurchaseOrderNumber}.`
        var request: Record<string, any> = {
            what: "AddCommentForMaterialReadinessDocument",
            data: {
                materialReadinessDocumentId: materialReadinessDocument.id,
                comment: formattedComment,
                sender: "ExpeditingTeam",
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: materialReadinessDocument.supplierId, // enter supplier id for the mrd
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                clearChatData()
                // toast.success("Chat Sent Successfully!")
                setOpenChatModal(false)
                handleAttachmentApproval(attachment.id, false)
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    } 
    const handleAttachmentApproval = (attachmentId: string, status: boolean) => {
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "C&PReviewPackageAttachment",
            data: {
                packageId: packageId,
                packageAttachmentId: attachmentId,
                status: status
            }
        }
        makePatchRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                toast.success("Approval Status Updated Successfully.")
                getMaterialReadinessDocumentById(packageId) // reload data.
            }).catch((error:any) => {toast.error(error.msg)});
    }

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
                            <th>Action</th>
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
                                            {isApprovedByCAndP && <span className={`status ${getStatusAndColorForMRDUploads(attachment.status).color}`}>{`${getStatusAndColorForMRDUploads(attachment.status).statusText}`}</span>}
                                            {!isApprovedByCAndP && <div className="dropdown custom">
                                                <button className={`dropbtn-2 ${getStatusAndColorForMRDUploads(attachment.status).color}`}>
                                                    <div>
                                                        <span className="material-symbols-rounded">{getStatusAndColorForMRDUploads(attachment.status).icon}</span>
                                                        <p>{getStatusAndColorForMRDUploads(attachment.status).statusText}</p>
                                                    </div>

                                                    <span className="material-symbols-rounded">arrow_drop_down</span>   
                                                </button>
                                                <div className="dropdown-content">
                                                    <button type="button" disabled={attachment.status} onClick={() => handleAttachmentApproval(attachment.id, true)}>Approve</button>
                                                    <button type="button" disabled={attachment.status === false} 
                                                        onClick={() => {
                                                            setOpenChatModal(true); 
                                                            setAttachment({id: attachment.id, documentName: attachment.documentName})}}>Reject</button>
                                                </div>
                                            </div>}
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
            <Modal isOpen={openChatModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Attachment Rejection</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenChatModal(false); setIsSubmitting(false); clearChatData()}}>close</span>
                </div>
                <form onSubmit={handleSendChat}>
                <div className="modal-body">
                    <div>
                        <label>
                            <span className="errorX mr-2">*</span> Reason
                        </label>  
                        <textarea 
                            className="mt-1"
                            name="comment" 
                            placeholder="Message for supplier..." 
                            maxLength={300}
                            onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                            value={chatData.comment} 
                            required ></textarea>
                    </div> 
                    <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small> 
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => {setOpenChatModal(false); clearChatData()}}>Cancel</button>
                    <button type="submit" 
                    disabled={isSubmitting}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Submit"}</button>
                </div>
                </form>
            </Modal>
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
            <ToastContainer />
        </div>
    )
}

export default AttachedDocumentsList