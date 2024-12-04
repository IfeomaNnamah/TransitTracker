import { useLocation, useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect, FormEvent } from "react";
import { MRDInfo } from "../../../interfaces/materialreadinessdocument.interface";
import Pagination from "../../../components/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { makeGetRequest, makePatchRequest } from "../../../request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customStyles, formatDateTime, getMaterialReadinessDocumentChatTitle } from "../../../helpers";
import Layout from "../../Layout";
import { setPageContext } from "../../../store/pageContext";
import Modal from 'react-modal'

const MaterialReadinessDocument =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const pageContext: any = useSelector((state: any)=> state.pageContext.value)
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [materialreadinessdocument, setRecords] = useState<MRDInfo[]>([])
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

    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<number | null>()
    const getMaterialReadinessDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getMRDs",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                OrderBy: 2
            }
        };
        if(searchValue) {request.params.SearchString = searchValue; setStatus(null);}
        if(status) request.params.Status = status
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                setRecords(res.data)
                setTotalItems(res.totalCount)
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }

    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [chatData, setChatData] = useState({
        materialReadinessDocumentId: "",
        materialReadinessDocumentStatus: "",
        comment: "",
        // supplierId: ""
    })
    const clearChatData = () => {
        setChatData({
            materialReadinessDocumentId: "",
            materialReadinessDocumentStatus: "",
            comment: "",
            // supplierId: ""
        })
    }

    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "AddCommentForMaterialReadinessDocument",
            data: {
                materialReadinessDocumentId: chatData.materialReadinessDocumentId,
                comment: chatData.comment,
                sender: "TransitTeam",
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: "ExpeditingTeam", // flow to c&p to treat
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success("Chat Sent Successfully!")
                getMaterialReadinessDocumentChatHistory(chatData.materialReadinessDocumentId)
                clearChatData()
                setOpenChatHistory(false)
                getMaterialReadinessDocuments()
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    } 

    const getMaterialReadinessDocumentChatHistory = (materialReadinessDocumentId: string) => {
        setIsChatLoading(true)
        var request: Record<string, any> = {
            what: "getMaterialReadinessDocumentChatHistory",
            id: materialReadinessDocumentId,
            params: {
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

    const queryParams = new URLSearchParams(window.location.search); 
    useEffect(() => {
        if(queryParams.get("status")) setStatus(Number(queryParams.get("status")))
        else setStatus(statusBeforeNavigation?.status ? statusBeforeNavigation?.status : 1)
        // eslint-disable-next-line
    }, [])    

    const handleColorChange = () => {
        switch(status){
            case 1: return "#be6f02"
            case 2: return "red"
            case 3: return "#175FDC"
            case 4: return "green"
        }
        
    }

    const row = materialreadinessdocument.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td className="no-textwrap">
                                { data.mrdNumber }
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill={handleColorChange()} style={{width: "8px", marginLeft: "6px"}} ><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"/></svg>
                            </td>
                            <td>{ formatDateTime(data.createdDate) }</td>                            
                            <td>{ data?.commercialInvoices[0].supplier }</td>  
                            <td>{ data?.countryOfSupply }</td> 
                            { (status === 2 || status === 3) &&
                                <>
                                    <td>{ data?.freightForwarder?.companyName }</td> 
                                    <td>{ data?.freightForwarder ? data.freightForwarderSLADays + " Day(s) Left" : "N/A" }</td>  
                                </>
                            }                          
                            <td>{ data?.destination }</td>
                            <td>{ data?.freightForwarder?.companyName }</td>
                            <td>
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button 
                                            onClick={() => navigate("/transitofficer/materialreadinessdocument/"+data.id, {state: {status: status}})}
                                                >View Details</button>
                                        <button
                                            onClick={() => {
                                                setOpenChatHistory(true); 
                                                getMaterialReadinessDocumentChatHistory(data.id);
                                                setChatData({...chatData, materialReadinessDocumentId: data.id, materialReadinessDocumentStatus: data.materialReadinessDocumentStatus})
                                                }}>
                                            Send | View Chats
                                        </button>
                                        {data?.materialReadinessDocumentStatus === "ASSIGNED_TO_FREIGHT_FORWARDER" && <button 
                                            onClick={() => navigate("/transitofficer/reassignmaterialreadinessdocument/"+data.id)}>Reasssign</button>}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

    useEffect(() => {
        if(accessToken && status !== undefined) getMaterialReadinessDocuments()
        // eslint-disable-next-line
    }, [currentPage, itemsPerPage, searchValue, accessToken, status])

    const page = "Material Readiness Documents"

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
                                    <input id="search" placeholder="Search MRD Number" onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <div className="d-flex page-filter">
                                <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                <div className={status === 1 ? "orange active": "orange"} onClick={() => {setStatus(1); dispatch(setPageContext({...pageContext, status: 1})); setCurrentPage(1)}}>
                                {status === 1 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Unassigned</div>                               
                                
                                <div className={status === 2 ? "blue active": "blue"} onClick={() => {setStatus(2); dispatch(setPageContext({...pageContext, status: 2})); setCurrentPage(1)}}>
                                {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Assigned</div>

                                <div className={status === 3 ? "purple active": "purple"} onClick={() => {setStatus(3); dispatch(setPageContext({...pageContext, status: 3})); setCurrentPage(1)}}>
                                {status === 3 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Picked</div>

                                <div className={status === 4 ? "green active": "green"} onClick={() => {setStatus(4); dispatch(setPageContext({...pageContext, status: 4})); setCurrentPage(1)}}>
                                {status === 4 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    POC Generated</div>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>MRD Number</th>
                                        <th>Issuance Date</th>
                                        <th>Supplier</th>                            
                                        <th>Country of Supply</th>
                                        { (status === 2 || status === 3) && 
                                            <>
                                                <th>Freight Forwarder</th>
                                                <th>Freight Forwarder SLA</th>
                                            </>
                                        }
                                        <th>Destination</th>
                                        <th>Freight Forwarder</th>
                                        <th style={{width: "116px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {isLoading ? null : (
                                        materialreadinessdocument?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
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
                <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Chats</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearChatData()} }>close</span>
                    </div>
                    
                    <div className="modal-body" style={{ minHeight: "150px"}}>
                        {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && 
                        <div className='chat-container' style={{maxHeight: "250px"}}>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === "TransitTeam" ? "right" : "left"}`}>
                                        <label className='title'>
                                            {getMaterialReadinessDocumentChatTitle(chat.sender, chat.senderCompany, chat.senderRole)}
                                        </label>
                                        {
                                            chat.message.split('|').map((message: string, index: number) => {
                                                return <p key={index}>{message}</p>
                                            })
                                        }
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
                    {chatData?.materialReadinessDocumentStatus === "UNASSIGNED" && 
                    <form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder="Message for supplier..." 
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
                    <div className="alert alert-warning" style={{margin: "12px 0 0 0 ", padding: "8px", width: "auto", alignItems: "start"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#e4b14b", fontSize: "16px"}}>warning</span>
                        <div style={{fontSize: "10.5px"}}>
                            <p style={{margin: 0, marginBottom: "4px"}}>Keep in mind information</p>
                            <span style={{fontWeight: "300"}}>Sending a chat would route the material readiness document back to the expediting team and the supplier would be mandated to update the document. Avoid initiating if no update is needed.</span>
                        </div>
                    </div>
                    </form>}
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default MaterialReadinessDocument