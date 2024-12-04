import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Link } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect, FormEvent } from "react";
import { makeGetRequest, makePatchRequest, makePostRequest } from "../../../request";
import { useSelector } from "react-redux";
import { customStyles, formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from '../../Layout';
import Modal from "react-modal"
import { useLocation, useNavigate } from 'react-router-dom';
// import Toggle from 'react-toggle'

const ShippingDocuments =  () => {
    const navigate = useNavigate()
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };

    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const roles:any = useSelector((state: any) => state.roles.value);

    const [shippingDocuments, setRecords] = useState<Record <string, any>>([])    
    const [isUploadModal, setIsUploadModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selection, setSelection] = useState("")
    const [formData, setFormData] = useState({
        combinedCertificateValueOrigin: "",
        billOfLadingOrAirWayBill: "",
        shippingDocumentId: "",  
        referenceNumber: "",  
        trasitOfficerValidation: "",
        estimatedTimeOfDelivery: "",
        actualTimeOfDelivery: ""  
    })
    const [formData2, setFormData2] = useState({
        containerDescription: "",
        vesselName: ""
    })
    const [chatData, setChatData] = useState({
        shippingDocumentId: "", 
        freightForwarderId: "", 
        localClearingAgentId: "",
        receiver: "",
        comment: "",
    })
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const clearData = () => {
        setFormData({
            combinedCertificateValueOrigin: "",
            billOfLadingOrAirWayBill: "",
            shippingDocumentId: "",     
            referenceNumber: "",  
            trasitOfficerValidation: "",
            estimatedTimeOfDelivery: "",
            actualTimeOfDelivery: ""
        })
    }

    const clearChatData = () => {
        setChatData({
            shippingDocumentId: "", 
            freightForwarderId: "", 
            localClearingAgentId: "",
            receiver: "",
            comment: "",
        })
    }

    const handlePrevious = () => {if (currentPage > 1) setCurrentPage(currentPage - 1)}
    const handleNext = () => {if (currentPage < totalPages) setCurrentPage(currentPage + 1)}
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {pageNumbers.push(i);}
        return pageNumbers;
    };
    
    const [searchValue, setSearchValue] = useState("")
    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const handleChange = (event: any) => {        
        const { name, value } = event.target //get data form each input on change

        setFormData2(values => ({...formData2, [name]: value})) //set retrieved values to "formData" object 
    }

    const handleFileChange = (event: any) => {
        const {name, files} = event.target
        let selectedFile = files[0]

        let file = selectedFile.name.split(".");
        const fileFormat = file[file.length - 1]
        if (fileFormat === "zip" || fileFormat === "pdf") setFormData(({...formData, [name]: selectedFile})) 
        else {
            toast.error("Attempted to upload an invalid file format. Please re-upload the correct file formats.")
            const element = event.target as HTMLInputElement
            element.value = ""
        }               
    }

    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<number|null>(statusBeforeNavigation?.status ? statusBeforeNavigation.status : 1)

    const getShippingDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocuments",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
                status: status
            },
            freightForwarderId: user.id
        };
        if(searchValue) {request.params.SearchString = searchValue; setStatus(null);}
        if(status) request.params.status = status
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setRecords(res)
                setTotalItems(response.data.totalCount)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }
   
    const row = shippingDocuments.map((data: any, index:number) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td>{ data.referenceNumber }</td>
                            <td>{ data.shippingNumber }</td>
                            <td>{ data.consolidatedPackingList?.modeOfShipping }</td>
                            {data.estimatedTimeOfDelivery && <td>
                                <div className='d-flex-2'>
                                    <span className='material-symbols-rounded' style={{fontSize: "16px"}}>calendar_month</span> 
                                    <span>{formatDateTime(data.estimatedTimeOfDelivery).substring(0, 10)}</span>
                                </div>
                            </td>}
                            {!data.estimatedTimeOfDelivery && <td>
                                <button className='blue-text d-flex-2' 
                                    onClick={() => {setIsUpdateModal(true); setFormData({...formData, shippingDocumentId: data.id}); setSelection("Estimated")}} 
                                    >
                                    <span className='material-symbols-rounded' style={{fontSize: "16px"}}>edit_calendar</span> 
                                    <span>Set Date</span>
                                </button>                                
                            </td>}
                            {data.actualTimeOfDelivery && <td>
                                <div className='d-flex-2'>
                                    <span className='material-symbols-rounded' style={{fontSize: "16px"}}>calendar_month</span> 
                                    <span>{formatDateTime(data.actualTimeOfDelivery).substring(0, 10)}</span>
                                </div>
                            </td>}
                            {!data.actualTimeOfDelivery && <td>
                                <button className='blue-text d-flex-2'
                                disabled={!data.estimatedTimeOfDelivery}
                                    onClick={() => {setIsUpdateModal(true); setFormData({...formData, shippingDocumentId: data.id}); setSelection("Actual")}} 
                                    >
                                    <span className='material-symbols-rounded' style={{fontSize: "16px"}}>edit_calendar</span> 
                                    <span>Set Date</span>
                                </button>                                
                            </td>}
                            {status===4 && <td>
                                {(data?.vesselName && data?.containerDescription) && 
                                <div className='d-flex-2'>
                                    <span className="material-symbols-rounded text-green fw-500" style={{fontSize: "16px"}}>check</span>
                                    <span>Shipped</span>
                                </div>
                                }
                                {!(data?.vesselName && data?.containerDescription) && 
                                <div className='d-flex-2'>
                                    <span className="material-symbols-rounded text-yellow fw-600" style={{fontSize: "16px"}} >hourglass_top</span>
                                    <span>Awaiting Shipment</span>
                                </div>
                                }
                            </td>}
                            <td>
                                {
                                    data?.shippingDocumentAttachments?.length > 0 ?
                                    formatDateTime(data?.shippingDocumentAttachments[data?.shippingDocumentAttachments?.length - 1]?.createdDate) : "N/A"
                                }    
                            </td>
                            <td>
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button
                                        onClick={() => navigate(`/freightforwarder/shippingdocuments/${data.id}`, {state: {status: status}})}
                                        >View Documents</button>
                                               
                                        {/* {status !== 2 ? "Upload" : "Reupload"}                               */}
                                        {status !== 2 && <button
                                        // disable button if drafts or final documents have been uploaded and awaiting transit 
                                        disabled={(status === 1 && data?.shippingDocumentAttachments.length) || status === 4}
                                        onClick={() => {setIsUploadModal(true); setFormData({...formData, shippingDocumentId: data.id, trasitOfficerValidation: data?.trasitOfficerValidation})}}
                                        >Upload {data.trasitOfficerValidation === null ? "For Approval" : "Final"}</button>}

                                        {/* if document has an issue */}
                                        {status === 2 && <button
                                        onClick={() => {setIsUploadModal(true); setFormData({...formData, shippingDocumentId: data.id, trasitOfficerValidation: data?.trasitOfficerValidation})}}
                                        >Reupload {data.trasitOfficerValidation === null ? "For Approval" : "Final"}</button>}

                                        {(status === 4 && (!data?.vesselName && !data?.containerDescription)) && <button
                                            disabled={data?.vesselName && data?.containerDescription}
                                            onClick={() => {
                                                setIsConfirmShipmentModal(true); 
                                                setFormData({...formData, shippingDocumentId: data.id})
                                            }}
                                        >Confirm Shipment</button> }                                        
                                        <button
                                            // disabled={status === 4}
                                            onClick={() => {setChatData({...chatData, shippingDocumentId: data.id, freightForwarderId: data.freightForwarderId, localClearingAgentId: data.localClearingAgentId}); setOpenChatHistory(true); getShippingChatHistory(data.id, user?.id)} }>
                                            Send | View Chats
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

    const handleUpload = (event: FormEvent) => {
        event.preventDefault()
        const form = new FormData()        
        form.append("combinedCertificateValueOrigin", formData.combinedCertificateValueOrigin)
        form.append("billOfLadingOrAirWayBill", formData.billOfLadingOrAirWayBill)
        form.append("shippingDocumentId", formData.shippingDocumentId)        
        if(status === 1) form.append("referenceNumber", formData.referenceNumber)        
        
        setIsSubmitting(true)
        var request:Record<string, any> = {
            what: (status === 1 || formData.trasitOfficerValidation === null) ? "UploadDraftShippingDocuments" : "UploadShippingDocuments",
            data: form
        };      

        makePostRequest(request)
            .then((response: any) => {  
                setIsSubmitting(false)                   
                toast.success(response.msg) 
                setIsUploadModal(false) 
                clearData()
                getShippingDocuments()                            
            })
                .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
    }

    const [isUpdateModal, setIsUpdateModal] = useState(false)

    const handleSetTimeOfDelivery = (event: FormEvent) => { 
        event.preventDefault()      
        setIsSubmitting(true)
        var request:Record<string, any> = {
            what: selection === "Actual" ? "setActualTimeOfDelivery" : "setEstimatedTimeOfDelivery",
            data: {
                shippingDocumentId: formData.shippingDocumentId,
                deliveryDate: selection === "Actual" ? formData.actualTimeOfDelivery : formData.estimatedTimeOfDelivery
            }
        };      

        makePatchRequest(request)
            .then((response: any) => {  
                setIsSubmitting(false)                   
                toast.success(response.msg) 
                setIsUpdateModal(false) 
                clearData()
                setSelection("")
                getShippingDocuments()                            
            })
            .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
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
                getShippingDocuments()
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }

    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)

    const getShippingChatHistory = (shippingDocumentId: string, freightForwarderId: string) => {
        setIsChatLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentChatHistory",
            params: {
                shippingDocumentId: shippingDocumentId,
                sender: freightForwarderId,
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

    const [isConfirmShipmentModal, setIsConfirmShipmentModal] = useState(false)
    const handleShipmentConfirmation = () => {
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "ChangeShippedItemsStatus",
            data: {
                shippingDocumentId: formData.shippingDocumentId,
                shipped: true,
                vesselName: formData2.vesselName,
                containerDescription: formData2.containerDescription
            }
        };
        
        makePatchRequest(request)
            .then(() => {
                toast.success("Shipment Confirmed Successfully!")
                setIsSubmitting(false)
                setIsConfirmShipmentModal(false)
                clearData()
                getShippingDocuments()
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsSubmitting(false)}
            );
    }

    useEffect(() => {
        if(accessToken) getShippingDocuments()            
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue, status])

    const page = "Shipping Documents"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>     
                    <div className="main-inner">
                        <div className="main-inner-top">
                            <div className="d-flex">
                                <div className="search-container left-item">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="search" placeholder="Search Shipping Number" onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <div className="d-flex page-filter">
                                <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                <div className={status === 1 ? "orange active": "orange"} onClick={() => setStatus(1)}>
                                {status === 1 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Open</div>

                                <div className={status === 2 ? "red active": "red"} onClick={() => setStatus(2)}>
                                {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Issues</div>

                                <div className={status === 3 ? "green active": "green"} onClick={() => setStatus(3)}>
                                {status === 3 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Approved Drafts</div>

                                <div className={status === 4 ? "blue active": "blue"} onClick={() => setStatus(4)}>
                                {status === 4 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Final Documents</div>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>BL/AWB Number</th>
                                        <th>Shipment Number</th>
                                        {/* <th>Cons. Commercial Invoice N<sup>o</sup></th>
                                        <th>Cons. Packing List N<sup>o</sup></th> */}
                                        <th>Shipping Mode</th>
                                        <th title='Estimated Time of Delivery'>ETD</th>
                                        <th title='Actual Time of Delivery'>ATD</th>
                                        {status === 4 && <th>Shipment Status</th>}
                                        <th>Last Upload Date</th>
                                        <th style={{width: "180px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? null : (
                                            shippingDocuments?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                            : row
                                        )
                                    }
                                </tbody>
                            </table>
                            {isLoading ? <div className="loader">
                                        <img src={loading} alt="loading" />
                                        <p>Loading data...</p>
                                    </div> : null}
                        </div>
                        <div className="pagination-container">
                            <Pagination
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                            totalPages={totalPages}
                            handlePrevious={handlePrevious}
                            handleNext={handleNext}
                            setCurrentPage={setCurrentPage}
                            getPageNumbers={getPageNumbers}
                            setItemsPerPage={setItemsPerPage} />
                        </div>
                    </div>                 
                </div>

                <Modal isOpen={isUploadModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>{status === 2 ? "Reupload": "Upload"} Shipping Documents</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setIsUploadModal(false); clearData()}}>close</span>
                    </div>
                    <form className='form-view-container' style={{padding: "0", margin: "0"}} onSubmit={handleUpload}>                        
                        <div className="modal-body d-grid-2 mt-2" style={{maxHeight: "400px", overflowY: "auto"}}>
                            <div className='form-item span-col-1'>
                                <label className='d-flex' style={{justifyContent: "left"}}>
                                    <span className="errorX mr-2">*</span> BL/AWB {(status === 1 || formData.trasitOfficerValidation === null) ? "Draft": null} (.zip, .pdf)
                                    <span className="material-symbols-outlined ml-2" style={{color: "#007AFF", fontSize: "14px"}} title='Bill Of Lading/Air Way Bill'>info</span>
                                </label>
                                <input name="billOfLadingOrAirWayBill" type='file' accept='.zip, .pdf' onChange={handleFileChange} required={status !== 2} />                             
                            </div>

                            <div className='form-item span-col-1'>
                                <label>{status !== 2 && <span className="errorX mr-2">*</span>}CCVO {(status === 1  || formData.trasitOfficerValidation === null) ? "Draft": null} (.zip, .pdf) </label>
                                <input name="combinedCertificateValueOrigin" type='file' accept='.zip, .pdf' onChange={handleFileChange} required={status !== 2} />                            
                            </div>
                            
                            {status === 1 && <div className='form-item span-col-2'>
                                <label className='d-flex' style={{justifyContent: "left", borderTop: "1px solid #E5E5E5", paddingTop: "10px"}}>
                                    <span className="errorX mr-2">*</span> BL/AWB Number 
                                    <span className="material-symbols-outlined ml-2" style={{color: "#007AFF", fontSize: "14px"}} title='Bill Of Lading/Air Way Bill Number'>info</span>
                                </label>
                                <input name="referenceNumber" required={status === 1} onChange={(event: any) => setFormData({...formData, referenceNumber: event.target.value})} value={formData.referenceNumber} />
                            </div>}
                        </div>  
                        <div className="modal-footer bt-1">
                            <button type='button' className="custom-button grey-outline"
                                onClick={() => {setIsUploadModal(false); clearData()}}>Cancel</button>
                            <button disabled={isSubmitting} type="submit" className="custom-button orange"
                                >{isSubmitting ? "Loading..." : "Submit"}</button>
                        </div>
                    </form>
                </Modal>

                <Modal isOpen={isUpdateModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Set Time of Delivery</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setIsUpdateModal(false); setSelection("")} }>close</span>
                    </div>
                    <form onSubmit={handleSetTimeOfDelivery}>                    
                    <div className="modal-body" style={{ minHeight: "80px"}}>
                        {/* <div style={{fontSize: "12px"}}>
                            <label><span className="errorX mr-2">*</span>Time</label><br />
                            <input type="radio" checked={selection === "Estimated"} name="selection" value="Estimated" onChange={(e) => setSelection(e.target.value)} /> Estimated
                            <input type="radio" checked={selection === "Actual"} name="selection" value="Actual" onChange={(e) => setSelection(e.target.value)} /> Actual
                        </div> */}

                        <div>
                            <label>
                                <span className="errorX mr-2">*</span>
                                {selection} Time of Delivery
                            </label>
                            {selection === "Estimated" && <input 
                                type='date' 
                                required={selection === "Estimated"}
                                value={formData.estimatedTimeOfDelivery} 
                                onChange={(e) => setFormData({...formData, estimatedTimeOfDelivery: e.target.value})} />}

                            {selection === "Actual" && <input 
                                type='date' 
                                required={selection === "Actual"}
                                value={formData.actualTimeOfDelivery} 
                                onChange={(e) => setFormData({...formData, actualTimeOfDelivery: e.target.value})} />}
                        </div>
                        
                    </div>
                    <div className="modal-footer bt-1">
                        <button type='button' className="custom-button grey-outline"
                            onClick={() => {setIsUpdateModal(false); setSelection("")}}>Cancel</button>
                        <button 
                            disabled={isSubmitting} 
                            type="submit" 
                            className="custom-button orange">{isSubmitting ? "Loading..." : "Submit"}</button>
                    </div>
                    </form>
                </Modal>

                <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Chats</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatHistory(false); clearChatData()} }>close</span>
                    </div>
                    
                    <div className="modal-body" style={{ minHeight: "200px"}}>
                        {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && 
                        <div className='chat-container'>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                        <label className='title'>{chat.sender === user?.id ? "Freight Forwarder" : "Transit Team"}</label>
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
                    {!chatData?.localClearingAgentId && <form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder="Message for Transit Team..." 
                            rows={4} 
                            maxLength={300}
                            onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                            value={chatData.comment} 
                            required >
                        </textarea>
                        <button type="submit" 
                        disabled={isSubmitting || !chatData.comment}
                        className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
                    </div>
                    <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>    
                    </form>}
                </Modal>

                <Modal isOpen={isConfirmShipmentModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Shipment Confirmation</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setIsConfirmShipmentModal(false); setIsSubmitting(false); clearData()}}>close</span>
                    </div>
                    <div className='modal-body'>
                        <div className="alert alert-info" style={{margin: "12px 0", padding: "8px", width: "auto"}}>
                            <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                            <p style={{margin: 0}}>You are confirming that this shipment is en route to its destination.</p>
                        </div>
                        <label><span className="errorX mr-2">*</span>Vessel Name</label>
                        <input style={{marginBottom: "8px"}} type="text" name="vesselName" value={formData2.vesselName} onChange={handleChange} />

                        <label><span className="errorX mr-2">*</span> Container Description</label>
                        <input type="text" name="containerDescription" value={formData2.containerDescription} onChange={handleChange} />
                    </div>
                    <div className="modal-footer bt-1">
                        <button type="button" className="custom-button grey-outline"
                            onClick={() => setIsConfirmShipmentModal(false)}>Cancel</button>
                        <button type="submit" 
                            onClick={() => handleShipmentConfirmation()}
                            disabled={isSubmitting}
                            className="custom-button orange">{isSubmitting ? "Loading..." : "Confirm"}</button>
                    </div>
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default ShippingDocuments