import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { makeGetRequest } from "../../../request";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from "../../Layout";
import { setPageContext } from "../../../store/pageContext";


const AssignedShippingDocuments =  () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [shippingDocuments, setShippingDocuments] = useState<Record <string, any>>()

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

    const row = shippingDocuments?.map((data: any, index:number) => {
        return (
            <tr key={index}>
                <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                <td>{ data.referenceNumber }</td>
                <td>{ data.shippingNumber }</td>
                <td>{ formatDateTime(data.createdDate) }</td>
                <td>{ data.consolidatedPackingList?.modeOfShipping }</td>
                <td>{ data.consolidatedPackingList?.destination }</td>
                <td>
                    <div className="actions" onClick={() => {navigate("/transitofficer/shippingdocuments/"+data.id); 
                        dispatch(setPageContext({page: "Local Clearing Agents", 
                                                url: `/transitofficer/assigned-shipping-documents/${localClearingAgent.email}`,
                                                // firstName: localClearingAgent.firstName,
                                                // lastName: localClearingAgent.lastName,
                                                // companyName: localClearingAgent.companyName,
                                                // id: localClearingAgent.id
                                                }))}}>
                        <span className="material-symbols-rounded">pageview</span>
                        <span>View Details</span>
                    </div>
                </td>
            </tr>
        )
    })

    const [isLoading, setIsLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [localClearingAgent, setLocalClearingAgent] = useState<Record <string, any>>([])
    const getUser = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getUserByEmail",
            params: {
                Email: params.email
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data.user
                setLocalClearingAgent(res)
                // console.log(res.id)
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }
    const getShippingDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentsForLocalClearingAgent",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
                LocalClearingAgentId: localClearingAgent.id
            }
        };
        if(searchValue) request.params.SearchString = searchValue
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setShippingDocuments(res)
                setTotalItems(response.data.totalCount)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    useEffect(() => {
        if(accessToken) getUser() // eslint-disable-next-line
    }, [accessToken])

    useEffect(() => {
        if(accessToken && localClearingAgent.id) getShippingDocuments()
        // eslint-disable-next-line
    }, [accessToken, searchValue, currentPage, itemsPerPage, localClearingAgent.id])

    const page = "Local Clearing Agents"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main mt-2">
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <div className="d-flex">
                                <Link to={"/transitofficer/localclearingagents"} className="actions">
                                    <p><span className="material-symbols-rounded">arrow_back</span> Back to Local Clearing Agents</p>
                                </Link>

                                <p style={{color: "#3e3e3e"}}><span className="material-symbols-rounded">account_circle</span>{ localClearingAgent?.firstName } { localClearingAgent?.lastName } - { localClearingAgent?.companyName }</p>
                            </div>  
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">assignment_add</span>
                                    <p>Assigned Shipping Documents</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>                    

                    <div className="main-inner mt-1">                 
                        <div className="main-inner-top">
                            <div className="d-flex">
                                <div className="search-container left-item">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="shippmentId" placeholder="Search Shipping Documents" onKeyUp={handleSearch} />
                                </div>
                                <div onClick={() => setSearchValue((document.getElementById("shippmentId") as HTMLInputElement)?.value)} className="custom-button orange left-item ml-2" style={{height: '20px'}}>Search</div>
                            </div>
                        </div> 
                        <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>BL/AWB Number</th>
                                        <th>Shipment Number</th>
                                        <th>Created Date</th>
                                        <th>Shipping Mode</th>
                                        <th>Destination</th>
                                        <th>Action</th>
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
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default AssignedShippingDocuments