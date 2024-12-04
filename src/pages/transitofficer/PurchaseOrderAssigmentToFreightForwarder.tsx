import { useLocation, useNavigate } from "react-router-dom";
import loading from "../../assets/images/loading.gif"
import { useState, useEffect } from "react";
import Pagination from "../../components/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { makeGetRequest } from "../../request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { formatDateTime } from "../../helpers";
import Layout from "../Layout";
import { setPageContext } from "../../store/pageContext";
import { PurchaseOrderInfo } from "interfaces/purchaseorder.interface";
import { formatDateTime, getDateDifferenceLeadTime } from "helpers";
// import Modal from 'react-modal'

const PurchaseOrderAssigmentToFreightForwarder =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const pageContext: any = useSelector((state: any)=> state.pageContext.value)
    // const user: any = useSelector((state: any)=> state.tepngUser.value)
    const permissions:any = useSelector((state: any) => state.permissions.value);
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };
    const purchaseOrdersBeforeNavigation = location.state as { purchaseOrders: any };
    const [purchaseOrders, setRecords] = useState<PurchaseOrderInfo[]>([])
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
    const getPurchaseOrders = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrders",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                OrderBy: 2,
                purchaseOrderStatus: status === 1 ? "UNASSIGNED" : "ASSIGNED"
            }
        };
        if(searchValue) {request.params.SearchString = searchValue; setStatus(null);}
        // if(status) request.params.Status = status
        
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
    
    const [selectedPurchaseOrders, setSelectedPurchaseOrders] = useState<any>([]);
    // Handle checkbox change
    const handleCheckboxChange = (event: any, purchaseOrderNumber: string) => {
        const { value, checked } = event.target;
        setSelectedPurchaseOrders((prevSelected: any) => {
            if (checked) {
                // Add to the array if checked
                return [...prevSelected, {id: value, purchaseOrderNumber: purchaseOrderNumber}];
            } else {
                // Remove from the array if unchecked
                return prevSelected.filter((purchaseOrder: any) => purchaseOrder.id !== value);
            }
        });
    };
    const handleCheckboxSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setSelectedPurchaseOrders(
            checked
                ? purchaseOrders.map(data => ({ id: data.id, purchaseOrderNumber: data.purchaseOrderNumber }))
                : []
        );
    };

    const row = purchaseOrders
                    ?.map((data, index) => {
                    return (
                        <tr key={index}>
                            {(status === 2 || !permissions?.includes("AssignMRDtoFF")) &&<td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>}
                            {(status === 1 && permissions?.includes("AssignMRDtoFF")) &&<td>
                                <input 
                                type="checkbox" 
                                name="selectPurchaseOrder" 
                                value={data.id}
                                onChange={(event) => handleCheckboxChange(event, data.purchaseOrderNumber)}
                                checked={!!selectedPurchaseOrders?.find((purchaseOrder: any) => purchaseOrder.id === data.id)} 
                                />
                            </td>}
                            <td className="no-textwrap">
                                { data.purchaseOrderNumber }
                            </td>
                            <td>{ data.purchaseOrderItems?.length } Items</td>
                            <td>{data.finalShippingAddress}</td>
                            {status === 1 &&<td>{getDateDifferenceLeadTime(data.createdDate)}</td>}                            
                            {status === 2 &&<>
                                <td>{data?.freightForwarder?.companyName}</td>
                                <td>{formatDateTime(data.freightForwarderAssignmentDate)}</td>
                            </>}
                            <td>
                                
                                {permissions?.includes("AssignMRDtoFF") ? <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button
                                            disabled={status===1
                                                // disabled if any of the purchase order items have mrd created for them (i.e., itemSupplies array is not empty)
                                                || !data?.purchaseOrderItems.every(item => 
                                                item.purchaseOrderItemSupplies.length === 0
                                            )} 
                                            title={status===1
                                                // disabled if any of the purchase order items have mrd created for them (i.e., itemSupplies array is not empty)
                                                || !data?.purchaseOrderItems.every(item => 
                                                item.purchaseOrderItemSupplies.length === 0
                                            ) ? "This purchase order has item(s) contained in an approved MRD" : ""}
                                            onClick={() => navigate("/transitofficer/freightforwarderreassignment", {state: {status: status, selectedPurchaseOrder: data}})}
                                            >Reassign Freight Forwarder</button>
                                        <button                               
                                            onClick={() => {navigate("/transitofficer/purchaseorders/"+data.purchaseOrderNumber, {state: {status: status}}); dispatch(setPageContext({from: "PurchaseOrderAssigmentToFreightForwarder"}))} }
                                            >View Purchase Order Details</button>
                                    </div>
                                </div> : 
                                    <div className="actions" 
                                    onClick={() => {navigate("/transitofficer/purchaseorders/"+data.purchaseOrderNumber, {state: {status: status}}); dispatch(setPageContext({from: "PurchaseOrderAssigmentToFreightForwarder"}))} }
                                    >
                                        <span className="material-symbols-rounded">pageview</span>
                                        <span>Veiw Details</span>
                                    </div>
                                }
                            </td>
                        </tr>
                    )
                })

    const queryParams = new URLSearchParams(window.location.search); 
    useEffect(() => {
        if(queryParams.get("status")) setStatus(Number(queryParams.get("status")))
        else setStatus(statusBeforeNavigation?.status ? statusBeforeNavigation?.status : 1)

        if(purchaseOrdersBeforeNavigation?.purchaseOrders) {
            setSelectedPurchaseOrders(Object.values(purchaseOrdersBeforeNavigation.purchaseOrders).flat())
        }
        // eslint-disable-next-line
    }, [])  

    useEffect(() => {
        if(accessToken && status !== undefined) getPurchaseOrders()
        // eslint-disable-next-line
    }, [currentPage, itemsPerPage, searchValue, accessToken, status])

    const page = "Purchase Order Assignment"

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
                                    <input id="search" placeholder="Search Purchase Order Number" style={{width:"180px"}} onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>

                            {selectedPurchaseOrders.length > 0 &&
                            <div className="d-flex">
                                <div className="actions top" onClick={() => navigate("/transitofficer/freightforwarders", {state: {selectedPurchaseOrders: selectedPurchaseOrders}})}>
                                    <span className="material-symbols-rounded">demography</span>
                                    <span style={{fontSize: "12px"}}>Assign Freight Forwader</span>
                                </div>
                                <div style={{padding: "6px 16px", borderLeft: "1px solid #929292", fontSize: "12px", color: "#929292", marginLeft: "16px"}} >
                                    {selectedPurchaseOrders.length} Selected
                                </div>
                            </div>}

                            <div className="d-flex page-filter">
                                <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                <div className={status === 1 ? "orange active": "orange"} onClick={() => {setStatus(1); dispatch(setPageContext({...pageContext, status: 1})); setCurrentPage(1)}}>
                                {status === 1 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Unassigned</div>                               
                                
                                <div className={status === 2 ? "blue active": "blue"} onClick={() => {setStatus(2); dispatch(setPageContext({...pageContext, status: 2})); setCurrentPage(1)}}>
                                {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Assigned</div>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        {(status === 2 || !permissions?.includes("AssignMRDtoFF")) &&<th>SN</th>}
                                        {(status === 1 && permissions?.includes("AssignMRDtoFF")) &&<th>
                                            <input 
                                                type="checkbox" 
                                                name="selectAllPurchaseOrder" 
                                                onChange={handleCheckboxSelectAll}
                                                 />

                                            <span className="material-symbols-rounded"></span>
                                        </th>}
                                        <th>Purchase Order Number</th>
                                        <th>Total Items</th>
                                        <th>Destination</th>
                                        {status === 1 &&<th>Pending Duration</th>}
                                        {status === 2 &&<>
                                        <th>Assigned Freight Forwarder</th>
                                        <th>Assignment Date</th>
                                        </>}
                                        <th style={{width: "178px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {isLoading ? null : (
                                        purchaseOrders?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
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
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default PurchaseOrderAssigmentToFreightForwarder