import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Link } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect, FormEvent } from "react";
import { makeGetRequest, makePatchRequest } from "../../../request";
import { useSelector } from "react-redux";
import { ClearingProcessStatus, customStyles, formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from '../../Layout';
import Modal from "react-modal"
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';

const ShippingDocuments =  () => {
    const navigate = useNavigate()
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };

    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const roles:any = useSelector((state: any) => state.roles.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const [shippingDocuments, setRecords] = useState<Record <string, any>>([])    
    const [isClearingStatusModal, setIsClearingStatusModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentClearingProcessStatus, setCurrentCLearingProcessStatus] = useState<Record <string, any>>([])
    const [formData, setFormData] = useState({
        documentName: "",
        document: "",
        shippingDocumentId: "",    
        actualTimeOfDelivery: "" ,
        attachments: []   
    })
    const [clearingAgentWaybillNumber, setClearingAgentWaybillNumber] = useState("")
    const [chatData, setChatData] = useState({
        shippingDocumentId: "", 
        localClearingAgentStatus: 0, 
        localClearingAgentId: "",
        receiver: "",
        comment: "",
    })
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const clearData = () => {
        setFormData({
            documentName: "",
            document: "",
            shippingDocumentId: "",   
            actualTimeOfDelivery: "",
            attachments: []   
        })
    }

    const clearChatData = () => {
        setChatData({
            shippingDocumentId: "", 
            localClearingAgentStatus: 0, 
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
    const [status, setStatus] = useState<number|null>(statusBeforeNavigation?.status ? statusBeforeNavigation.status : 1)
    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const [isLoading, setIsLoading] = useState(false)
    const getShippingDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentsForLocalClearingAgent",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
                LocalClearingAgentId: user.id
            },
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
                            <td>{ data.consolidatedCommercialInvoice?.destination }</td>
                            <td>{ data.clearingProcessStatuses.length > 0 ? data.clearingProcessStatuses[data.clearingProcessStatuses.length - 1].status : null }</td>
                            <td>
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button
                                            onClick={() => navigate("/localclearingagent/shippingdocuments/"+data.id, {state: {status: status}})}
                                            >View {status !== 3 ? "| Upload " : ""}Documents</button>
                                        <button
                                            onClick={() => {setIsClearingStatusModal(true); setCurrentCLearingProcessStatus(data.clearingProcessStatuses); setFormData({...formData, shippingDocumentId: data.id})}}
                                            >{status !== 3 ? "Update " : ""}Clearing Process Status</button>
                                        
                                        <button
                                            disabled={data.localClearingAgentStatus === 3}
                                            onClick={() => {
                                                setOpenChatHistory(true); 
                                                getShippingChatHistory(data.id, user?.id);
                                                setChatData({...chatData, shippingDocumentId: data.id, localClearingAgentId: data.localClearingAgentId, localClearingAgentStatus: data.localClearingAgentStatus})}}
                                            >
                                            Send | View Chats
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

    const [isUpdating, setIsUpdating] = useState(false)
    const UpdateClearingProcessStatus = (status: string) => {
        setIsUpdating(true)
        var request:Record<string, any> = {
            what: "UpdateClearingProcessStatus",
            data: {
                shippingDocumentId: formData.shippingDocumentId,
                status: status,
                // add conditonally if the status is set to "Readiness To Transfer To Total Energies Yard"
                ...(clearingAgentWaybillNumber && { clearingAgentWaybillNumber: clearingAgentWaybillNumber })
            }
        };      

        makePatchRequest(request)
            .then((response: any) => {  
                setIsUpdating(false)  
                if(clearingAgentWaybillNumber) setClearingAgentWaybillNumber("") //clear value                 
                toast.success(response.msg) 
                setIsClearingStatusModal(false) 
                getShippingDocuments()                            
            })
            .catch((error:any) => {toast.error(error.msg); setIsUpdating(false)});
    }

    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [openChatHistory, setOpenChatHistory] = useState(false)
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
                                    <input id="search" placeholder="Search Shipping Documents" onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <div className='d-flex' style={{gap: "16px"}}>
                                <div className="d-flex page-filter">
                                    <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                    <div className={status === 1 ? "orange active": "orange"} onClick={() => setStatus(1)}>
                                    {status === 1 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Open</div>

                                    <div className={status === 2 ? "red active": "red"} onClick={() => setStatus(2)}>
                                    {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Issues</div>

                                    <div className={status === 3 ? "green active": "green"} onClick={() => setStatus(3)}>
                                    {status === 3 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Closed</div>
                                </div>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>BL/AWB Number</th>
                                        <th>Shipment Number</th>
                                        <th>Shipping Mode</th>
                                        <th>Destination</th>
                                        <th>Current Clearing Status</th>
                                        <th style={{width: "195px"}}>Action</th>
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

                <Modal isOpen={isClearingStatusModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Clearing Process Status</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setIsClearingStatusModal(false); clearData()}}>close</span>
                    </div>
                    <Box sx={{ maxWidth: 400 }}>
                        <Stepper activeStep={
                            currentClearingProcessStatus?.length > 0 ? currentClearingProcessStatus?.length + 1 : 1 }
                            orientation="vertical">
                        {/* <Stepper activeStep={1} orientation="vertical"> */}
                            {ClearingProcessStatus().map((label: any, index: number) => (
                                <Step key={index}>
                                    <StepLabel>{label.name}</StepLabel>
                                    <StepContent>
                                        <Box>
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
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Modal>

                <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Chats</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearData()} }>close</span>
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
                    {chatData?.localClearingAgentStatus !== 3 && <form onSubmit={handleSendChat}>
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
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default ShippingDocuments