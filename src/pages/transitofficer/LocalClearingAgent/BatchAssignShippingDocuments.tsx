import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { makeGetRequest, makePatchRequest } from "../../../request";
import { useSelector } from "react-redux";
import { formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from "../../Layout";
import { SelectedShippingDocuments } from "interfaces/index.interface";

const BatchAssignShippingDocuments =  () => {
    const navigate = useNavigate()
    const params = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const [shippingDocuments, setShippingDocuments] = useState<Record <string, any>>()
    const [selectedDocuments, setSelectedDocuments] = useState<SelectedShippingDocuments[]>([])

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = () => {if (currentPage > 1) setCurrentPage(currentPage - 1)}
    const handleNext = () => {if (currentPage < totalPages) setCurrentPage(currentPage + 1)}
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {pageNumbers.push(i);}
        return pageNumbers;
    };

    const handleCheck = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target
        if(checked){
            const item: any = shippingDocuments?.find((item:any) => item.id === value)
            const selectedItem: SelectedShippingDocuments = {
                id: item?.id,
                shipmentNumber: item?.shippingNumber,
                referenceNumber: item?.referenceNumber,
                createdDate: item?.createdDate,
                modeOfShipping: item?.consolidatedPackingList.modeOfShipping,
                destination: item?.consolidatedPackingList.destination
            }
            setSelectedDocuments([...selectedDocuments, selectedItem])
        }else {
            var remainingItems = selectedDocuments.filter((item:any) => item.id !== value)
            setSelectedDocuments(remainingItems)
        }
    }

    const handleCheckAll = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target
        if(checked){
            const items:any = shippingDocuments?.map((item:any) => ({                
                id: item?.id,
                shipmentNumber: item?.shippingNumber,
                referenceNumber: item?.referenceNumber,
                createdDate: item?.createdDate,
                modeOfShipping: item?.consolidatedPackingList.modeOfShipping,
                destination: item?.consolidatedPackingList.destination
                }));

            setSelectedDocuments(items);
            
        }else setSelectedDocuments([])
    }

    const row = shippingDocuments?.map((data: any, index:number) => {
        return (
            <tr key={index}>
                <td>
                    <input type="checkbox" 
                    value={data.id} 
                    onChange={handleCheck} 
                    checked={!!selectedDocuments.find(item => item.id === data.id)}/>
                </td>
                <td>{ data.referenceNumber }</td>
                <td>{ data.shippingNumber }</td>
                <td>{ formatDateTime(data.createdDate) }</td>
                <td>{ data.consolidatedPackingList?.modeOfShipping }</td>
                <td>{ data.consolidatedPackingList?.destination }</td>

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
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }
    const getShippingDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentsForBatching",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
                assigned: false
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

    const [isSubmitting, setIsSubmitting] = useState(false)    
    const HandleBatchAssignShippingDocuments = () => {
        const selectedId = selectedDocuments.map((data: any) => data.id)
        var request: Record<string, any> = {
            what: "BatchAssignShippingDocumentsToLocalClearingAgent",
            data: {
                LocalClearingAgentId: localClearingAgent.id,
                transitOfficerId: user.id,
                ShippingDocumentIds: selectedId
            }
        };
        
        if(!selectedDocuments.length) toast.warning("Atleast one shipping document must be selected.")
        else {
            setIsSubmitting(true)
            makePatchRequest(request)
                .then((response: any) => {
                    setIsSubmitting(false)
                    toast.success(response.msg)

                    setTimeout(() => {
                        navigate("/transitofficer/localclearingagents")
                    }, 800);                    
                })
                .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
        }
    }

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    useEffect(() => {
        if(accessToken) {getUser(); getShippingDocuments()}
        // eslint-disable-next-line
    }, [accessToken, searchValue, currentPage, itemsPerPage])

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
                                    <p>Batch Assign Shipping Documents</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="main-inner mt-1">  
                        <div className="main-inner-top d-flex-center">
                            <div className="d-flex gap-2">
                                <div className="search-container">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="shippmentId" placeholder="Search Shipping Documents" onKeyUp={handleSearch} />
                                </div>
                                <div onClick={() => setSearchValue((document.getElementById("shippmentId") as HTMLInputElement)?.value)} 
                                className="custom-button orange" style={{height: "20px"}}>Search</div>
                            </div>
                        </div>  
                        <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th><input type="checkbox" onChange={handleCheckAll} /></th>
                                        <th>BL/AWB Number</th>
                                        <th>Shipment Number</th>
                                        <th>Created Date</th>
                                        <th>Shipping Mode</th>
                                        <th>Destination</th>
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

                    <div className="main-inner">                 
                        <p style={{padding: "12px 0 0 12px", marginTop: "8px", fontSize: "12px"}}><span className="errorX mr-2">*</span>Selected Shipping Documents</p>
                        <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th></th>
                                        <th>BL/AWB Number</th>
                                        <th>Shipment Number</th>
                                        <th>Created Date</th>
                                        <th>Shipping Mode</th>
                                        <th>Destination</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        selectedDocuments?.map((data: any, i: number) => {
                                            return (
                                                <tr key={i}>
                                                    <td>
                                                        <input type="checkbox" value={data.id} 
                                                        onChange={handleCheck} 
                                                        checked={!!selectedDocuments.find((item: any) => item.id === data.id)}/>
                                                    </td>
                                                    <td>{ data.referenceNumber }</td>
                                                    <td>{ data.shipmentNumber }</td>
                                                    <td>{ formatDateTime(data.createdDate) }</td>
                                                    <td>{ data.modeOfShipping }</td>
                                                    <td>{ data.destination }</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>   

                    <div className="main-inner mt-1" style={{padding: "16px 0"}}>                 
                        <button type="submit" className="custom-button orange"
                        disabled={isSubmitting} 
                        onClick={() => HandleBatchAssignShippingDocuments()}
                        style={{margin: "0 auto"}}>
                            <span className="material-symbols-rounded">web_traffic</span>{isSubmitting ? "Loading..." : "Assign Shipping Documents"}
                        </button>
                    </div>         
                </div>
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default BatchAssignShippingDocuments