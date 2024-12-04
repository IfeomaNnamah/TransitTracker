import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect } from "react";
import { makeGetRequest } from "../../../request";
import { useSelector } from "react-redux";
import { customStyles, formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from '../../Layout';
import { ProofOfCollectionInfo } from 'interfaces/index.interface';
import Modal from "react-modal"

const ProofOfCollection =  () => {
    // VARIABLE DEFINITIONS
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };
    const [proofOfCollection, setRecords] = useState<ProofOfCollectionInfo[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);      
    const [searchValue, setSearchValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [comment, ] = useState("")
    const [openModal, setOpenModal] = useState(false)

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

    const [status, setStatus] = useState<number|null>(statusBeforeNavigation?.status ? statusBeforeNavigation?.status : 1)
    const getProofOfCollection = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getProofOfCollection",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                UserId: user?.id,
                ApprovalStatus: status
            }
        };
        if(searchValue) {request.params.SearchString = searchValue; setStatus(null);}
        
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

    // LIST POCS
    const row = proofOfCollection.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td>{ data.pocNumber }</td>
                            <td>{ formatDateTime(data.createdDate) }</td>
                            <td>{ formatDateTime(data.pickUpDate)?.substring(0, 10) }</td>
                            <td>{ data.materialReadinessDocuments[0]?.mrdNumber  }</td>
                            {status === 2 &&<td>{ data?.supplier?.companyName  }</td>}
                            <td>
                                <Link to={"/freightforwarder/proofofcollection/"+data?.id} state={{status: status}} className="actions">
                                    <span className="material-symbols-rounded">pageview</span>
                                    <span>View Details</span>
                                </Link>
                            </td>
                        </tr>
                    )
                })

    useEffect(() => {
        if(accessToken) getProofOfCollection()
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue, status])

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
                                    <input id="search" placeholder="Search POC Number" onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <div className='d-flex' style={{gap: "16px"}}>
                                <div className="d-flex page-filter">
                                    <span style={{fontSize: "12px", color: "#3e3e3e", fontWeight:"500"}}> Filter By </span>
                                    <div className={status === 1 ? "orange active": "orange"} onClick={() => setStatus(1)}>
                                    {status === 1 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Pending</div>

                                    <div className={status === 2 ? "green active": "green"} onClick={() => setStatus(2)}>
                                    {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Acknowledged</div>
                                </div> 
                                <Link to={"/freightforwarder/create/proofofcollection"} style={{ textDecoration: "none" }}>
                                    <button className="custom-button orange">
                                        <span className="material-symbols-rounded fw-600">add</span>Create Proof Of Collection
                                    </button>
                                </Link>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>POC Number</th>
                                        <th>Date Created</th>
                                        <th>Pick Up Date</th>
                                        <th>MRD Number</th>
                                        {status === 2 && <th>Supplier</th>}
                                        <th style={{width: "110px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? null : (
                                            proofOfCollection?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                            : row
                                        )
                                    }
                                </tbody>
                            </table>
                            {isLoading ? <div className="loader">
                                        <img src={loading} alt="loading" />
                                        <p>Loading data...</p>
                                    </div> : null}
                            <Modal isOpen={openModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                                <div className="modal-header">
                                    <h3 style={{display: "flex", alignItems: "center", gap: "6px"}}>Comment</h3>
                                    <span className="material-symbols-rounded close"
                                        onClick={() => setOpenModal(false)}>close</span>
                                </div>
                                <div className="modal-body" style={{minHeight: "120px", fontSize: "12px"}}>
                                    {comment}
                                </div>
                            </Modal>
                            
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

export default ProofOfCollection