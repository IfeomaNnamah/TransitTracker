import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect } from "react";
import { makeGetRequest } from "../../../request";
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
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: string };
    const [mot, setRecords] = useState<ModeOfTransportationInfo[]>()
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);      
    const [searchValue, setSearchValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<string>(statusBeforeNavigation?.status ? statusBeforeNavigation.status : "Pending")

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

    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [chatData, setChatData] = useState({
        modeOfTransportationId: "", 
        entityRepresentativeId: "",
        comment: "",
    })
    const clearChatData = () => {
        setChatData({
            modeOfTransportationId: "", 
            entityRepresentativeId: "", 
            comment: "",
        })
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

    const getMOT = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getAllModeOfTransportationForApprover",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
                Status: status,
                Role: "Executive Director Technical Directorate",
                UserId: user.id
            }
        };
        if(searchValue) {request.params.SearchString = searchValue; setStatus("");}
        
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

    // LIST MOTS
    const row = mot?.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
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
                            <td>         
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button 
                                            onClick={() => navigate("/executivedirectortechnicaldirectorate/modeoftransportationchange/"+data.id, {state: {status: status}})} className="actions">
                                            View Details
                                        </button>
                                                                            
                                        <button
                                            onClick={() => {
                                                getMotChatHistory(data.id);
                                                setOpenChatHistory(true)
                                                setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data?.userId})
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
    }, [accessToken, currentPage, itemsPerPage, searchValue, status])

    const page = "Mode Of Transportation"

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

                            <div className="d-flex page-filter">
                                <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                <div className={status === "Pending" ? "orange active": "orange"} onClick={() => setStatus("Pending")}>
                                {status === "Pending" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Pending</div>
                                
                                <div className={status === "Approved" ? "green active": "green"} onClick={() => setStatus("Approved")}>
                                {status === "Approved" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Approved</div>

                                <div className={status === "Review" ? "blue active": "blue"} onClick={() => setStatus("Review")}>
                                {status === "Review" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Review</div>                                  
                                
                                <div className={status === "Rejected" ? "red active": "red"} onClick={() => setStatus("Rejected")}>
                                {status === "Rejected" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Rejected</div> 
                            </div> 
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>Purchase Order Number</th>
                                        <th>Date</th>
                                        <th>Estimated Sea Cost</th>
                                        <th>Estimated Air Cost</th>
                                        <th style={{width: "120px"}}>Action</th>
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
                                        <label className='title'>{(chat.sender === "Approvers" || chat.receiver === "Approvers") ? chat.senderRole : "Entity Representative" }</label>
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
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default ModeOfTransportation