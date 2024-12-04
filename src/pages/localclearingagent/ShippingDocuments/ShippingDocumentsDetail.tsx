import { useState, useEffect, FormEvent } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useParams } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import Modal from "react-modal"
import PdfGeneratorConsCommercialInvoice from "../../pdftemplates/generateConsolidatedCommercialInvoice";
import PdfGeneratorConsPackingList from "../../pdftemplates/generateConsolidatedPackingList";
import { makeGetRequest, makePatchRequest, makePostRequest } from "../../../request";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import { ClearingProcessStatus, customStyles, formatDateTime, handleDownloadForShippingDocuments, handlePreviewForShippingDocuments, truncateText } from "helpers";
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
// import StepContent from '@mui/material/StepContent';
// import Button from '@mui/material/Button';

const ShippingDocumentsDetail =  () => {
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const param = useParams()
    const location = useLocation()
    const previousPageData = location.state as { status: number };
    const roles:any = useSelector((state: any) => state.roles.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] =useState<Record <string, any>>([])
    const [isShowInvoice, setIsShowInvoice] = useState(false)
    const [isShowPackingList, setIsShowPackingList] = useState(false)

    const getShippingDocument = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentById",
            id: param.id
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setData(res)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }

    const handleDownloadClick = async (shipment: any, documentName: string, title: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handleDownloadForShippingDocuments(shipment, documentName, title);
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };
    const handlePreviewClick = async (shipment: any, documentName: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handlePreviewForShippingDocuments(shipment, documentName);
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    }; 
    
    /**
     * Retrives the last occurence that matches the document name
     *
     * @param {any} shipment - The shipment object containing the document attachments.
     * @param {string} documentName - The name of the document to retrieve the blob storage name for.
     * @return {string | null} The document blob storage name if found, otherwise null.
     */
    const getDocumentBlobStorageName = (shipment: any, documentName: string) => {
        return shipment?.shippingDocumentAttachments?.reduce((prev: any, curr: any) => {
          return curr.documentName === documentName ? curr : prev;
        }, null)?.documentBlobStorageName;
    };    

    const getDocumentUploadDate = (shipment:any, documentName: string) => {
        return shipment?.shippingDocumentAttachments?.reduce((prev: any, curr: any) => {
            return curr.documentName === documentName ? curr : prev;
        }, null)?.createdDate
        // return shipment?.shippingDocumentAttachments?.find((attachment: any) => attachment.documentName === documentName)?.createdDate
    }

    const [formData, setFormData] = useState({
        documentName: "",
        document: "",
        filename: ""
    })

    const clearFormData = () => {
        setFormData({
            documentName: "",
            document: "",
            filename: ""
        })
        const fileinputElement = document.getElementById(formData.documentName) as HTMLInputElement
        if(fileinputElement) fileinputElement.value = ""
    }

    const handleFileChange = (event: any, documentName: string) => {
        const { name, files } = event.target;
        let selectedFile = files[0];
    
        let file = selectedFile.name.split(".");
        const fileFormat = file ? file[file.length - 1] : "";
        
        // Define allowed formats
        const allowedFormats = ["zip", "pdf"];
        const maxFileSize = 10 * 1024 * 1024; // 10 MB in bytes
        
        if (allowedFormats.includes(fileFormat)) {
            if (selectedFile.size <= maxFileSize) {
                // File is within size limit
                setFormData({...formData, [name]: selectedFile, filename: selectedFile.name, documentName: documentName}) 
            } else {
                // File exceeds size limit
                toast.error("File size exceeds 5 MB. Please upload a smaller file.");
                const element = event.target as HTMLInputElement;
                element.value = ""; // Clear the file input
            }
        } else {
            // Invalid file format
            if (fileFormat) {
                toast.error(
                    "Attempted to upload an invalid file format. Please re-upload with a valid format (zip, pdf)."
                );
            }
            const element = event.target as HTMLInputElement;
            element.value = ""; // Clear the file input
        }
    };

    const handleUpload = () => {
        const shippingDocumentAttachments = data.shippingDocumentAttachments
        const documentNamesFromShippingDocument = new Set(data.shippingDocumentAttachments.map((attachment: any) => attachment.documentName))
        const documentNameArray = Array.from(documentNamesFromShippingDocument)

        // Loop through all the unique document names,
        // get the last document based on the filtered document names and retrieve the shippingDocumentAttachmentId for each
        const shippingDocumentLatestAttachments = documentNameArray.map((docName: any) => 
            shippingDocumentAttachments?.reduce((prev: any, curr: any) => {
                return curr.documentName === docName ? curr : prev;
            }, null)
        )
        // remove the currently uploaded file from the check.
        .filter((attachment: any) => attachment.documentName !== formData.documentName)
        const shippingDocumentAttachmentIds = shippingDocumentLatestAttachments.map((attachment: {id: string}) => attachment.id)

        const form = new FormData()        
        form.append("documentName", formData.documentName)
        form.append("document", formData.document)
        form.append("shippingDocumentId", data?.id)
        shippingDocumentAttachmentIds.forEach((id, index) => {
            form.append(`shippingDocumentAttachmentIds[${index}]`, id)
        })
                
        setIsSubmitting2(true)
        var request:Record<string, any> = {
            what: "",
            data: form
        };      
        if(formData.documentName === "PreArrivalAssessmentReport") request.what = "UploadPreArrivalAssessmentReport"
        else request.what = "UploadOtherShippingDocuments"

        makePostRequest(request)
            .then((response: any) => {  
                setIsSubmitting2(false)          
                toast.success(response.msg)
                getShippingDocument()   
                clearFormData()      
            })
            .catch((error:any) => {toast.error(error.msg); setIsSubmitting2(false)});
    }

    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitting2, setIsSubmitting2] = useState(false)
    const [chatData, setChatData] = useState({
        shippingDocumentId: "", 
        localClearingAgentId: "",
        receiver: "",
        comment: "",
    })
    const clearChatData = () => {
        setChatData({
            shippingDocumentId: "", 
            // freightForwarderId: "", 
            localClearingAgentId: "",
            receiver: "",
            comment: "",
        })
    }
    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "AddCommentForShippingDocuments",
            data: {
                id: chatData.shippingDocumentId,
                comment: chatData.comment,
                sender: user.id,
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: "TransitOfficer",
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                clearChatData()
                toast.success("Chat Sent Successfully!")
                setOpenChatHistory(false)
                getShippingDocument()
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }   

    const getShippingChatHistory = (shippingDocumentId: string, localClearingAgentId: string) => {
        setIsChatLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentChatHistory",
            params: {
                shippingDocumentId: shippingDocumentId,
                sender: localClearingAgentId,
                receiver: "TransitOfficer",
                orderBy: 1
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsChatLoading(false)
                const res = response.data.data
                setChats(res.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()))
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsChatLoading(false)}
            );
    }

    // const [isUpdating, setIsUpdating] = useState(false)
    // const [clearingAgentWaybillNumber, setClearingAgentWaybillNumber] = useState("")
    // const UpdateClearingProcessStatus = (status: string) => {
    //     setIsUpdating(true)
    //     var request:Record<string, any> = {
    //         what: "UpdateClearingProcessStatus",
    //         data: {
    //             shippingDocumentId: data.id,
    //             status: status,
    //             // add conditonally if the status is set to "Readiness To Transfer To Total Energies Yard"
    //             ...(clearingAgentWaybillNumber && { clearingAgentWaybillNumber: clearingAgentWaybillNumber })
    //         }
    //     };      

    //     makePatchRequest(request)
    //         .then((response: any) => {  
    //             setIsUpdating(false)  
    //             if(clearingAgentWaybillNumber) setClearingAgentWaybillNumber("") //clear value                 
    //             toast.success(response.msg) 
    //             getShippingDocument()                            
    //         })
    //         .catch((error:any) => {toast.error(error.msg); setIsUpdating(false)});
    // }

    // Retrives the last occurence that matches the document name
    // get color and icon
    const getDocumentStatusSettings = (shipment: any, documentName: string) => {
        const status = shipment?.shippingDocumentAttachments?.reduce(
        (prev: any, curr: any) => {
            return curr.documentName === documentName ? curr : prev;
        },
        null
        )?.isApproved;

        switch (status) {
            case true:
                return {
                    color: "text-green",
                    icon: "check"
                };
            case false:
                return {
                    color: "text-red",
                    icon: "close"
                };
            case null:
                return {
                    color: "text-yellow",
                    icon: "hourglass_top"
                };
            default:
                return {
                    color: "text-grey",
                    icon: "circle"
                };
        }
    };

    useEffect(() => {
        if(accessToken) getShippingDocument() // eslint-disable-next-line
    }, [accessToken])

    const page = "Shipping Documents"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>     
                    
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <div className="d-flex">
                                <Link to={"/localclearingagent/shippingdocuments"} state={{status: previousPageData?.status}} className="actions">
                                    <p><span className="material-symbols-rounded">arrow_back</span> Back to Shipping Documents</p>
                                </Link>
                                <button 
                                    className="actions"
                                    onClick={() => {
                                        setOpenChatHistory(true); 
                                        getShippingChatHistory(data.id, user?.id);
                                        setChatData({...chatData, shippingDocumentId: data.id, localClearingAgentId: data.localClearingAgentId})}}
                                    ><p><span className="material-symbols-outlined">forum</span>Send | View Chats</p>
                                </button>  
                            </div>
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">visibility</span>
                                    <p>Preview Shipping Documents</p>
                                </div>
                            </div>                      
                        </div>
                    </div>   

                    <div className="main-inner mt-1" style={{minHeight: "100vh", padding: "16px", boxSizing: "border-box"}}> 
                        {data?.localClearingAgentStatus === 2 && <div className="alert alert-info" style={{margin: 0, padding: "8px", width: "auto"}}>
                            <span className="material-symbols-outlined mr-2 f-16" style={{color: "#004085"}}>info</span>
                            <p style={{margin: 0}}>Click on the <strong>Send | View Chats</strong> button to view reasons stated for the document(s) with an unresolved issue. </p>
                        </div>}                       
                        
                        <div style={{padding: "12px", border: "1px solid #d9d9d9", borderRadius: "6px", marginTop: "8px"}}>
                            <Box>
                                <Stepper 
                                    activeStep={ data?.clearingProcessStatuses?.length > 0 ? data?.clearingProcessStatuses?.length + 1 : 1 } alternativeLabel>
                                    {ClearingProcessStatus().map((label: any, index: number) => (
                                        <Step key={index}>
                                            <StepLabel>
                                                {(data?.shippingDocumentAttachments?.length && label.value === 1) && <span className="text-grey">{formatDateTime(data.shippingDocumentAttachments[data.shippingDocumentAttachments.length - 1]?.createdDate)}</span>}
                                                {label.value > 1 && <span className="text-grey">{formatDateTime(data?.clearingProcessStatuses?.find((cps: any) => cps.status === label.name)?.createdDate)}</span>}
                                                <br/> 
                                                <span>{label.name}</span>
                                            </StepLabel>
                                            {/* <StepContent>
                                                <div>
                                                    {label.name === "Readiness To Transfer To Total Energies Yard" && 
                                                    <>
                                                        <input type='text' name="ClearingAgentWaybillNumber" value={clearingAgentWaybillNumber} placeholder='Enter Waybill Number (Required)' onChange={(event) => setClearingAgentWaybillNumber(event.target.value)} />
                                                        <p className='small-text'>Must be more than 5 characters</p>
                                                    </>}
                                                    <Button
                                                    disabled={label.name === "Readiness To Transfer To Total Energies Yard" && clearingAgentWaybillNumber.length < 5}
                                                    variant="contained"
                                                    onClick={() => UpdateClearingProcessStatus(label.name)}
                                                    sx={{ mt: 1, mr: 1}}
                                                    > {isUpdating ? "Updating..." : "Update Status"}
                                                    </Button>
                                                </div>
                                            </StepContent> */}
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        </div>                        
                        <div className="accordion mt-1">
                            <div className={`header d-flex ${isShowInvoice ? 'active' : ''}`} onClick={() => setIsShowInvoice(!isShowInvoice)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowInvoice ? "expand_more" : "chevron_right"}</span>
                                    <span>Consolidated Commercial Invoice</span>
                                </div>
                                <p className="small-text m-0">Created: {formatDateTime(data?.createdDate)}</p>
                            </div>
                            {isShowInvoice && <div className="body">
                                <PdfGeneratorConsCommercialInvoice key="1" data={data?.consolidatedCommercialInvoice} />
                            </div>}
                        </div>    

                        <div className="accordion mt-1">
                            <div className={`header d-flex ${isShowPackingList ? 'active' : ''}`} onClick={() => setIsShowPackingList(!isShowPackingList)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowPackingList ? "expand_more" : "chevron_right"}</span>
                                    <span>Consolidated Packing List</span>
                                </div>
                                <p className="small-text m-0">Created: {formatDateTime(data?.createdDate)}</p>
                            </div>
                            {isShowPackingList && <div className="body">
                                <PdfGeneratorConsPackingList key="2" data={data?.consolidatedPackingList} />
                            </div>}
                        </div>

                        <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "DraftBillOfLadingOrAirWayBill") ? "disabled" : ""}>
                                Draft Bill Of Lading/Air Way Bill
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DraftBillOfLadingOrAirWayBill"))}</p>
                            </span>  
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "DraftBillOfLadingOrAirWayBill")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "DraftBillOfLadingOrAirWayBill")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> } 
                                <button className='actions blue' 
                                    disabled={!getDocumentBlobStorageName(data, "DraftBillOfLadingOrAirWayBill")} 
                                    onClick={() => handleDownloadClick(data, "DraftBillOfLadingOrAirWayBill", "Draft_Bill_Of_Lading_Or_Air_Way_Bill_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "DraftCombinedCertificateValueOrigin") ? "disabled" : ""}>
                                Draft Combined Certificate Value Origin (CCVO)
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DraftCombinedCertificateValueOrigin"))}</p>
                            </span>
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "DraftCombinedCertificateValueOrigin")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "DraftCombinedCertificateValueOrigin")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }   
                            <button className='actions blue' 
                                disabled={!getDocumentBlobStorageName(data, "DraftCombinedCertificateValueOrigin")} 
                                onClick={() => handleDownloadClick(data, "DraftCombinedCertificateValueOrigin", "Draft_Combined_Certificate_Value_Origin_")}>
                                    <span className="material-symbols-rounded">download</span>
                                    <span>Download</span>
                            </button>
                            </div>
                        </div>

                        <div className="d-flex file-input-container mt-1">
                            <div className="d-flex-2" style={{alignItems: "start"}}>
                                <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "BillOfLadingOrAirWayBill").color} f-16`}>{getDocumentStatusSettings(data, "BillOfLadingOrAirWayBill").icon}</span>
                                <span className={!getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill") ? "disabled" : ""}>
                                    Bill Of Lading/Air Way Bill
                                    <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "BillOfLadingOrAirWayBill"))}</p>
                                </span> 
                            </div>

                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "BillOfLadingOrAirWayBill")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }  
                            <button className='actions blue' 
                                disabled={!getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill")} 
                                onClick={() => handleDownloadClick(data, "BillOfLadingOrAirWayBill", "Bill_Of_Lading_Or_Air_Way_Bill_")}>
                                    <span className="material-symbols-rounded">download</span>
                                    <span>Download</span>
                            </button>
                            </div>
                        </div>    

                        <div className="d-flex file-input-container mt-1">
                            <div className="d-flex-2" style={{alignItems: "start"}}>
                                <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "CombinedCertificateValueOrigin").color} f-16`}>{getDocumentStatusSettings(data, "CombinedCertificateValueOrigin").icon}</span>
                                <span className={!getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin") ? "disabled" : ""}>
                                    Combined Certificate Value Origin (CCVO)
                                    <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "CombinedCertificateValueOrigin"))}</p>
                                </span>
                            </div>  
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "CombinedCertificateValueOrigin")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> } 
                                <button className='actions blue'
                                    disabled={!getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin")} 
                                    onClick={() => handleDownloadClick(data, "CombinedCertificateValueOrigin", "Combined_Certificate_Value_Origin_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div> 

                        <div className="alert alert-info mt-2" style={{margin: 0, padding: "8px", width: "auto"}}>
                            <span className="material-symbols-outlined mr-2 f-16" style={{color: "#004085"}}>info</span>
                            <p style={{margin: 0}}>Allowed Formats for Each Document Upload (zip, pdf) - Max Size (5MB)</p>
                        </div>

                        {/* Other shipping documents */}
                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "FinalDutyAssessmentDocument").color} f-16`}>{getDocumentStatusSettings(data, "FinalDutyAssessmentDocument").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") ? "disabled" : ""}>
                                        Final Duty Assessment Document<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "FinalDutyAssessmentDocument"))}</p>
                                    </span>  
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "FinalDutyAssessmentDocument" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("FinalDutyAssessmentDocument")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "FinalDutyAssessmentDocument" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "FinalDutyAssessmentDocument")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "FinalDutyAssessmentDocument", "Final_Duty_Assessment_Document_")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="FinalDutyAssessmentDocument" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "FinalDutyAssessmentDocument")} required hidden />
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme").color} f-16`}>{getDocumentStatusSettings(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") ? "disabled" : ""}>
                                        SONCAP<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme"))}</p>
                                    </span>
                                </div>  
                                <div className="d-flex">
                                    {formData.documentName !== "StandardOrganisationOfNigeriaConformityAssessmentProgramme" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("StandardOrganisationOfNigeriaConformityAssessmentProgramme")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "StandardOrganisationOfNigeriaConformityAssessmentProgramme" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme", "Standard_Organisation_Of_Nigeria_Conformity_Assessment_Programme")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="StandardOrganisationOfNigeriaConformityAssessmentProgramme" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")} required hidden />
                        </div>                         

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "PreArrivalAssessmentReport").color} f-16`}>{getDocumentStatusSettings(data, "PreArrivalAssessmentReport").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") ? "disabled" : ""}>
                                        Pre Arrival Assessment Report (PAAR)<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "PreArrivalAssessmentReport"))}</p>
                                    </span> 
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "PreArrivalAssessmentReport" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("PreArrivalAssessmentReport")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "PreArrivalAssessmentReport" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "PreArrivalAssessmentReport")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "PreArrivalAssessmentReport")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "PreArrivalAssessmentReport", "Pre_Arrival_Assessment_Report")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="PreArrivalAssessmentReport" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "PreArrivalAssessmentReport")} required hidden />
                            
                        </div> 

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "SingleGoodsDeclarationForm").color} f-16`}>{getDocumentStatusSettings(data, "SingleGoodsDeclarationForm").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") ? "disabled" : ""}>
                                        SGD Form<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "SingleGoodsDeclarationForm"))}</p>
                                    </span>  
                                </div>                                
                                <div className="d-flex">
                                    {formData.documentName !== "SingleGoodsDeclarationForm" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("SingleGoodsDeclarationForm")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "SingleGoodsDeclarationForm" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "SingleGoodsDeclarationForm")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "SingleGoodsDeclarationForm", "Single_Goods_Declaration_Form")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="SingleGoodsDeclarationForm" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "SingleGoodsDeclarationForm")} required hidden />
                            
                        </div> 

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "SingleGoodsDeclarationDetailOfValuationNote").color} f-16`}>{getDocumentStatusSettings(data, "SingleGoodsDeclarationDetailOfValuationNote").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") ? "disabled" : ""}>
                                        SGD Detail Of Valuation Note<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "SingleGoodsDeclarationDetailOfValuationNote"))}</p>
                                    </span> 
                                </div> 
                                {formData.documentName !== "SingleGoodsDeclarationDetailOfValuationNote" && data?.localClearingAgentStatus !== 3 && 
                                    <div 
                                        className="d-flex-2 gap-2 mr-2" 
                                        style={{color: !getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                        onClick={() => document.getElementById("SingleGoodsDeclarationDetailOfValuationNote")?.click()}>
                                        <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") ? "post_add" : "replay"}</span>
                                        <span>{!getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") ? "Choose a File" : "Change File"}</span>                                
                                    </div>
                                }
                                {formData.documentName === "SingleGoodsDeclarationDetailOfValuationNote" && <div 
                                    className="d-flex-2 mr-2">
                                    {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                        <span className="material-symbols-rounded">upload</span>
                                        <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                    </div>}    
                                    {isSubmitting2 && <div className="text-grey">
                                        <span>Uploading...</span> 
                                    </div>}  
                
                                    {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                    onClick={() => clearFormData()}                                
                                    ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                </div>}
                                {getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") && <div className="d-flex"
                                    style={{borderRight: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote")?.split('.')[1] === "pdf" &&
                                            <button className='actions blue mr-1'
                                                onClick={() => handlePreviewClick(data, "SingleGoodsDeclarationDetailOfValuationNote")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> 
                                        }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "SingleGoodsDeclarationDetailOfValuationNote", "Single_Goods_Declaration_Detail_Of_Valuation_Note_")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                            </div>
                            <input id="SingleGoodsDeclarationDetailOfValuationNote" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "SingleGoodsDeclarationDetailOfValuationNote")} required hidden />

                        </div> 

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "ExchangeControl").color} f-16`}>{getDocumentStatusSettings(data, "ExchangeControl").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "ExchangeControl") ? "disabled" : ""}>
                                        Exchange Control<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ExchangeControl"))}</p>
                                    </span>
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "ExchangeControl" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "ExchangeControl") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("ExchangeControl")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "ExchangeControl") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "ExchangeControl") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "ExchangeControl" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "ExchangeControl") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "ExchangeControl")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "ExchangeControl")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "ExchangeControl", "Exchange_Control")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="ExchangeControl" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "ExchangeControl")} required hidden />
                            
                        </div> 

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "FormM").color} f-16`}>{getDocumentStatusSettings(data, "FormM").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "FormM") ? "disabled" : ""}>
                                        Form M<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "FormM"))}</p>
                                    </span> 
                                </div> 
                                <div className="d-flex">
                                    {formData.documentName !== "FormM" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "FormM") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("FormM")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "FormM") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "FormM") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "FormM" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "FormM") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "FormM")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "FormM")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "FormM", "FormM")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="FormM" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "FormM")} required hidden />
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "ShippingAndTerminalCompanyReceipts").color} f-16`}>{getDocumentStatusSettings(data, "ShippingAndTerminalCompanyReceipts").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") ? "disabled" : ""}>
                                        Shipping And Terminal Company Receipts<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ShippingAndTerminalCompanyReceipts"))}</p>
                                    </span>
                                </div>  
                                <div className="d-flex">
                                    {formData.documentName !== "ShippingAndTerminalCompanyReceipts" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("ShippingAndTerminalCompanyReceipts")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "ShippingAndTerminalCompanyReceipts" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "ShippingAndTerminalCompanyReceipts")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "ShippingAndTerminalCompanyReceipts", "Shipping_And_Terminal_Company_Receipts")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="ShippingAndTerminalCompanyReceipts" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "ShippingAndTerminalCompanyReceipts")} required hidden />
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "ProofOfDelivery").color} f-16`}>{getDocumentStatusSettings(data, "ProofOfDelivery").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "ProofOfDelivery") ? "disabled" : ""}>
                                        Proof Of Delivery<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ProofOfDelivery"))}</p>
                                    </span>  
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "ProofOfDelivery" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "ProofOfDelivery") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("ProofOfDelivery")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "ProofOfDelivery") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "ProofOfDelivery") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "ProofOfDelivery" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "ProofOfDelivery") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "ProofOfDelivery")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "ProofOfDelivery")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "ProofOfDelivery", "Proof_Of_Delivery")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="ProofOfDelivery" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "ProofOfDelivery")} required hidden />
                            
                        </div>                        

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "AcknowledgementLetter").color} f-16`}>{getDocumentStatusSettings(data, "AcknowledgementLetter").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "AcknowledgementLetter") ? "disabled" : ""}>
                                        Acknowledgement Letter<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "AcknowledgementLetter"))}</p>
                                    </span>
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "AcknowledgementLetter" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "AcknowledgementLetter") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("AcknowledgementLetter")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "AcknowledgementLetter") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "ProofOfDelivery") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "AcknowledgementLetter" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "AcknowledgementLetter") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "AcknowledgementLetter")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "AcknowledgementLetter")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "AcknowledgementLetter", "Acknowledgement_Letter")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="AcknowledgementLetter" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "AcknowledgementLetter")} required hidden/>
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "ExitNote").color} f-16`}>{getDocumentStatusSettings(data, "ExitNote").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "ExitNote") ? "disabled" : ""}>
                                        Customs Exit Note<span className="text-red ml-2">*</span>
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ExitNote"))}</p>
                                    </span>  
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "ExitNote" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "ExitNote") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("ExitNote")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "ExitNote") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "ProofOfDelivery") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "ExitNote" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "ExitNote") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "ExitNote")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "ExitNote")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "ExitNote", "Exit_Note")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="ExitNote" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "ExitNote")} required hidden/>
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "DemandNotice").color} f-16`}>{getDocumentStatusSettings(data, "DemandNotice").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "DemandNotice") ? "disabled" : ""}>
                                        Demand Notice
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DemandNotice"))}</p>
                                    </span>
                                </div>  
                                <div className="d-flex">
                                    {formData.documentName !== "DemandNotice" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "DemandNotice") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("DemandNotice")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "DemandNotice") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "DemandNotice") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "DemandNotice" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "DemandNotice") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "DemandNotice")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "DemandNotice")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "DemandNotice", "Demand_Notice")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>   
                            </div>
                            <input id="DemandNotice" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "DemandNotice")} required hidden />
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "DemandNoticePaymentReceipt").color} f-16`}>{getDocumentStatusSettings(data, "DemandNoticePaymentReceipt").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") ? "disabled" : ""}>
                                        Demand Notice Payment Receipt
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DemandNoticePaymentReceipt"))}</p>
                                    </span>
                                </div>  
                                <div className="d-flex">
                                    {formData.documentName !== "DemandNoticePaymentReceipt" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("DemandNoticePaymentReceipt")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "DemandNoticePaymentReceipt" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "DemandNoticePaymentReceipt")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "DemandNoticePaymentReceipt", "DemandNotice_Payment_Receipt")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="DemandNoticePaymentReceipt" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "DemandNoticePaymentReceipt")} required hidden />
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "NAFDACReleaseNote").color} f-16`}>{getDocumentStatusSettings(data, "NAFDACReleaseNote").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "NAFDACReleaseNote") ? "disabled" : ""}>
                                        NAFDAC Release Note
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "NAFDACReleaseNote"))}</p>
                                    </span> 
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "NAFDACReleaseNote" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "NAFDACReleaseNote") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("NAFDACReleaseNote")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "NAFDACReleaseNote") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "NAFDACReleaseNote") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "NAFDACReleaseNote" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "NAFDACReleaseNote") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "NAFDACReleaseNote")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "NAFDACReleaseNote")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "NAFDACReleaseNote", "NAFDAC_Release_Note")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="NAFDACReleaseNote" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "NAFDACReleaseNote")} required hidden />
                            
                        </div>

                        <div className="file-input-container mt-1">
                            <div className="d-flex">
                                <div className="d-flex-2" style={{alignItems: "start"}}>
                                    <span className={`material-symbols-outlined ${getDocumentStatusSettings(data, "ContainerRefundDocuments").color} f-16`}>{getDocumentStatusSettings(data, "ContainerRefundDocuments").icon}</span>
                                    <span className={!getDocumentBlobStorageName(data, "ContainerRefundDocuments") ? "disabled" : ""}>
                                        Container Refund Documents
                                        <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ContainerRefundDocuments"))}</p>
                                    </span> 
                                </div>
                                <div className="d-flex">
                                    {formData.documentName !== "ContainerRefundDocuments" && data?.localClearingAgentStatus !== 3 && 
                                        <div 
                                            className="d-flex-2 gap-2 mr-2" 
                                            style={{color: !getDocumentBlobStorageName(data, "ContainerRefundDocuments") ? "#E38600" : "#175FDC", cursor: "pointer"}}
                                            onClick={() => document.getElementById("ContainerRefundDocuments")?.click()}>
                                            <span className="material-symbols-rounded">{!getDocumentBlobStorageName(data, "ContainerRefundDocuments") ? "post_add" : "replay"}</span>
                                            <span>{!getDocumentBlobStorageName(data, "ContainerRefundDocuments") ? "Choose a File" : "Change File"}</span>                                
                                        </div>
                                    }
                                    {formData.documentName === "ContainerRefundDocuments" && <div 
                                        className="d-flex-2 mr-2">
                                        {!isSubmitting2 && <div className="d-flex-2 actions" onClick={() => handleUpload()}>
                                            <span className="material-symbols-rounded">upload</span>
                                            <span>Upload Document{formData.filename ? ` - ${truncateText(formData.filename, 20)}` : ""}</span> 
                                        </div>}    
                                        {isSubmitting2 && <div className="text-grey">
                                            <span>Uploading...</span> 
                                        </div>}  
                    
                                        {!isSubmitting2 && <div className="red-text d-flex-2 gap-2 text-red actions"
                                        onClick={() => clearFormData()}                                
                                        ><span className="material-symbols-rounded" style={{fontSize: "14px"}}>close</span>Remove</div>}                        
                                    </div>}
                                    {getDocumentBlobStorageName(data, "ContainerRefundDocuments") && <div className="d-flex"
                                        style={{borderLeft: "1px solid #d9d9d9", paddingLeft: "8px", marginLeft: "8px"}}>
                                        {getDocumentBlobStorageName(data, "ContainerRefundDocuments")?.split('.')[1] === "pdf"
                                            &&<button className='actions blue'
                                                onClick={() => handlePreviewClick(data, "ContainerRefundDocuments")}>
                                                    <span className="material-symbols-rounded">preview</span>
                                                    <span>Preview</span>
                                            </button> }
                                            <button className='actions blue'
                                                onClick={() => handleDownloadClick(data, "ContainerRefundDocuments", "Container_Refund_Documents")}>
                                                    <span className="material-symbols-rounded">download</span>
                                                    <span>Download</span>
                                            </button>
                                    </div>}
                                </div>
                            </div>
                            <input id="ContainerRefundDocuments" name="document" type='file' accept='.zip, .pdf' onChange={(event) => handleFileChange(event, "ContainerRefundDocuments")} required hidden/>
                            
                        </div>
                    </div>
                </div>
                <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Chats</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearChatData()} }>close</span>
                    </div>
                    <div className="modal-body" style={{ minHeight: "200px"}}>
                        {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && 
                        <div className='chat-container'>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                        <label className='title'>{chat.sender === user?.id ? "Local Clearing Agent" : "Transit Team"}</label>
                                        <p>{chat.message}</p>
                                        <span className='date'>{formatDateTime(chat.createdDate)}</span>
                                    </div>
                                )
                            })}
                        </div>}

                        {isChatLoading && 
                        <div className="loader">
                            <img src={loading} alt="loading" />
                            <p className="d-flex-center">Loading Chats...</p>
                        </div>}
                    </div>
                    {data?.localClearingAgentStatus !== 3 && <form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder="Message for Transit Team..." 
                            rows={4} 
                            maxLength={300}
                            onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                            value={chatData.comment} 
                            required ></textarea>
                        <button type="submit" 
                        disabled={isSubmitting || !chatData.comment}
                        className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
                    </div>
                    <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>
                    </form>}
                </Modal>
                <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p>Loading data...</p>
                    </div>
                </Modal> 
                <ToastContainer />
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default ShippingDocumentsDetail