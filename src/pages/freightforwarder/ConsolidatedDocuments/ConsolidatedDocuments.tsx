import { Link } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination";
import { useSelector } from "react-redux";
import { makeGetRequest } from "../../../request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDateTime } from "../../../helpers";
import Layout from "../../Layout";
import { ConsolidatedDocumentInfo } from "interfaces/consolidateddocuments.interface";

const ConsolidatedDocuments =  () => {
    // const navigate = useNavigate()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const [packinglists, setRecords] = useState<ConsolidatedDocumentInfo[]>([])
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
    const getConsolidatedDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocuments",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                userId: user.id
            }
        };
        if(searchValue) {request.params.SearchString = searchValue;}
        
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

    const row = packinglists.map((data, index) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td>{ data.consolidatedCommercialInvoice.invoiceNumber }</td>
                            <td>{ data.consolidatedPackingList.packingListNumber }</td>
                            <td>{ formatDateTime(data.createdDate) }</td>
                            {/* <td>{ data.consolidatedCommercialInvoice?.countryOfOrigin }</td>
                            <td>{ data.consolidatedCommercialInvoice?.countryOfSupply }</td> */}
                            <td>{ data.consolidatedCommercialInvoice?.modeOfShipping }</td>
                            <td>{ data.consolidatedCommercialInvoice?.destination }</td>
                            <td>                                                        
                                <Link to={"/freightforwarder/consolidateddocument/"+data.id} className="actions">
                                    <span className="material-symbols-rounded">pageview</span>
                                    <span>View Documents</span>
                                </Link>
                            </td>
                        </tr>
                    )
                })

    useEffect(() => {
        if(accessToken) getConsolidatedDocuments()
        // eslint-disable-next-line
    }, [])

    const page = "Consolidated Documents"

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
                                    <input id="search" placeholder="Search Documents" onKeyUp={handleSearch}  />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>
                            <Link to={"/freightforwarder/create/consolidateddocument"} style={{ textDecoration: "none" }}>
                                <button className="custom-button orange">
                                    <span className="material-symbols-rounded fw-600">add</span>Create Consolidated Documents
                                </button>
                            </Link>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>Commercial Invoice N<sup>o</sup></th>
                                        <th>Packing List N<sup>o</sup></th>
                                        <th>Created Date</th>
                                        {/* <th>Country of Origin</th>
                                        <th>Country of Supply</th> */}
                                        <th>Shipping Mode</th>
                                        <th>Destination</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {isLoading ? null : (
                                        packinglists?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
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

export default ConsolidatedDocuments