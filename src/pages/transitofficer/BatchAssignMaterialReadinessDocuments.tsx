import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import loading from "../../assets/images/loading.gif"
import { makeGetRequest, makePatchRequest } from "../../request";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../../helpers";
import Pagination from "../../components/Pagination";
import Layout from "../Layout";
import { MRDInfo, SelectedMRD } from "../../interfaces/materialreadinessdocument.interface";
import { setPageContext } from "store/pageContext";

const BatchAssignMaterialReadinessDocuments =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const params = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [materialReadinessDocuments, setMaterialReadinessDocuments] = useState<MRDInfo[]>()
    const [mrdNumber, setMrdNumber] = useState("")
    const [selectedMRDs, setSelectedMRDs] = useState<SelectedMRD[]>([])

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
            const item: any = materialReadinessDocuments?.find((item) => item.id === value)
            const selectedItem: SelectedMRD = {
                id: item?.id,
                mrdNumber: item?.mrdNumber,
                createdDate: item?.createdDate,
                pickUpAddress: item?.pickUpAddress,
                totalBatchedPOs: item?.commercialInvoices.length,
                countryOfSupply: item?.countryOfSupply,
                destination: item?.destination,
            }
            setSelectedMRDs([...selectedMRDs, selectedItem])
        }else {
            var remainingItems = selectedMRDs.filter((item:any) => item.id !== value)
            setSelectedMRDs(remainingItems)
        }
    }

    const handleCheckAll = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target
        if(checked){
            const items:any = materialReadinessDocuments?.map((item:any) => ({                
                    id: item?.id,
                    mrdNumber: item?.mrdNumber,
                    createdDate: item?.createdDate,
                    pickUpAddress: item?.pickUpAddress,
                    totalBatchedPOs: item?.commercialInvoices.length,
                    countryOfSupply: item?.countryOfSupply,
                    destination: item?.destination,            
                }));

            setSelectedMRDs(items);
            
        }else setSelectedMRDs([])
    }

    const row = materialReadinessDocuments?.map((data, i) => {
        return (
            <tr key={i}>
                <td>
                    <input type="checkbox" value={data.id} 
                    onChange={handleCheck} 
                    checked={!!selectedMRDs.find(item => item.id === data.id)}/>
                </td>
                <td>{ data.mrdNumber }</td>
                <td>{ formatDateTime(data.createdDate) }</td>
                {/* <td>{ data?.pickUpAddress }</td> */}
                <td>{ data?.countryOfSupply }</td>
                <td>{ data?.commercialInvoices.length }</td>
                <td>{ data?.destination }</td>
                <td>
                    <div className="actions" onClick={() => {navigate("/transitofficer/materialreadinessdocument/"+data.id); 
                        dispatch(setPageContext({page: "Freight Forwarders", 
                                                url: `/transitofficer/batch-assign-material-readiness-documents/${user.email}`,
                                                view: "Batch Assign ",
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                companyName: user.companyName,
                                                id: user.id}))}}>
                        <span className="material-symbols-rounded">pageview</span>
                        <span>View Details</span>
                    </div>
                </td>
            </tr>
        )
    })

    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState<Record <string, any>>([])
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
                setUser(res)
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }

    const getMaterialReadinessDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getMRDs",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                status: 1, //get unassigned mrds
                OrderBy: 2
            }
        };
        if(mrdNumber) request.params.SearchString = mrdNumber
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                setMaterialReadinessDocuments(res.data)
                setTotalItems(res.totalCount)
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }

    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const HandleBatchAssignMaterialReadinessDocuments = () => {
        setIsLoading(true)
        const selectedId = selectedMRDs.map((data) => data.id)
        var request: Record<string, any> = {
            what: "BatchAssignMaterialReadinessDocuments",
            data: {
                userId: user?.id,
                materialReadinessIds: selectedId
            }
        };
        
        if(!selectedMRDs.length) toast.warning("Atleast one purchase order must be selected.")
        else {
            setIsSubmitting(true)
            makePatchRequest(request)
                .then((response: any) => {
                    setIsSubmitting(true)
                    setIsLoading(false)
                    toast.success(response.msg)

                    setTimeout(() => {
                        navigate("/transitofficer/freightforwarders")
                    }, 2000);                    
                })
                .catch((error:any) => {toast.error(error.errorMessage); setIsLoading(false)});
        }
    }

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setMrdNumber("")
    }

    useEffect(() => {
        if(accessToken) {getUser(); getMaterialReadinessDocuments()}
        // eslint-disable-next-line
    }, [mrdNumber, currentPage, itemsPerPage])

    const page = "Freight Forwarders"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main mt-2">
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <div className="d-flex">
                                <Link to={"/transitofficer/freightforwarders"} className="actions">
                                    <p><span className="material-symbols-rounded">arrow_back</span> Back to Freight Forwarders</p>
                                </Link>

                                <p style={{color: "#3e3e3e"}}><span className="material-symbols-rounded">account_circle</span>{ user?.firstName } { user?.lastName } - { user?.companyName }</p>
                            </div>  
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">assignment_add</span>
                                    <p>Batch Assign Material Readiness Documents</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="main-inner mt-1">  
                        <div className="d-flex-center" style={{padding: "16px"}}>
                            <div className="d-flex">
                                <div className="search-container left-item">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="mrdnumber" placeholder="Search MRD Number" style={{height: "20px"}} onKeyUp={handleSearch} />
                                </div>
                                <div 
                                onClick={() => setMrdNumber((document.getElementById("mrdnumber") as HTMLInputElement)?.value)} 
                                className="custom-button orange left-item ml-2"
                                style={{height: "21px"}}>Search</div>
                            </div>
                        </div>  
                        <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th><input type="checkbox" onChange={handleCheckAll} /></th>
                                        <th>MRD Number</th>
                                        <th>Issuance Date</th>
                                        <th>Country of Supply</th>
                                        <th>Total Batched POs</th>
                                        <th>Destination</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? null : (
                                                materialReadinessDocuments?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
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
                        <p style={{padding: "12px 0 0 12px", marginTop: "8px", fontSize: "12px"}}><span className="errorX mr-2">*</span>Selected Material Readiness Documents</p>
                        <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th></th>
                                        <th>MRD Number</th>
                                        <th>Issuance Date</th>
                                        {/* <th>Pickup Address</th> */}
                                        <th>Country of Supply</th>
                                        <th>Total Batched POs</th>
                                        <th>Destination</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        selectedMRDs?.map((data, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>
                                                        <input type="checkbox" value={data.id} 
                                                        onChange={handleCheck} 
                                                        checked={!!selectedMRDs.find(item => item.id === data.id)}/>
                                                    </td>
                                                    <td>{ data.mrdNumber }</td>
                                                    <td>{ formatDateTime(data.createdDate) }</td>
                                                    {/* <td>{ data?.pickUpAddress }</td> */}
                                                    <td>{ data?.countryOfSupply }</td>
                                                    <td>{ data?.totalBatchedPOs }</td>
                                                    <td>{ data?.destination }</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            {false ? <div className="loader">
                                        <img src={loading} alt="loading" />
                                        <p>Loading data...</p>
                                    </div> : null}
                        </div>
                    </div>   

                    <div className="main-inner mt-1" style={{padding: "16px 0"}}>                 
                        <button type="submit" className="custom-button orange"
                            disabled={isSubmitting || selectedMRDs.length === 0} 
                            onClick={() => HandleBatchAssignMaterialReadinessDocuments()}
                            style={{margin: "0 auto", height: "40px"}}>
                            <span className="material-symbols-rounded">web_traffic</span>{isSubmitting ? "Loading..." : "Assign Material Readiness Documents"}
                        </button>
                    </div>         
                </div>
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default BatchAssignMaterialReadinessDocuments