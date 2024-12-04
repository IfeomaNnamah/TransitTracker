import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loading from "../../../assets/images/loading.gif"
import { useState, useEffect, FormEvent } from "react";
import { makeGetRequest, makePatchRequest } from "../../../request";
import { useSelector } from "react-redux";
import { customStyles } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from '../../Layout';
import Modal from "react-modal"
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ShippingDocuments =  () => {
    const navigate = useNavigate()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const location = useLocation()
    const statusBeforeNavigation = location.state as { status: number };
    const [shippingDocuments, setRecords] = useState<Record <string, any>>([])    
    const [isConfirmModal, setIsConfirmModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openAcknowledgmentModal, setOpenAcknowledgmentModal] = useState(false)
    const [formData, setFormData] = useState({
        shippingDocumentId: "",    
        handOffDocument: ""
    })
    const [formData2, setFormData2] = useState({
        shippingDocumentId: "",
        dateOfReceipt: "",    
        dateOfTransferToReception: ""
    })
    
    const clearData = () => {
        setFormData({
            shippingDocumentId: "",    
            handOffDocument: ""
        })
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
    
    const [searchValue, setSearchValue] = useState("")
    const [status, setStatus] = useState<number|null>(statusBeforeNavigation?.status ? statusBeforeNavigation.status : 1)
    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const handleFileChange = (event: any) => {
        const {name, files} = event.target
        let selectedFile = files[0]

        let file = selectedFile.name.split(".");
        
        if (file[file.length-1] === "zip" || file[file.length-1] === "pdf") setFormData(({...formData, [name]: selectedFile})) 
        else {
            toast.error("Attempted to upload an invalid file format. Please re-upload the correct file formats.")
            const element = event.target as HTMLInputElement
            element.value = ""
        }               
    }

    const [isLoading, setIsLoading] = useState(false)
    const getShippingDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentsForPortOfficer",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                OrderBy: 2,
                PortOfficerId: user.id
            },
        };
        if(searchValue) {request.params.SearchString = searchValue; setStatus(null);}
        if(status) request.params.status = status
        
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
   
    const row = shippingDocuments.map((data: any, index:number) => {
                    return (
                        <tr key={index}>
                            <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                            <td>{ data.referenceNumber }</td>
                            <td>{ data.shippingNumber }</td>
                            <td>{ data.consolidatedPackingList?.modeOfShipping }</td>
                            <td>{ data.consolidatedCommercialInvoice?.destination }</td>
                            <td>
                                {data.portOfficerStatus === 1 &&
                                <div className="dropdown">
                                    <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                    <div className="dropdown-content">
                                        <button
                                            onClick={() => navigate("/portofficer/shippingdocuments/"+data.id, {state: {status: status}})}
                                            >View Documents</button>
                                        {/* display if the date has been set (i.e. port officer has acknowledged receeption of shipment) */}
                                        {data?.dateOfReceipt && <button
                                            onClick={() => navigate("/portofficer/handoffdocument/"+data.id, {state: {status: status}})}
                                            >Preview Handoff Document</button>} 

                                        {!data?.dateOfReceipt && <button
                                            onClick={() => {setOpenAcknowledgmentModal(true); setFormData2({...formData2, shippingDocumentId: data.id})}}                                            
                                            >Acknowledge Reception</button>} 
                                        <button
                                            onClick={() => {setIsConfirmModal(true); setFormData({...formData, shippingDocumentId: data.id})}}
                                            >Confirm Delivery</button>  
                                    </div>
                                </div>}
                                {data.portOfficerStatus === 2 && <Link to={"/portofficer/shippingdocuments/"+data.id} className="actions">
                                    <span className="material-symbols-rounded">pageview</span>
                                    <span>View Details</span>
                                </Link>}
                            </td>
                            
                        </tr>
                    )
                })

    const handleDeliveryAtDestination = (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)
        const form = new FormData()
        form.append("shippingDocumentId", formData.shippingDocumentId)        
        form.append("portOfficerId", user?.id)
        form.append("handOffDocument", formData.handOffDocument)

        var request: Record<string, any> = {
            what: "confirmDeliveryAtDestination",
            data: form
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                toast.success(response.msg)
                setIsSubmitting(false)
                setIsConfirmModal(false)  
                getShippingDocuments()              
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsSubmitting(false)}
            );
    }

    const HandleAcknowledgeReceptionOfShipment = (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)

        var request: Record<string, any> = {
            what: "SetPortOfficerDates",
            data: {
                shippingDocumentId: formData2?.shippingDocumentId,
                dateOfReceipt: formData2?.dateOfReceipt,
                dateOfTransferToReception: formData2?.dateOfTransferToReception
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                toast.success(response.msg+ ". You'll be navigated shortly to the generated handoff document.")
                setIsSubmitting(false)
                setOpenAcknowledgmentModal(false) 
                setTimeout(() => {
                    navigate("/portofficer/handoffdocument/"+formData2.shippingDocumentId)
                }, 1000);                
                // getShippingDocuments()              
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsSubmitting(false)}
            );
    }

    useEffect(() => {
        if(accessToken) getShippingDocuments()
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue, status])

    const page = "Shipping Documents"

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
                                    <input id="search" placeholder="Search Shipping Documents" onKeyUp={handleSearch}  />
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
                                        Open</div>

                                    <div className={status === 2 ? "green active": "green"} onClick={() => setStatus(2)}>
                                    {status === 2 && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#175FDC" style={{width: "10px", marginRight: "4px"}}><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>}
                                        Delivered</div>
                                </div>
                            </div>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>BL/AWB Number</th>
                                        <th>Shipment Number</th>
                                        <th>Shipping Mode</th>
                                        <th>Destination</th>
                                        <th style={{width: "172px"}}>Action</th>
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

<               Modal isOpen={openAcknowledgmentModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Acknowledge Reception of Shipment</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => setOpenAcknowledgmentModal(false)}>close</span>
                    </div>
                    <form onSubmit={HandleAcknowledgeReceptionOfShipment}>
                    <div className="modal-body">
                        <div className="alert alert-info" style={{margin: "12px 0", padding: "8px", width: "auto"}}>
                            <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                            <p style={{margin: 0}}>You would be provided with the generated handoff document after submission.</p>
                        </div>
                        <label><span className="errorX mr-2">*</span>Date of Receipt</label>
                        <input style={{marginBottom: "8px"}} name="dateOfReceipt" type='date' value={formData2?.dateOfReceipt} onChange={(event) => setFormData2({...formData2, dateOfReceipt: event.target.value})} />                        
                       
                        <label><span className="errorX mr-2">*</span>Date of Transfer to Reception</label>
                        <input name="dateOfTransferToReception" type='date' value={formData2?.dateOfTransferToReception} onChange={(event) => setFormData2({...formData2, dateOfTransferToReception: event.target.value})} />
                    </div>
                    <div className="modal-footer bt-1">
                        <button type="button" className="custom-button grey-outline"
                            onClick={() => setOpenAcknowledgmentModal(false)}>Cancel</button>
                        <button type="submit" 
                            disabled={isSubmitting}
                            className="custom-button orange">{isSubmitting ? "Loading..." : "Submit"}</button>
                    </div>
                    </form>
                </Modal>

                <Modal isOpen={isConfirmModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Confirmation of Delivery</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setIsConfirmModal(false); setIsSubmitting(false); clearData()}}>close</span>
                    </div>
                    <form onSubmit={handleDeliveryAtDestination}>
                    <div className="modal-body">                        
                        <label><span className="errorX mr-2">*</span>Hand-Off Document <span className='blue-text'>(.pdf, .zip)</span></label>
                        <input name="handOffDocument" type='file' className='mb-2' accept='.zip, .pdf' required onChange={handleFileChange} />
                        
                        <input required type='checkbox' /> <span style={{fontSize: "12px"}}>I, {user?.firstName} {user?.lastName}, confirm that the materials listed in the shipping documents have arrived at their final shipping destination.</span>
                    </div>
                    <div className="modal-footer bt-1">
                        <button type="button" className="custom-button grey-outline"
                            onClick={() => setIsConfirmModal(false)}>Cancel</button>
                        <button type="submit" 
                        disabled={isSubmitting}
                        className="custom-button orange">{isSubmitting ? "Loading..." : "Submit"}</button>
                    </div>
                    </form>
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default ShippingDocuments