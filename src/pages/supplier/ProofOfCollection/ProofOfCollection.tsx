import { useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect } from "react";
import { MRDInfo } from "../../../interfaces/materialreadinessdocument.interface";
import Pagination from "../../../components/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { makeGetRequest } from "../../../request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "../../Layout";
import { setPageContext } from "../../../store/pageContext";
import { formatDateTime } from "helpers";

const MaterialReadinessDocument =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user: any = useSelector((state: any)=> state.tepngUser.value)
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
    const [status, setStatus] = useState<string | null>()
    const getMaterialReadinessDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getMRDForSupplier",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                SupplierId: user.id,
                OrderBy: 2,
                Status: status
            }
        };
        if(searchValue) request.params.SearchString = searchValue
        
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

    const row = materialreadinessdocument.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td className="text-nowrap">
                                { data.mrdNumber }
                            </td>
                            <td>{ formatDateTime(data.createdDate) }</td>
                            <td>{ data?.pickUpAddress }, { data?.countryOfSupply }</td>
                            <td>{ data?.destination }</td>
                            <td>
                                <button onClick={() => navigate("/supplier/proofofcollection/"+data.proofOfCollection.id)} className="actions">
                                    <span className="material-symbols-rounded">pageview</span>
                                    <span>View Details</span>
                                </button>
                            </td>
                        </tr>
                    )
                })

    const queryParams = new URLSearchParams(window.location.search); 
    useEffect(() => {
        if(queryParams.get("status")) setStatus(queryParams.get("status") ?? '')
        else {
            if(pageContext?.status && ["3","4"].includes(pageContext.status)) setStatus(pageContext.status)
            else setStatus("3")
        }// eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(accessToken && status) getMaterialReadinessDocuments()
        // eslint-disable-next-line
    }, [currentPage, itemsPerPage, searchValue, accessToken, status])

    const page = "Proof Of Collection"

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
                            <div className="d-flex page-filter">
                                <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                <div className={status === "3" ? "orange active": "orange"} onClick={() => {setStatus("3"); dispatch(setPageContext({...pageContext, status: "3"}))}}>                                
                                {/* POC pending supplier approval */}
                                {status === "3" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Open</div>
                                
                                {/* POC approved by supplier */}
                                <div className={status === "4" ? "green active": "green"} onClick={() => {setStatus("4"); dispatch(setPageContext({...pageContext, status: "4"}))}}>
                                {status === "4" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                    Acknowledged</div>
                            </div> 
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>MRD Number</th>
                                        <th>Issuance Date</th>
                                        <th>Pickup Address</th>
                                        <th>Destination</th>
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
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default MaterialReadinessDocument