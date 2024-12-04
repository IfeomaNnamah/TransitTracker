import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect, FormEvent } from "react";
import { makeGetRequest, makePatchRequest } from "../../../request";
import { useSelector } from "react-redux";
import { customStyles, formatCurrency, formatDateTime, getCurrencySymbol } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from '../../Layout';
import { ModeOfTransportationInfo } from 'interfaces/modeoftransportation';
import Modal from "react-modal"

const ModeOfTransportation =  () => {
    const navigate = useNavigate()
    const user:any = useSelector((state: any) => state.tepngUser.value);

    // VARIABLE DEFINITIONS
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [mot, setRecords] = useState<ModeOfTransportationInfo[]>()
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);      
    const [searchValue, setSearchValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // FUNCTIONS
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const handlePrevious = () => {if (currentPage > 1) setCurrentPage(currentPage - 1)}
    const handleNext = () => {if (currentPage < totalPages) setCurrentPage(currentPage + 1)}
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {pageNumbers.push(i);}
        return pageNumbers;
    };  
    
    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const getMOT = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getAllModeOfTransportation",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                userId: user.id,
                OrderBy: 2
            }
        };
        if(searchValue) {request.params.SearchString = searchValue;}
        
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

    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chatData, setChatData] = useState({
        modeOfTransportationId: "", 
        entityRepresentativeId: "",
        comment: "",
        selectedModeOfTransportation: {
            requesterManagerApproval: "",
            requesterGeneralManagerApproval: "",
            approval: {
                reason: "",
            },
        },
    })
    const clearChatData = () => {
        setChatData({
            modeOfTransportationId: "", 
            entityRepresentativeId: "", 
            comment: "",
            selectedModeOfTransportation: {
                requesterManagerApproval: "",
                requesterGeneralManagerApproval: "",
                approval: {
                    reason: "",
                },
            },
        })
    }
    //replace in approvers api
    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request = {
            what: "AddCommentForModeOfTransportation",
            data: {
                modeOfTransportationId: chatData.modeOfTransportationId,
                comment: chatData.comment,
                sender: user?.id,
                senderRole: "Entitiy Representative",
                receiver: "Approvers"
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                clearChatData()
                toast.success("Chat Sent Successfully!")
                setOpenChatHistory(false)
                getMOT()
            })
            .catch((error) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    } 
    
    const getMotChatHistory = (modeOfTransportationId: string) => {
      setIsChatLoading(true)
      var request = {
          what: "ModeOfTransportationChatHistory",
          params: {
              modeOfTransportationId: modeOfTransportationId,
              orderBy: 1
          }
      };
      
      makeGetRequest(request)
          .then((response: any) => {
              setIsChatLoading(false)
              const res = response.data.data
              setChats(res.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()))
          })
          .catch((error) => 
              {toast.error(error.msg); setIsChatLoading(false)}
          );
    }

    const approvalText = (response: string|null) => {
        switch(response?.toLocaleUpperCase()){
            case "APPROVED":
                return "Approved"
    
            case "REJECTED":
                return "Rejected"
            
            default:
                return null
        }
    }
    
    const approvalStyling = (response: string) => {
        switch(response?.toLocaleUpperCase()){
            case "APPROVED":
                return "uppercase text-green"
    
            case "REJECTED":
                return "uppercase text-red"
            
            default:
                return null
        }
    }

    // LIST MOTS
    const row = mot?.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            {/* <td>{ data?.modeOfTransportationPurchaseOrders?.map((po: any) => po.purchaseOrderNumber).join(", ") }</td> */}
                            <td>{
                                data?.purchaseOrderItemRequests
                                ?.map((item: any) => item.purchaseOrderNumber) // Extract the purchaseOrderNumber
                                ?.filter((purchaseOrderNumber: string, index: number, self: string[]) => 
                                    self.indexOf(purchaseOrderNumber) === index // Keep only distinct values
                                )
                                ?.join(", ") // Join distinct numbers with commas
                            }</td>
                            <td>{ formatDateTime(data.createdDate) }</td>
                            <td>{getCurrencySymbol(data.freightCostCurrency)}{ formatCurrency( data.estimatedCostSeaFreight ) }</td>
                            <td>{getCurrencySymbol(data.freightCostCurrency)}{ formatCurrency( data.estimatedCostAirFreight ) }</td>
                            {/* Display pending appover if the request doesn't have a final verdict yet */}                            
                            <td>
                                {
                                    data?.finalApprovalStatus.toLocaleUpperCase() === "PENDING" ?
                                    (
                                        (data?.approval?.find((approver: any) => approver.role?.name === "Executive Director Technical Directorate" && approver.approved === "Approved")) ? "" :
                                        (data?.approval?.find((approver: any) => approver.role?.name === "General Manager Technical Logistics" && approver.approved === "Approved")) ? "Executive Director Technical Directorate" :
                                        (data?.approval?.find((approver: any) => approver.role?.name === "Deputy General Manager Technical Logistics" && approver.approved === "Approved")) ? "GM Technical Logistics" :
                                        // (data?.approval?.find((approver: any) => approver.role?.name === "Transit Manager" && approver.approved === "Approved")) ? "DGM Technical Logistics" :
                                        data?.requesterGeneralManagerApproval === "Approved" ? "DGM Technical Logistics" : 
                                        data?.requesterManagerApproval === "Approved" ? "Entity General Manager" :

                                        (data?.approval?.find((approver: any) => approver.role?.name === "Transit Manager" && approver.approved === "Approved")) ? "Entity Manager" :
                                        data?.shippingOfficerCheck === "Approved" ? "Transit Manager" : "Shipping Officer"
                                    ) : null
                                }
                            </td>
                            <td className={approvalStyling(data?.finalApprovalStatus)??""}>
                                {data?.finalApprovalStatus !== null && <>{approvalText(data?.finalApprovalStatus)}</>}
                            </td>
                            {/* <td>
                               {data.requesterManagerApproval === null && <span className="material-symbols-rounded text-yellow fw-500" >hourglass_top</span>}
                               {data.requesterManagerApproval === "Approved" && <span className="material-symbols-rounded text-green fw-600" >check</span>}
                               {data.requesterManagerApproval === "Review" && <span className="material-symbols-rounded text-blue fw-600" title='Requesting Additional Information' >sms</span>}
                               {data.requesterManagerApproval === "Rejected" && <span className="material-symbols-rounded text-red fw-600" >close</span>}
                                <div className='progress-bar'>
                                    <div className='progress-group'>
                                        <div>
                                            <div className={getApprovalColor(data.requesterManagerApproval)}></div>
                                            <label>Entity Manager</label>
                                            <p>{formatDateTime(data?.requesterManagerDate)}</p>
                                        </div> 
                                        <div>
                                            <div className={data.requesterManagerApproval === null ? "bar" : getApprovalColor(data.requesterGeneralManagerApproval)}></div>
                                            <label>Entity GM/EGM Manager</label>
                                            <p>{data.requesterGeneralManagerApproval !== null ? formatDateTime(data.updatedDate) : ""}</p>
                                        </div>
                                        <div>
                                            <div className={getApprovalColor(data.approval?.approved)}></div>
                                            <label>{getFinalApproverTitle(Number(data.estimatedCostAirFreight))}</label>
                                            <p>{formatDateTime(data.approval?.createdDate)}</p>
                                        </div>
                                    </div>                                    
                                </div>
                            </td> */}
                            <td>         
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button
                                        onClick={() => navigate("/entityrepresentative/modeoftransportationchange/"+data.id)}
                                        >View Documents</button>
                                                                            
                                        <button
                                            onClick={() => {
                                                getMotChatHistory(data.id);
                                                setOpenChatHistory(true)
                                                setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data?.userId, selectedModeOfTransportation: data})
                                            }}
                                            >Send | View Chats
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })

    useEffect(() => {
        if(accessToken) getMOT()
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue])

    const page = "Mode Of Transportation Change"

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
                                    <input id="search" placeholder="Search PO Number" onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <Link to={"/entityrepresentative/create/modeoftransportationchange"} style={{ textDecoration: "none" }}>
                                <button className="custom-button orange">
                                    <span className="material-symbols-rounded fw-600">rule_settings</span>Change Mode Of Transportation
                                </button>
                            </Link>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>Purchase Order Number</th>
                                        <th>Request Date</th>
                                        <th>Estimated Sea Cost</th>
                                        <th>Estimated Air Cost</th>
                                        <th>Pending Approval</th>
                                        <th>Request Status</th>
                                        {/* <th>Entity Manager</th>
                                        <th>Entity GM</th>
                                        <th>Cost Level Approver</th> */}
                                        <th style={{width: "124px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? null : (
                                            mot?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
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
                            onClick={() => {setOpenChatHistory(false); clearChatData()} }>close</span>
                    </div>        
                    <div className="modal-body" style={{ minHeight: "200px"}}>
                        {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && 
                        <div className='chat-container'>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                        <label className='title'>{chat.sender === user?.id ? "Entity Representative" : `${chat.senderRole}` }</label>
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
                    {(chatData.selectedModeOfTransportation?.requesterManagerApproval !== "Reviewed" || chatData.selectedModeOfTransportation?.requesterGeneralManagerApproval !== "Reviewed" || chatData.selectedModeOfTransportation?.approval?.reason !== "Reviewed") &&
                    <form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder="Message for Approvers..." 
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

export default ModeOfTransportation