import { customStyles, formatDateTime, getStatusAndColorForMRDUploads, handleDownloadForPOItemSupplyAttachment, handlePreviewForPoItemSupply } from "helpers";
import loading from "../../../../assets/images/loading.gif"
import Modal from "react-modal"
import { FormEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeGetRequest, makePatchRequest, makePostRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MaterialPicturesList = (props: any) => {
    const { purchaseOrderItems, getMaterialReadinessDocumentById, materialReadinessDocument, isApprovedByCAndP } = props
    const [isLoading, setIsLoading] = useState(false)
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);
    // const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [viewUploadsModal, setViewUploadsModal] = useState(false)
    const [purchaseOrderItemSuppliesId, setPurchaseOrderItemSuppliesId] = useState("")
    const [selectedItemMaterialPictures, setSelectedItemMaterialPictures] = useState<Record <string, any>>([])
    const [isReviewedByEntity, setIsReviewedByEntity] = useState(false)
    const [openChatModal, setOpenChatModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRequestReviewInitiated, setIsRequestReviewInitiated] = useState(false)
    const [attachment, setAttachment] = useState({
        id: "",
        documentName: ""
    })
    const [packageId, setPackageId] = useState("")
    const [selectedMaterial, setSelectedMaterial] = useState<Record <string, any>>({})

    const [chatData, setChatData] = useState({
        comment: "",
        entityRepresentativeEmail: ""
    })
    const clearChatData = () => {
        setChatData({
            comment: "",
            entityRepresentativeEmail: ""
        })
    }

    const [entityRepresentatives, setEntityRepresentatives] = useState<Record <string, any>>([])
    const getAllUsersForARole = () => {
        setIsLoading(true);
        var request: Record<string, any> = {
            what: "getAllUsersForARole",
            params: {
                page: 1,
                pageSize: 100,
                roleName: "Entity Representative"
            }
        };        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setEntityRepresentatives(res)
            })
            .catch((error:any) => 
                console.log(error)
            );
    }

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

    const handleRejectionChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formattedComment = chatData.comment 
            + `|Document Name: ${attachment.documentName.replaceAll("_", " ")}.`
            + `|Purchase Order Number: ${selectedMaterial?.purchaseOrderNumber}.`
            + `|Material Number: ${selectedMaterial?.materialNumber}.`

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
                handleMaterialAttachmentApproval(attachment.id, false)
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }

    const handleSendChat = () => {
        const selectedItem = purchaseOrderItems?.find((data: any) => data.id === purchaseOrderItemSuppliesId)
        const formattedComment = chatData.comment             
            + `|Purchase Order Number: ${selectedMaterial?.purchaseOrderNumber}.`
            + `|Material Number: ${selectedMaterial?.materialNumber}.`
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "AddCommentForMaterialReadinessDocument",
            data: {
                materialReadinessDocumentId: materialReadinessDocument.id,
                comment: formattedComment,
                sender: "ExpeditingTeam",
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: selectedItem?.entityRepresentativeId, // enter entity rep id
            }
        };
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                clearChatData()
                setRequestConfirmationModal(false)
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }

    // To reload the attachments and display the new status
    const getPackage = () => {
        // setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPackage",
            id: packageId,
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                // setIsLoading(false)
                const res = response.data.data
                const selectedAttachments = res.purchaseOrderItemSupplies.find((data: any) => data.id === purchaseOrderItemSuppliesId).purchaseOrderItemSupplyAttachments
                setSelectedItemMaterialPictures(selectedAttachments)

                // Check if all the attachments have either approve or reject
                const attachmentStatus = Object.values(selectedAttachments).some((value: any) => value.status === null)
                
                if(attachmentStatus === false) setViewUploadsModal(false) // close modal
                else setViewUploadsModal(true) // Keep modal open for more approvals  
            })
            .catch((error:any) => 
                {toast.error(error)}
            );
    }

    const handleMaterialAttachmentApproval = (attachmentId: string, status: boolean) => {
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "AddCandPMaterialItemAttachmentReview",
            data: {
                purchaseOrderItemSupplyId: purchaseOrderItemSuppliesId,
                purchaseOrderItemSupplyAttachmentId: attachmentId,
                status: status
            }
        }
        makePatchRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                toast.success(response.msg)
                getMaterialReadinessDocumentById(packageId) // reload data.
                if(packageId) getPackage()

                setViewUploadsModal(true);// confirm this
            }).catch((error:any) => {toast.error(error.msg)});
    }

    const [requestConfirmationModal, setRequestConfirmationModal] = useState(false)
    const handleRequestMaterialReview = (event: FormEvent) => {
        event.preventDefault()
        setRequestConfirmationModal(false)
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "RequestItemReviewByEntityRepresentative",
            data: {
                purchaseOrderItemSupplyId: purchaseOrderItemSuppliesId,
                entityRepresentativeEmail: chatData.entityRepresentativeEmail
            }
        }
        makePostRequest(request)
            .then((response: any) => {
                getMaterialReadinessDocumentById(packageId) // reload data.
                setIsLoading(false)                
                toast.success(response.msg)
                // setRequestConfirmationModal(false)

                // Triggers the useEffect to run
                setIsRequestReviewInitiated(true)
            }).catch((error:any) => {toast.error(error.msg); setIsLoading(false); setRequestConfirmationModal(true)});
    }

    useEffect(() => {
        const selectedItem = purchaseOrderItems?.find((data: any) => data.id === purchaseOrderItemSuppliesId)
        if(chatData.comment && selectedItem?.entityRepresentativeId) handleSendChat()
        //eslint-disable-next-line
    }, [isRequestReviewInitiated === true && purchaseOrderItems])

    const clearSetData = () => {
        setViewUploadsModal(false); 
        setSelectedItemMaterialPictures([]); 
        setPurchaseOrderItemSuppliesId("");
        setPackageId("")
        setIsReviewedByEntity(false)
        setAttachment({
            id: "",
            documentName: "",
        })
    }

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
                            <th>Is Reviewed By Entity</th>
                            <th>Status</th>
                            <th style={{width: "130px"}}>Action</th>
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
                                            {data.entityRepresentativeId && <span className="material-symbols-rounded text-green">check</span>}
                                            {!data.entityRepresentativeId && <span>N/A</span>}
                                        </td>       
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
                                        <td className="actions">
                                            <div className="dropdown">
                                                <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                                <div className="dropdown-content">
                                                    <button
                                                    onClick={() => {
                                                        setViewUploadsModal(true); 
                                                        setSelectedItemMaterialPictures(data.purchaseOrderItemSupplyAttachments); 
                                                        setPurchaseOrderItemSuppliesId(data.id)
                                                        setIsReviewedByEntity(data.entityRepresentativeId)
                                                        setPackageId(data.packageId)
                                                        setSelectedMaterial({
                                                            materialNumber: data.purchaseOrderItem.materialNumber,
                                                            purchaseOrderNumber: data.purchaseOrderItem.purchaseOrderNumber,
                                                            materialDescription: data.purchaseOrderItem.materialDescription
                                                        })
                                                    }}
                                                    >View Attached Files</button>
                                                    <button
                                                    disabled={data.entityRepresentativeId}
                                                    onClick={() => {
                                                        setRequestConfirmationModal(true); 
                                                        getAllUsersForARole()
                                                        setPurchaseOrderItemSuppliesId(data.id)
                                                        setPackageId(data.packageId)
                                                        setSelectedMaterial({
                                                            materialNumber: data.purchaseOrderItem.materialNumber,
                                                            purchaseOrderNumber: data.purchaseOrderItem.purchaseOrderNumber,
                                                        })
                                                    }}
                                                    >Request Review</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            <Modal isOpen={viewUploadsModal} style={customStyles} className="modal modal-8" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Attached Files</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => clearSetData()}>close</span>
                </div>
                <div className="modal-body table-container custom" style={{minHeight: "320px"}}>
                    <table>
                        <thead>
                            <tr className="no-textwrap">
                                <th style={{borderTop: "none"}}>SN</th>
                                <th style={{borderTop: "none"}}>File Type</th>
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
                                            <td>{attachment.documentName.replaceAll("_", " ")}</td>
                                            <td>{formatDateTime(attachment.createdDate)}</td>  
                                            <td>
                                                {(isReviewedByEntity || isApprovedByCAndP) && <span className={`status ${getStatusAndColorForMRDUploads(attachment.status).color}`}>{`${getStatusAndColorForMRDUploads(attachment.status).statusText}`}</span>}

                                                {(!isReviewedByEntity && !isApprovedByCAndP) && <div className="dropdown custom">
                                                    <button className={`dropbtn-2 ${getStatusAndColorForMRDUploads(attachment.status).color}`}>
                                                        <div>
                                                            <span className="material-symbols-rounded">{getStatusAndColorForMRDUploads(attachment.status).icon}</span>
                                                            <p>{getStatusAndColorForMRDUploads(attachment.status).statusText}</p>
                                                        </div>

                                                        <span className="material-symbols-rounded">arrow_drop_down</span>   
                                                    </button>
                                                    <div className="dropdown-content">
                                                        <button type="button" disabled={attachment.status} onClick={() => handleMaterialAttachmentApproval(attachment.id, true)}>Approve</button>
                                                        <button type="button" disabled={attachment.status === false} onClick={() => {setOpenChatModal(true); setViewUploadsModal(false); setAttachment({id: attachment.id, documentName: attachment.documentName})}}>Reject</button>

                                                    </div>
                                                </div>}
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
            <Modal isOpen={openChatModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Attachment Rejection</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenChatModal(false); setIsSubmitting(false); clearChatData(); setSelectedMaterial({})}}>close</span>
                </div>
                <form onSubmit={handleRejectionChat}>
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
                        onClick={() => {setOpenChatModal(false); clearChatData();  setViewUploadsModal(true);}}>Cancel</button>
                    <button type="submit" 
                    disabled={isSubmitting}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Submit"}</button>
                </div>
                </form>
            </Modal>
            <Modal isOpen={requestConfirmationModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Request Confirmation</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setRequestConfirmationModal(false); clearChatData()}}>close</span>
                </div>

                <form onSubmit={handleRequestMaterialReview}>
                <div className="modal-body">
                    <div className="alert alert-info" style={{margin: "8px 0", padding: "8px", width: "auto"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                        <p style={{margin: 0}}>The entity representative would be notified of this action via mail to review the material attachments and approve. Kindly indicate if you would like to send this request.</p>
                    </div>
                    <label>Entity Representative</label>
                    <select className="mb-1" name="" value={chatData.entityRepresentativeEmail} onChange={(event) => setChatData({...chatData, entityRepresentativeEmail: event.target.value})}>
                        <option disabled value="">Select...</option>
                        {
                            entityRepresentatives?.map((representative: any, index: number) => {
                                return <option key={index} value={representative.user.email}>{`${representative.user.firstName} ${representative.user.lastName} (${representative.user?.department.split(";")[2]?.trim()})`}</option>
                            })
                        }
                    </select>

                    <label>Comment (optional)</label>
                    <textarea
                        className="mt-1" 
                        name="comment" 
                        placeholder="Message for Entity Representative..." 
                        rows={4} 
                        maxLength={300}
                        onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                        value={chatData.comment} >
                    </textarea>  
                    <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>    

                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => {setRequestConfirmationModal(false); clearChatData()}}>Cancel</button>
                    <button type="submit" className="custom-button orange">Send</button>
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

export default MaterialPicturesList