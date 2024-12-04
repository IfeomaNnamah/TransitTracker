import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import loading from "../../assets/images/loading.gif"
import { makeGetRequest, makePatchRequest } from "../../request";
import { useDispatch, useSelector } from "react-redux";
import { customStyles, formatDateTime } from "../../helpers";
import Pagination from "../../components/Pagination";
import Layout from "../Layout";
import { MRDInfo } from "../../interfaces/materialreadinessdocument.interface";
import { setPageContext } from "../../store/pageContext";
import Modal from 'react-modal'

const FreightForwarderAssignedPurchaseOrders =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const params = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    // const pageContext:any = useSelector((state: any) => state.pageContext.value);
    const permissions:any = useSelector((state: any) => state.permissions.value);
    const [materialReadinessDocuments, setMaterialReadinessDocuments] = useState<MRDInfo[]>()
    const [mrdNumber, setMrdNumber] = useState("")
    const [formData, setFormData] = useState<Record <string, any>>({
        materialReadinessDocumentId: "",
        userId: "",
        reason: ""
    })
    const [reassignFreightForwarderModal, setReassignFreightForwarderModal] = useState(false)
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

    const clearFormData = () => {
        setFormData({
            materialReadinessDocumentId: "",
            userId: "",
            reason: ""
        })
    }

    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState<Record <string, any>>({})
    const getUser = () => {
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
                toast.error(error)
            );
    }

    const [isLoading2, setIsLoading2] = useState(false)
    const [users, setUsers] = useState<Record <string, any>>()
    const getAllUsersForARole = () => {
        setIsLoading2(true)
        var request: Record<string, any> = {
            what: "getAllUsersForARole",
            params: {
                page: currentPage,
                pageSize: 100,
                roleName: "Freight Forwarder"
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading2(false)
                const res = response.data.data
                setUsers(res)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }
    const getMaterialReadinessDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getFreightForwarderAssignedMRDs",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                FreightForwarderId: user?.id,
                OrderBy: 2,
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

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setMrdNumber("")
    }

    const row = materialReadinessDocuments?.map((data, index) => {
        return (
            <tr key={index}>
                <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                <td>{ data.mrdNumber }</td>
                <td>{ formatDateTime(data.createdDate) }</td>
                <td>{ data.countryOfSupply }</td>
                <td>{ data?.commercialInvoices.length }</td>
                <td>{ data.destination }</td>
                {!permissions?.includes("AssignMRDtoFF") &&
                <td>
                    <div className="actions" onClick={() => {navigate("/transitofficer/materialreadinessdocument/"+data.id); 
                        dispatch(setPageContext({page: "Freight Forwarders", 
                                                url: `/transitofficer/freightforwarder-assigned-material-readiness-documents/${user.email}`,
                                                view: "Assigned ",
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                companyName: user.companyName,
                                                id: user.id}))}}>
                        <span className="material-symbols-rounded">pageview</span>
                        <span>View Details</span>
                    </div>
                </td>}
                {permissions?.includes("AssignMRDtoFF") &&
                <td className="actions">
                    <div className="dropdown">
                        <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                        <div className="dropdown-content">
                            <button
                                onClick={() => {setReassignFreightForwarderModal(true); setFormData({...formData, materialReadinessDocumentId: data?.id}); getAllUsersForARole()}}
                                >Reassign MRD</button>

                            <button
                            onClick={() => {navigate("/transitofficer/materialreadinessdocument/"+data.id); 
                                dispatch(setPageContext({page: "Freight Forwarders", 
                                url: `/transitofficer/freightforwarder-assigned-material-readiness-documents/${user.email}`,
                                view: "Assigned ",
                                firstName: user.firstName,
                                lastName: user.lastName,
                                companyName: user.companyName,
                                id: user.id}))}}>View Details</button>
                        </div>
                    </div>
                </td>}
            </tr>
        )
    })

    const handleRadioChange = (event: any) => {
        const {checked, value} = event.target
        if(checked) setFormData({...formData, userId: value})
        else setFormData({...formData, userId: ""})
    }

    const row2 = users?.map((user: any, index: number) => {
        return (
                <tr key={index}>
                    <td>
                        <input 
                        name='selectedFreightForwarder' 
                        type='radio' 
                        value={user.user.id}
                        checked={formData.userId === user.user.id}
                        onChange={handleRadioChange} />
                    </td>
                    {/* <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td> */}
                    <td>{ user.user.firstName } { user.user.lastName }</td>
                    <td>{ user.user.email }</td>
                    <td>{ user.user.companyName }</td>
                </tr>
        )
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const HandleRessignMaterialReadinessDocument = () => {
        var request: Record<string, any> = {
            what: "ReassignMaterialReadinessDocumentToFreightForwarder",
            data: formData
        };
        
        if(Object.values(formData).every(value => value)) {
            // console.log(formData)
            setIsSubmitting(true)
            makePatchRequest(request)
                .then((response: any) => {
                    setIsSubmitting(false)
                    toast.success(response.msg)
                    setReassignFreightForwarderModal(false) // close modal
                    clearFormData()
                    getMaterialReadinessDocuments()
                })
                .catch((error:any) => {toast.error(error.errorMessage); setIsSubmitting(false)});
        }else {
            toast.warning("Kindly provide information for all required fields!")
        }
    }

    useEffect(() => {
        if(accessToken) getUser()// eslint-disable-next-line
    }, [accessToken])

    useEffect(() => {
        if(accessToken && user?.id) getMaterialReadinessDocuments()
        // eslint-disable-next-line
    }, [mrdNumber, currentPage, itemsPerPage, accessToken, user])

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
                                    <span className="material-symbols-rounded">visibility</span>
                                    <p>Assigned Material Readiness Documents</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="main-inner mt-1">  
                        <div className="main-inner-top">
                            <div className="d-flex">
                                <div className="search-container left-item">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="mrdnumber" placeholder="Search MRD Number" onKeyUp={handleSearch} />
                                </div>
                                <div onClick={() => setMrdNumber((document.getElementById("mrdnumber") as HTMLInputElement)?.value)} className="custom-button orange left-item ml-2" style={{height: "20px"}}>Search</div>
                            </div>
                        </div>  
                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th>SN</th>
                                        <th>MRD Number</th>
                                        <th>Issurance Date</th>
                                        <th>Country of Supply</th>
                                        <th>Total Batched POs</th>
                                        <th>Destination</th>
                                        <th style={{width: "136px"}}>Action</th>
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

                    <Modal isOpen={reassignFreightForwarderModal} style={customStyles} className="modal modal-8" ariaHideApp={false}>
                        <div className="modal-header">
                            <h3>Reassign Material Readiness Document</h3>
                            <span className="material-symbols-rounded close"
                                onClick={() => {setReassignFreightForwarderModal(false); clearFormData()}}>close</span>
                        </div>
                        <label><span className="errorX mr-2">*</span>Select Freight Forwarder</label>
                        <div className="table-container custom modal-body mt-1" style={{minHeight: "200px", maxHeight: "300px", overflowY: "auto"}}>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th></th>
                                        <th>Name</th>
                                        <th>Official Email</th>
                                        <th>Company</th>   
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading2 ? null : (
                                                users?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                                : row2
                                            )
                                        }
                                </tbody>
                            </table>
                            {isLoading2 ? <div className="loader">
                                        <img src={loading} alt="loading" />
                                        <p>Loading data...</p>
                                    </div> : null}
                        </div>
                        <label><span className="errorX mr-2">*</span>Reason</label>
                        <textarea
                            className="mt-1" 
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            value={formData?.reason}
                        ></textarea>
                        <small style={{fontSize: "10px"}} className={formData?.reason.length >= 100 ? "mt-1 error" : "mt-1"}>{formData?.reason.length}/100 Characters</small> 

                        <div className="modal-footer bt-1">
                            <button className="custom-button grey-outline"
                                onClick={() => setReassignFreightForwarderModal(false)}>Cancel</button>
                            <button disabled={isSubmitting} type="submit" className="custom-button orange"
                                onClick={() => HandleRessignMaterialReadinessDocument()}>{isSubmitting ? "Reassigning..." : "Reassign"}</button>
                        </div>
                    </Modal>      
                </div>
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default FreightForwarderAssignedPurchaseOrders