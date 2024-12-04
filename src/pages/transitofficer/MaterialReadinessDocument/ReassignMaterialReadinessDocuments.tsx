import { FormEvent, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { makeGetRequest, makePatchRequest } from "../../../request";

import { useSelector } from "react-redux";
import { customStyles } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from "../../Layout";
import { Users } from "../../../interfaces/index.interface";
import Modal from 'react-modal'

const ReassignMaterialReadinessDocuments =  () => {
    const navigate = useNavigate()
    const param = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [freightForwarder, setFreightForwarder] = useState<Record <string, string>>({})
    const [isOpenReasonModal, setIsOpenReasonModal] = useState(false)

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

    // const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { value, checked } = e.target;
      
    //     if (checked) {
    //       const selectedUser = users?.find((user: any) => user.user.id === value);      
    //       if (selectedUser) {
    //         setFreightForwarder({
    //             id: selectedUser.user.id,
    //             companyName: selectedUser.user.companyName
    //         });
    //     }

    //       setIsOpenReasonModal(true)
    //     }else setFreightForwarder({});
    // };

    const handleSelection = (id: string) => {
        const selectedUser = users?.find((user: any) => user.user.id === id);      
          if (selectedUser) {
            setFreightForwarder({
                id: selectedUser.user.id,
                companyName: selectedUser.user.companyName
            });
        }
        setIsOpenReasonModal(true)
    }

    const [previouslyAssignedFreightForwarderId, setPreviouslyAssignedFreightForwarderId] = useState("")
    const getMaterialReadinessDocumentById = () => {
        var request: Record<string, any> = {
            what: "getMaterialReadinessDocumentById",
            id: param.id
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data.freightForwarderId
                setPreviouslyAssignedFreightForwarderId(res)
            })
            .catch((error:any) => toast.error(error))
    }

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

    const row = users?.map((user, index) => {
        return (
                <tr 
                key={index} 
                title={previouslyAssignedFreightForwarderId === user.user.id ? "The current assigned freight forwarder" : ""}
                className={previouslyAssignedFreightForwarderId === user.user.id ? "disabled": ""}>
                    {/* <td><input 
                        value={user.user.id} 
                        name="id"
                        type="radio" 
                        onChange={handleCheck}
                        checked={freightForwarder === user.user.id} /></td> */}
                    <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                    <td>{ user.user.firstName }</td>
                    <td>{ user.user.lastName }</td>
                    <td><span onClick={() => handleCopy(user.user.email)} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>
                        { user.user.email }</td>
                    <td>{ user.user.companyName }</td>
                    <td>
                        {previouslyAssignedFreightForwarderId !== user.user.id && <div className="actions orange" onClick={() => handleSelection(user.user.id)}>
                            <span className="material-symbols-rounded">switch_account</span>
                            <p className="m-0">Reassign</p>
                        </div>}
                    </td>
                </tr>
        )
    })

    const [isSubmitting, setIsSubmitting] = useState(false)    
    const [reason, setReason] = useState("")    
    const HandleReassignMaterialReadinessDocuments = (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "ReassignMaterialReadinessDocuments",
            data: {
                userId: freightForwarder.id,
                materialReadinessDocumentId: param.id,
                reason: reason
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success(response.msg)
                setReason("")

                setTimeout(() => {
                    navigate("/transitofficer/materialreadinessdocument")
                }, 1000);                    
            })
            .catch((error:any) => {toast.error(error.errorMessage); setIsSubmitting(false)});
    }
    
    useEffect(() => {
        if(accessToken) getAllUsersForARole() // eslint-disable-next-line        
    }, [accessToken, currentPage, itemsPerPage, searchValue])

    useEffect(() => {
        getMaterialReadinessDocumentById() // eslint-disable-next-line
    }, [])

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const page = "Freight Forwarder"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main mt-2">
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <Link to={"/transitofficer/materialreadinessdocument"} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
                            </Link> 
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">assignment</span>
                                    <p>Reassign Material Readiness Document</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="main-inner mt-1">  
                        <div className="main-inner-top" style={{ justifyContent: "center"}}>
                            <div className="d-flex">
                                <div className="search-container left-item">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="search" placeholder="Search Freight Forwarder" onKeyUp={handleSearch} />
                                </div>
                                <div style={{height: "20px"}} onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}} className="custom-button orange left-item ml-2">Search</div>
                            </div>
                        </div>  
                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>SN</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Official Email</th>
                                        <th>Company Name</th>
                                        <th>Action</th>
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
                </div>
            </div>
            <Modal isOpen={isOpenReasonModal} style={customStyles} className="modal modal-4" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Reassign</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => setIsOpenReasonModal(false)}>close</span>
                </div>
                <form onSubmit={HandleReassignMaterialReadinessDocuments}>
                <div className="modal-body">
                    <div>
                        <label>
                            <span className="errorX mr-2">*</span>Freight Forwarder
                        </label>  
                        <input type="text" disabled value={freightForwarder.companyName} />
                    </div> 
                    <div className="mt-1">
                        <label>
                            <span className="errorX mr-2">*</span>Reason for reassigment
                        </label>  
                        <textarea className="mt-1" name="comment" placeholder="Write a message..." 
                        rows={4} 
                        maxLength={100}
                        onChange={(event) => setReason(event.target.value)}
                        value={reason} 
                        required ></textarea>
                    </div> 
                    <small style={{fontSize: "10px"}} className={reason.length >= 100 ? "mt-1 error" : "mt-1"}>{reason.length}/100 Characters</small> 
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => setIsOpenReasonModal(false)}>Cancel</button>
                    <button type="submit" 
                    disabled={isSubmitting}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Submit"}</button>
                </div>
                </form>
            </Modal>
            <ToastContainer />
        </Layout>
    )
}

export default ReassignMaterialReadinessDocuments