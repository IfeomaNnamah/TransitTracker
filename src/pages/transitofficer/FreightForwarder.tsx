import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import Modal from 'react-modal'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
import loading from "../../assets/images/loading.gif"
import { makeGetRequest } from '../../request';
import { Users } from '../../interfaces/index.interface';
import { useSelector } from 'react-redux';
import Pagination from '../../components/Pagination';
import Layout from '../Layout';

const FreightForwarder =  () => {
    // const location = useLocation()
    const navigate = useNavigate()
    // const statusAfterNavigation = location.state as { status: number };
    // const purchaseOrders = location.state as { selectedPurchaseOrders: any };
    const accessToken:any = useSelector((state: any) => state.accessToken.value); 
    const permissions:any = useSelector((state: any) => state.permissions.value);
    // const [isSubmitting, setIsSubmitting] = useState(false)
    // const [selectedPurchaseOrders, setSelectedPurchaseOrders] = useState([])
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

    const handleCopy = (text: string) => {
        // Implement the copy logic here
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
    
        // Make the textarea non-editable to avoid focus and activation
        tempTextArea.setAttribute("readonly", "");
        tempTextArea.style.position = "absolute";
        tempTextArea.style.left = "-9999px";
    
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
    
        try {
            // Copy the text to the clipboard
            document.execCommand("copy");
            toast.info(`Copied! - ${text}`)
        } catch (err) {
            toast.error("Unable to copy selected item: " + err);
        } finally {
            document.body.removeChild(tempTextArea);
        }
      };

    const [users, setUsers] = useState<Users[]>()
    // const [selectedFreightForwarderId, setSelectedFreightForwarderId] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const getAllUsersForARole = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getAllUsersForARole",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                roleName: "Freight Forwarder"
            }
        };
        if(searchValue) request.params.SearchString = searchValue
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setUsers(res)
                setTotalItems(response.data.totalCount)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }

    // const AssignBatchPurchaseOrderToFreightForwarder = () => {
    //     const data = {
    //         freightForwarderId: selectedFreightForwarderId,
    //         purchaseOrderIds: purchaseOrders?.selectedPurchaseOrders?.map((purchaseOrder: any) => purchaseOrder.id)
    //     }

    //     if(Object.values(data).every(value => value)) {  
    //         setIsSubmitting(true)
    //         var request = {
    //             what: "AssignBatchPurchaseOrderToFreightForwarder",
    //             data: data
    //         };
            
    //         makePatchRequest(request)
    //             .then((response: any) => {
    //                 setIsSubmitting(false)
    //                 toast.success(response.msg)
    //                 setTimeout(() => {
    //                     navigate("/transitofficer/purchaseorderassignmenttofreightforwader")
    //                 }, 2000);
    //             })
    //             .catch((error) => 
    //                 {toast.error(error); setIsSubmitting(false)}
    //             );
    //     }else toast.warning("Kindly select a freight forwarder before proceeding to assign.")
    // } 

    /**
     * Handles change in radio button selection for selecting a freight forwarder
     * Updates the state with the selected freight forwarder's id
     * @function
     */
    // const handleRadioChange = (event: any) => {
    //     const {checked, value} = event.target
    //     if(checked) setSelectedFreightForwarderId(value)
    //     else setSelectedFreightForwarderId("")
    // }

    const row = users?.map((user, index) => {
        return (
                <tr key={index}>
                    {/* <td>
                        <input 
                        name='selectedFreightForwarder' 
                        type='radio' 
                        value={user.user.id}
                        checked={selectedFreightForwarderId === user.user.id}
                        onChange={handleRadioChange} />
                    </td> */}
                    <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                    <td>{ user.user.firstName } { user.user.lastName }</td>
                    <td><span onClick={() => handleCopy(user.user.email)} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>
                        { user.user.email }</td>
                    <td>{ user.user.companyName }</td>
                    {/* <td>4 Day(s)</td> */}
                    {!permissions?.includes("AssignMRDtoFF")
                    &&<td>
                        <button onClick={() => navigate(`/transitofficer/freightforwarder-assigned-material-readiness-documents/${user.user.email}`)} className="actions">
                            <span className="material-symbols-rounded">pageview</span>
                            <span>View Details</span>
                        </button>
                    </td>}
                    {permissions?.includes("AssignMRDtoFF")
                    &&<td className="actions">
                        <div className="dropdown">
                            <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                            <div className="dropdown-content">
                                <button
                                onClick={() => {navigate("/transitofficer/batch-assign-material-readiness-documents/" + user.user.email);}}
                                >Batch Assign MRDs</button>

                                <button
                                onClick={() => {
                                    navigate("/transitofficer/freightforwarder-assigned-material-readiness-documents/" + user.user.email);}}
                                >View Assigned MRDs</button>
                            </div>
                        </div>
                    </td>}
                </tr>
        )
    })

    useEffect(() => {
        if(accessToken) getAllUsersForARole();
        // setSelectedPurchaseOrders(purchaseOrders?.selectedPurchaseOrders)
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue])

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    // const removePurchaseOrder = (id: string) => {
    //     setSelectedPurchaseOrders(selectedPurchaseOrders.filter((purchaseOrder: any) => purchaseOrder.id !== id))
    // }

    const page = "Freight Forwarder Assignment"

    return (
        <Layout title={page}>
           <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3> 
                    {/* For Purchase Orders Assignment  */}
                    {/* <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <Link to="/transitofficer/purchaseorderassignmenttofreightforwader" state={{status: statusAfterNavigation?.status, purchaseOrders: selectedPurchaseOrders}} className="actions" style={{width: "fit-content"}}>
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Purchase Orders</p>
                            </Link>

                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">description</span>
                                    <p>Assign Purchase Orders to Freight Forwarder </p>
                                </div>    
                            </div>                      
                        </div>
                    </div>   
                    <div className="main-inner mt-1">
                        <div className="summary-title">
                            Selected Purchase Orders
                        </div>
                        <div className='d-flex-2' style={{padding:"16px", minHeight: "fit-content", flexWrap: "wrap", alignItems: "start"}}>
                            {selectedPurchaseOrders
                                ?.map((purchaseOrder: {purchaseOrderNumber: string, id: string}) => {
                                    return (
                                        <div className='d-flex-2' style={{padding: "8px", background: "#f4f7fc", borderRadius: "6px", width: "fit-content", color:"929292"}}>
                                            <p className='f-12 m-0'>PO {purchaseOrder.purchaseOrderNumber}</p>
                                            {selectedPurchaseOrders.length > 1 && <span className='material-symbols-outlined fw-600' style={{fontSize: "14px", cursor: "pointer", color: "#175FDC"}} onClick={() => removePurchaseOrder(purchaseOrder.id)}>close</span>}
                                        </div>  
                                    )
                                })
                            }                            
                            
                        </div>
                    </div> */}
                    {/* End For Purchase Orders Assignment */}
                    <div className="main-inner mt-1">
                        <div className="main-inner-top">
                            <div className="d-flex">
                                <div className="search-container left-item">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="search" placeholder="Search Freight Forwarders" onKeyUp={handleSearch} />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>                            
                        </div>                                              
                        <div className='table-container custom' style={{minHeight: "450px"}}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>SN</th>
                                        <th>Name</th>
                                        {/* <th>Last Name</th> */}
                                        <th>Official Email</th>
                                        <th>Company</th>                                        
                                        {/* For Purchase Orders Assignment  */}
                                        {/* <th>Average SLA Time</th> */}
                                        {/* <th>Total Assigned Purchase Orders</th> */}
                                        <th style={{width: "136px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {isLoading ? null : (
                                        users?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
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
                    {/* For Purchase Orders Assignment  */}
                    {/* <div className="main-inner mt-1" style={{padding: "16px 0"}}>                 
                        <button type="submit" className="custom-button orange"
                            disabled={isSubmitting}
                            onClick={() => AssignBatchPurchaseOrderToFreightForwarder()}
                            style={{margin: "0 auto", height: "36px"}}>
                            <span className="material-symbols-rounded">web_traffic</span>{isSubmitting ? "Assigning..." : "Assign Purchase Order"}
                        </button>
                    </div>                 */}
                </div>
            </div>
            <ToastContainer /> 
        </Layout>
    )
}

export default FreightForwarder