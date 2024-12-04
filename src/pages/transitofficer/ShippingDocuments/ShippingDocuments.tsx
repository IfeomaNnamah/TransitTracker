import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Link } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect, FormEvent } from "react";
import { makeGetRequest, makePatchRequest } from "../../../request";
import { useDispatch, useSelector } from "react-redux";
import { customStyles, formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from '../../Layout';
import Modal from "react-modal"
import { useLocation, useNavigate } from 'react-router-dom';
import { setPageContext } from 'store/pageContext';

const ShippingDocuments =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };
    const queryParams = new URLSearchParams(window.location.search)
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    // const roles:any = useSelector((state: any) => state.roles.value);
    const [shippingDocuments, setRecords] = useState<Record <string, any>>([]) 
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

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
        if(!value) {setSearchValue(""); setStatus(1)}
    }

    const handleChange = (event: any) => {        
        const { name, value } = event.target //get data form each input on change

        setFormData(values => ({...formData, [name]: value})) //set retrieved values to "formData" object 

        if(name === "receiver") getShippingChatHistory(value)
    }
    
    const [formData, setFormData] = useState({
        documentName: "",
        document: "",
        shippingDocumentId: "", 
        freightForwarderId: "", 
        localClearingAgentId: "",
        portOfficerStatus: "",
        receiver: "",
        comment: "",
        attachments: []
    })

    const clearData = () => {
        setFormData({
            documentName: "",
            document: "",
            shippingDocumentId: "",
            freightForwarderId: "", 
            localClearingAgentId: "",
            portOfficerStatus: "",
            receiver: "",
            comment: "",
            attachments: []
        })
    }

    const [isLoading, setIsLoading] = useState(false)
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openChatModal, setOpenChatModal] = useState(false)
    const [status, setStatus] = useState<number | null>(statusBeforeNavigation?.status ? statusBeforeNavigation.status : queryParams.get("status") ? Number(queryParams.get("status")) : 1)
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const getShippingDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocuments",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
            }
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
                toast.error(error.msg)
            );
    }

    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "AddCommentForShippingDocuments",
            data: {
                id: formData.shippingDocumentId,
                comment: formData.comment,
                sender: "TransitOfficer",
                senderRole: "Transit Officer",
                receiver: formData.receiver === "Freight Forwarder" ? formData.freightForwarderId :
                            formData.receiver === "Local Clearing Agent" ? formData.localClearingAgentId : "",
                receiverRole: formData.receiver === "Freight Forwarder" ? "Freight Forwarder" :
                            formData.receiver === "Local Clearing Agent" ? "Local Clearing Agent" : ""
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                clearData()
                toast.success("Chat Sent Successfully!")
                setOpenChatHistory(false)
                getShippingDocuments()
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }

    const [chats, setChats] = useState<Record <string, any>>([])
    const getShippingChatHistory = (selectedReceiver: string) => {
        setIsChatLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentChatHistory",
            params: {
                shippingDocumentId: formData.shippingDocumentId,
                sender: "TransitOfficer",
                receiver: selectedReceiver === "Freight Forwarder" ? formData.freightForwarderId :
                            selectedReceiver === "Local Clearing Agent" ? formData.localClearingAgentId : ""
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
   
    const row = shippingDocuments?.map((data: any, index:number) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td>{ data.referenceNumber }</td>
                            <td>{ data.shippingNumber }</td>
                            <td>{ data.consolidatedPackingList?.modeOfShipping }</td>
                            <td>
                                <div className='d-flex-2'>
                                {data.estimatedTimeOfDelivery && <span className='material-symbols-rounded' style={{fontSize: "16px"}}>calendar_month</span>} 
                                    <span>{formatDateTime(data.estimatedTimeOfDelivery).substring(0, 10)}</span>
                                </div>
                            </td>
                            <td>
                                <div className='d-flex-2'>
                                {data.actualTimeOfDelivery && <span className='material-symbols-rounded' style={{fontSize: "16px"}}>calendar_month</span>} 
                                    <span>{formatDateTime(data.actualTimeOfDelivery).substring(0, 10)}</span>
                                </div>    
                            </td>  
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
                                        <button onClick={() => 
                                            {navigate(`/transitofficer/shippingdocuments/${data.id}`, {state: {status: status}} );
                                            dispatch(setPageContext({url: ""}))}}
                                        >View Documents</button>

                                        <button 
                                            onClick={() => {setOpenChatHistory(true); 
                                            setFormData({...formData, shippingDocumentId: data.id, freightForwarderId: data.freightForwarderId, localClearingAgentId: data.localClearingAgentId, attachments: data.shippingDocumentAttachments, portOfficerStatus: data.portOfficerStatus})}}>
                                            Send | View Chats
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })


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
                            <div className='d-flex' style={{gap: "16px"}}>
                                <div className="d-flex page-filter">
                                    <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                    <div className={status === 1 ? "orange active": "orange"} onClick={() => {setStatus(1); setCurrentPage(1)}}>
                                    {status === 1 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Open</div>

                                    <div className={status === 2 ? "red active": "red"} onClick={() => {setStatus(2); setCurrentPage(1)}}>
                                    {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Issues</div>

                                    <div className={status === 3 ? "green active": "green"} onClick={() => {setStatus(3); setCurrentPage(1)}}>
                                    {status === 3 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Approved Drafts</div>

                                    <div className={status === 4 ? "blue active": "blue"} onClick={() => {setStatus(4); setCurrentPage(1)}}>
                                    {status === 4 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Final Documents</div>
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
                                        <th title='Estimated Time of Delivery'>ETD</th>
                                        <th title='Actual Time of Delivery'>ATD</th>
                                        {status===4 && <th>Shipment Confirmed</th>}
                                        <th>Last Upload Date</th>
                                        <th style={{width: "116px"}}>Action</th>
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

                <Modal isOpen={openChatModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Send Chat</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatModal(false); setIsSubmitting(false); clearData()}}>close</span>
                    </div>
                    <form onSubmit={handleSendChat}>
                    <div className="modal-body">
                        <div>
                            <label>
                                <span className="errorX mr-2">*</span> Reciever
                            </label>
                            <select value={formData.receiver} name="receiver" 
                                onChange={(event) => setFormData({...formData, receiver: event.target.value})} required>
                                <option value="" disabled>--Select--</option>
                                <option value="Freight Forwarder">Freight Forwarder</option>
                                <option value="Local Clearing Agent">Local Clearing Agent</option>
                            </select>

                            <div className='mt-1'>
                                <label>
                                    <span className="errorX mr-2">*</span> Message
                                </label>  
                                <textarea 
                                    className="mt-1" 
                                    name="comment" 
                                    placeholder="Write a message..." 
                                    rows={4} 
                                    maxLength={300}
                                    onChange={handleChange}
                                    value={formData.comment} 
                                    required ></textarea>
                            </div>
                        </div> 
                        <small style={{fontSize: "10px"}} className={formData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{formData.comment.length}/300 Characters</small> 
                    </div>
                    <div className="modal-footer bt-1">
                        <button type="button" className="custom-button grey-outline"
                            onClick={() => {setOpenChatModal(false); clearData()}}>Cancel</button>
                        <button type="submit" 
                        disabled={isSubmitting}
                        className="custom-button orange">{isSubmitting ? "Loading..." : "Send Chat"}</button>
                    </div>
                    </form>
                </Modal>

                <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Chats</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearData()} }>close</span>
                    </div>
                    <div className="modal-body" style={{ minHeight: "300px"}}>
                        <label><span className='errorX mr-2'>*</span>Entity</label>
                        <select value={formData.receiver} onChange={handleChange} name='receiver' required>
                            <option value="" disabled>--Select--</option>
                            <option value="Freight Forwarder">Freight Forwarder</option>
                            <option value="Local Clearing Agent">Local Clearing Agent</option>
                        </select>

                        {!formData.receiver && <p>No source selected yet.</p>}
                        {(!isChatLoading && formData.receiver && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && formData.receiver && 
                        <div className='chat-container mt-1' style={{maxHeight: "250px"}}>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === "TransitOfficer" ? "right" : "left"}`}>
                                        <label className='title'>{chat.sender === "TransitOfficer" ? "Transit Team" : formData.receiver}</label>
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
                    {/* Don't allow sending of chat to Freight Forwarder after LCA Assignment */}
                    {((formData?.localClearingAgentId === null && formData.receiver === "Freight Forwarder")
                    || (formData?.localClearingAgentId !== null && formData.receiver === "Local Clearing Agent")) &&
                    formData?.portOfficerStatus === null &&
                    <form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder={`Message for ${formData.receiver === "Freight Forwarder" ? "Freight Forwarder" : formData.receiver === "Local Clearing Agent" ? "Local Clearing Agent" : ""}...`}
                            rows={4} 
                            maxLength={300}
                            onChange={handleChange}
                            value={formData.comment} 
                            required ></textarea>
                        <button type="submit" 
                        disabled={isSubmitting || !formData.comment}
                        className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
                    </div>
                    <small style={{fontSize: "10px"}} className={formData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{formData.comment.length}/300 Characters</small>
                    <div className="alert alert-warning" style={{margin: "12px 0 0 0 ", padding: "8px", width: "auto", alignItems: "start"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#e4b14b", fontSize: "16px"}}>warning</span>
                        <div style={{fontSize: "10.5px"}}>
                            <p style={{margin: 0, marginBottom: "4px"}}>Keep in mind information</p>
                            <span style={{fontWeight: "300"}}>Sending a chat requires the receiver to reupload the stated shipping document(s) before approval. Avoid initiating if no reupload is needed.</span>
                        </div>
                    </div>
                    </form>}
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default ShippingDocuments