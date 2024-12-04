import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loading from "../../assets/images/loading.gif"
import { formatDateTime } from "helpers"
import Layout from "../Layout"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import Pagination from "../../components/Pagination";
import { makeGetRequest, makePatchRequest } from "request";
import { useNavigate } from 'react-router-dom';

const Notifications =  () => {
    const navigate = useNavigate()
    const accessToken:any = useSelector((state: any) => state.accessToken.value); 
    
    const [searchValue, setSearchValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [selectedTab, setSelectedTab] = useState('shipping')
    const [dateRange, setDateRange] = useState<number | string>("")
    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

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

    const getShipmentNotifications = (isLoading:boolean) => {
        setIsLoading(isLoading)
        var request: Record<string, any> = {
            what: "getAllShippingDocumentNotifications",
            params: {
                Page: currentPage,
                pageSize: itemsPerPage, 
                Receiver: "TransitOfficer",
                OrderBy: 1
            }
        };
        if(dateRange !== "") request.params.dateRange = dateRange
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                setTotalItems(res.data.totalCount)
                setNotifications(res.data.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()))
                
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsLoading(false)}
            );
    }

    const markNotificationsAsRead = (commentIds: any) => {
        var request: Record<string, any> = {
            what: "markNotificationsAsRead",
            data: {
                shippingDocumentCommentIds: commentIds
            }
        };
        
        makePatchRequest(request)
            .then(() => {                
                getShipmentNotifications(false) // Don't show loader when called from here.
            })
            .catch((error:any) => 
                {toast.error(error.msg)}
            );
    }

    const getUnreadShippingDocumentNotifications = () => {
        var request: Record<string, any> = {
            what: "getUnreadShippingDocumentNotifications",
            params: {
                Receiver: "TransitOfficer",
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                if(res.length) markNotificationsAsRead(res.map((data: any) => data.id))
            })
            .catch((error:any) => 
                {toast.error(error.msg)}
            );
    }

    const rows = notifications.map((data: any, i :number) => {
        return (
            <div className="notification-card" key={i}>
                <span className="material-symbols-outlined" style={{color: "#007AFF", fontSize: "20px"}}>notifications</span>
                <div>
                    <div className="notification-title">
                        <h5>{data.senderRole} {data.senderCompany ? `(${data.senderCompany})`: ""}</h5>
                        <span className="small-text"> . {formatDateTime(data.createdDate)} . </span>
                        <span className='link-text' onClick={() => navigate("/transitofficer/shippingdocuments/"+data.shippingDocumentId)}>Go to Page</span>
                    </div>
                    
                    <p>{data.message}</p>                                    
                </div>
                {!data.isRead && <span className="read-indicator"></span>}
            </div>
        )
    })

    useEffect(() => {
        if(accessToken) {
            switch(selectedTab){
                case "shipping":
                    getShipmentNotifications(true) // show loader when called from here.
                    getUnreadShippingDocumentNotifications()
                    break;
            }
        }
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue, selectedTab === "shipping", dateRange])

    const page = "Notifications"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>  
                    <div className='main-inner'>
                        <div className="detail-top-section">
                            <div className="d-flex" style={{padding: "12px"}}>
                                <div className="d-flex">
                                    <div className="search-container left-item">
                                        <span className="material-symbols-rounded">search</span>
                                        <input id="search" placeholder="Search Notifications" onKeyUp={handleSearch}  />
                                    </div>
                                    <button className="custom-button orange left-item ml-2"
                                        onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                    >Search</button>
                                </div>
                                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                    <option value={0}>Today</option>
                                    <option value={7}>Past 7 Days</option>
                                    <option value={30}>Past 30 Days</option>
                                    <option value="">All</option>
                                </select>
                            </div>
                                
                            <div className="tab">
                                {/* <div className={`tab-item ${selectedTab === "mrd" ? "active" : ""}`} onClick={() => setSelectedTab("mrd")}>
                                    <span className="material-symbols-rounded">note_stack</span>
                                    <p>Material Readiness Document</p>
                                </div> */}
                                <div className={`tab-item ${selectedTab === "shipping" ? "active" : ""}`} onClick={() => setSelectedTab("shipping")}>
                                    <span className="material-symbols-rounded">home_storage</span>
                                    <p>Shipping Document</p>
                                </div>
                            </div>                      
                        </div>     
                    </div>  
                    <div className="main-inner mt-1"> 
                        <div className="table-container" style={{minHeight: "750px"}}>
                            {isLoading ? null : (
                                            notifications?.length === 0 ? <td className='no-records' style={{fontSize: "11px"}}>No Records Found</td>
                                            : rows
                                        )
                                    }

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
                <ToastContainer />
            </div>                            
        </Layout>
    )
}

export default Notifications