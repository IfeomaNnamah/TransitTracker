import { Link, useNavigate } from "react-router-dom";
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
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);
    const pageContext: any = useSelector((state: any)=> state.pageContext.value)

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
        if(!value) setSearchValue("")
    }

    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<string | number | null>()
    const getMaterialReadinessDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getMRDForSupplier",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                SupplierId: user?.id,
                OrderBy: 2,
            }
        };
        if(searchValue) request.params.SearchString = searchValue
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

    const handleColorChange = () => {
        switch(status){
            case "0": return "#be6f02"
            case "1": return "red"
            case "2": return "green"
        }        
    }

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [openChatModal, setOpenChatModal] = useState(false)

    const [chatData, setChatData] = useState({
        materialReadinessDocumentId: "",
        supplierId: "",
        comment: "",
        materialReadinessDocumentStatus: ""
    })
    const clearChatData = () => {
        setChatData({
            materialReadinessDocumentId: "",
            supplierId: "",
            comment: "",
            materialReadinessDocumentStatus: ""
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
                sender: user?.id,
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: "ExpeditingTeam",
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                getMaterialReadinessDocumentChatHistory(chatData.materialReadinessDocumentId, chatData.supplierId)
                toast.success("Chat Sent Successfully!")
                clearChatData()
                
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }  

    const getMaterialReadinessDocumentChatHistory = (materialReadinessDocumentId: string, supplierId: string) => {
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

    const row = materialreadinessdocument.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td className="text-nowrap">
                                { data.mrdNumber }
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill={handleColorChange()} style={{width: "8px", marginLeft: "6px"}} ><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"/></svg>
                            </td>
                            <td>{ formatDateTime(data.createdDate) }</td>                            
                            <td>{ data?.pickUpAddress }, { data?.countryOfSupply }</td>
                            <td>{ data?.countryOfSupply }</td>
                            <td>{ data?.destination }</td>
                            <td>
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button
                                        onClick={() => {
                                            navigate("/supplier/view/materialreadinessdocument/"+data?.id);
                                            dispatch(setPageContext({page: "Material Readiness Documents", status: status}))
                                        }}                                        
                                        >View Documents</button>
                                        {data.materialReadinessDocumentStatus === "PENDING" && <button
                                            onClick={() => navigate(`/supplier/update/materialreadinessdocument/${data?.id}`)}
                                        >Update MRD</button>}
                                        {/* <button
                                            onClick={() => {setOpenChatModal(true); 
                                            setChatData({...chatData, materialReadinessDocumentId: data?.id, supplierId: data.supplierId})}}>
                                            Send Chat
                                        </button> */}
                                        <button
                                            onClick={() => {
                                                setOpenChatHistory(true); 
                                                getMaterialReadinessDocumentChatHistory(data?.id, data.supplierId);
                                                setChatData({...chatData, materialReadinessDocumentId: data?.id, supplierId: data.supplierId, materialReadinessDocumentStatus: data.materialReadinessDocumentStatus}) }}>
                                            Send | View Chats
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

    const queryParams = new URLSearchParams(window.location.search); 
    useEffect(() => {
        if(queryParams.get("status")) setStatus(queryParams.get("status") ?? '')
        else {
            if(pageContext?.status && ["0","1","2"].includes(pageContext.status)) setStatus(pageContext.status)
            else setStatus("0")
        }// eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(accessToken && status) getMaterialReadinessDocuments();
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
                                <button className="custom-button orange left-item ml-2" style={{height: "36px"}}
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <div style={{display: "flex", gap: "16px", flexWrap: "wrap"}}>
                                <div className="d-flex page-filter">
                                    <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                    <div className={status === "0" ? "orange active": "orange"} onClick={() => {setStatus("0"); dispatch(setPageContext({...pageContext, status: "0"})); setCurrentPage(1)}}>                                
                                    {status === "0" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Open</div>
                                    
                                    <div className={status === "1" ? "red active": "red"} onClick={() => {setStatus("1"); dispatch(setPageContext({...pageContext, status: "1"})); setCurrentPage(1)}}>
                                    {status === "1" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Rejected</div>
                                    
                                    <div className={status === "2" ? "green active": "green"} onClick={() => {setStatus("2"); dispatch(setPageContext({...pageContext, status: "2"})); setCurrentPage(1)}}>
                                    {status === "2" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Approved</div>
                                </div>  
                                <Link to={"/supplier/create/materialreadinessdocument"} style={{ textDecoration: "none" }}>
                                    <button className="custom-button orange">
                                        <span className="material-symbols-rounded fw-600">add</span>Create Material Readiness Document
                                    </button>
                                </Link>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>MRD Number</th>
                                        <th>Issuance Date</th>
                                        {/* <th>Total Batched</th> */}
                                        <th>Pickup Address</th>
                                        <th>Pickup Country</th>
                                        <th>Delivery Destination</th>
                                        <th style={{width: "124px"}}>Action</th>
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
                <Modal isOpen={openChatModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Send Chat</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatModal(false); setIsSubmitting(false); clearChatData()}}>close</span>
                    </div>
                    <form onSubmit={handleSendChat}>
                    <div className="modal-body">
                        <div>
                            <label>
                                <span className="errorX mr-2">*</span> Message
                            </label>  
                            <textarea 
                                className="mt-1" 
                                name="comment" 
                                placeholder="Write a message..." 
                                rows={4} 
                                maxLength={300}
                                onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                                value={chatData.comment} 
                                required ></textarea>
                        </div> 
                        <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small> 
                        <div className="alert alert-info" style={{margin: "12px 0", padding: "8px", width: "auto"}}>
                            <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                            <p style={{margin: 0}}>All involved parties for this material readiness document will have access to the chat within the chat history modal.</p>
                        </div>
                    </div>
                    <div className="modal-footer bt-1">
                        <button type="button" className="custom-button grey-outline"
                            onClick={() => {setOpenChatModal(false); clearChatData()}}>Cancel</button>
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
                            onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearChatData()} }>close</span>
                    </div>
                    
                    <div className="modal-body" style={{ minHeight: "200px"}}>
                        {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && 
                        <div className='chat-container'>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                        <div className="d-flex">
                                            <label className='title'>
                                                {getMaterialReadinessDocumentChatTitle(chat.sender, chat.senderCompany, chat.senderRole)?.split("(")[0]}
                                            </label>
                                            <span className='date'>{formatDateTime(chat.createdDate)}</span>
                                        </div>                                        
                                        {
                                            chat.message.split('|').map((message: string, index: number) => {
                                                return <p key={index}>{message}</p>
                                            })
                                        }
                                        
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
                    {(chatData?.materialReadinessDocumentStatus === "NEW_MATERIAL_READINESS_DOCUMENT" || chatData?.materialReadinessDocumentStatus === "PENDING") 
                    &&<form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder="Write a message..." 
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
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default MaterialReadinessDocument