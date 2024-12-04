import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal'
import { useEffect, useState } from "react";
import loading from "../../assets/images/loading.gif"
import { makeGetRequest, makePatchRequest } from '../../request';
import { Permissions, Users } from '../../interfaces/index.interface';
import { useSelector } from 'react-redux';
import Pagination from '../../components/Pagination';
import Layout from '../Layout';
import { customStyles, handleCopy } from 'helpers';

const UserPermissionsManagement =  () => {
    const accessToken:any = useSelector((state: any) => state.accessToken.value); 

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

    const [users, setUsers] = useState<Users[]>()
    const [permissions, setPermissions] = useState<Permissions[]>()
    const [searchValue, setSearchValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isLoading2, setIsLoading2] = useState(false)
    const getAllUsersForARole = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getAllUsersForARole",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                roleName: "C And P"
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

    const getAllPermissions = () => {
        var request: Record<string, any> = {
            what: "getAllPermissions",
            params: {
                role: "C And P"
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setPermissions(res)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }

    const AssignUserToPermissions = (permissions: String[], userId: string) => {
        setIsLoading2(true)
        var request: Record<string, any> = {
            what: "AssignUserToPermissions",
            data: {
                permissionIds: permissions,
                userId: userId
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsLoading2(false)
                toast.success(response.msg)
                getAllUsersForARole()
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsLoading2(false)}
            );
    }

    const RemoveUserFromPermissions = (permissions: String[], userId: string) => {
        setIsLoading2(true)
        var request: Record<string, any> = {
            what: "RemoveUserFromPermissions",
            data: {
                permissionIds: permissions,
                userId: userId
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsLoading2(false)
                toast.success(response.msg)
                getAllUsersForARole()
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsLoading2(false)}
            );
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, userId: string) => {
        const { value, checked } = event.target;
        if (checked) {
            AssignUserToPermissions([value], userId)
        } else {
            RemoveUserFromPermissions([value], userId)
        } 
    };

    const row = users?.map((user, index) => {
        return (
                <tr key={index} 
                    className={`${ user.user.isEnabled ? "" : "disabled" }`}
                    title={`${ user.user.isEnabled ? "" : "This user is disabled" }`}
                    >
                    <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                    <td>{ user.user.firstName } { user.user.lastName }</td>
                    <td><span onClick={() => {if(user.user.isEnabled) handleCopy(user.user.email)}} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>
                        { user.user.email }</td>
                    {!permissions && <td colSpan={4}></td>}
                    {
                        permissions &&
                        permissions?.filter((permission) => permission.name !== "UploadPFI" && permission.name !== "ValidatePFI")
                        ?.map((permission, index) => {
                            return (
                                <td key={index}>
                                    <input 
                                        disabled={!user.user.isEnabled}
                                        name={permission.name} 
                                        type="checkbox" 
                                        value={permission.id} 
                                        onChange={(event) => handleCheckboxChange(event, user.user.id)}
                                        checked={user.permissions?.includes(permission.name)} 
                                        /></td>      
                            )
                        })   
                    }                
                </tr>
        )
    })

    useEffect(() => {
        if(accessToken) getAllUsersForARole(); getAllPermissions()
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue])

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const page = "C And P Permissions"

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
                                    <input id="search" placeholder="Search Users" onKeyUp={handleSearch} />
                                </div>
                                <button className="custom-button orange left-item ml-2"
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >Search</button>
                            </div>                            
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>SN</th>
                                        <th>Name</th>
                                        <th>Official Email</th>
                                        <th>Validate MRD</th>
                                        <th>View Entire Workflow</th>
                                        <th>Track Purchase Orders</th>
                                        {/* <th>Upload PFI</th>
                                        <th>Validate PFI</th> */}
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
            <Modal isOpen={isLoading2} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
            <ToastContainer /> 
        </Layout>
    )
}

export default UserPermissionsManagement