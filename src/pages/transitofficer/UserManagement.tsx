import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal'
import { useEffect, useState } from "react";
import loading from "../../assets/images/loading.gif"
import { makeDeleteRequest, makeGetRequest, makePatchRequest, makePostRequest } from '../../request';
import { Users, Roles } from '../../interfaces/index.interface';
import { useSelector } from 'react-redux';
import Pagination from '../../components/Pagination';
import Layout from '../Layout';
import Autocomplete from "@mui/material/Autocomplete";
import { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const filterOptions = createFilterOptions({ limit: 100 });


const UserManagement =  () => {
    const accessToken:any = useSelector((state: any) => state.accessToken.value);     
    const [selectedValue, setSelectedValue] = useState<string[]>([]);
    const [formData, setFormData] = useState<Record<string, any>>({
        firstName: "",
        lastName: "",
        email: "",
        category: "",
        roleIds: [],
        companyName: "",
        department: ""
    })

    const TepngRoles = [
        "Transit Officer", 
        "Transit Manager", 
        "Port Officer", 
        "Manager",     
        "Entity Manager", 
        "Entity General Manager", 
        "Deputy General Manager Technical Logistics",
        "General Manager Technical Logistics",
        "Executive Director Technical Directorate"
        ,"C and P", 
        "Entity Representative", 
    ]
    const ThirdPartyRoles = ["Freight Forwarder", "Local Clearing Agent"]
    const [errorData, setErrorData] = useState<Record<string, any>>({})
    const [activity, setActivity] = useState("")
    const [userId, setUserId] = useState("")
    const [createUserModal, setCreateUserModal] = useState(false)
    const [updateUserModal, setUpdateUserModal] = useState(false)
    const [deleteUserModal, setDeleteUserModal] = useState(false)
    const [toggleActiveUser, setToggleActiveUser] = useState(false)

    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        }
    }; 

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
            firstName: "",
            lastName: "",
            email: "",
            category: "",
            roleIds: [],
            companyName: "",
            department: ""
        })
        setErrorData([])
        // setSelectedRoles([])
        setSelectedValue([])
    }

    const handleOpenModal = (modal: any) => {
        switch(modal){
            case "CreateUserModal":
                clearFormData()
                getAllRoles()
                setCreateUserModal(true)
                break

            case "UpdateUserModal":
                setUpdateUserModal(true)
                getAllRoles()
                setErrorData([])
                break

            case "ToggleActiveUser":
                setToggleActiveUser(true)
                break

            case "DeleteUser":
                setDeleteUserModal(true)
                break

            default:
                break
        }
    }

    const handleCloseModal = (modal: any) => {
        switch(modal){
            case "CreateUserModal":
                setCreateUserModal(false)
                break

            case "UpdateUserModal":
                setUpdateUserModal(false)
                clearFormData()
                break

            case "ToggleActiveUser":
                setToggleActiveUser(false)
                setActivity("")
                setUserId("")
                break

            case "DeleteUser":
                setUserId("")
                setDeleteUserModal(false)
                break

            case "":

                break

            default:
                break
        }
    }
    const [users, setUsers] = useState<Users[]>()
    const [roles, setRoles] = useState<Roles[]>()
    // const [filterCategoryValue, setFilterCategory] = useState("")
    const [filterRoleValue, setFilterRole] = useState("")
    const [searchValue, setSearchValue] = useState("")

    const [isLoading, setIsLoading] = useState(false)
    const getAllUsers = () => {
        if(filterRoleValue) setFilterRole("")
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getAllUsers",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                Role: "Transit Officer"
            }
        };
        if(searchValue) request.params.SearchString = searchValue
        // if(filterCategoryValue) request.params.Category = filterCategoryValue
        
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

    // const getAllUsersForARole = () => {
    //     setIsLoading(true);
    //     var request: Record<string, any> = {
    //         what: "getAllUsersForARole",
    //         params: {
    //             page: currentPage,
    //             pageSize: itemsPerPage,
    //             roleName: filterRoleValue
    //         }
    //     };        
    //     makeGetRequest(request)
    //         .then((response: any) => {
    //             setIsLoading(false)
    //             const res = response.data.data
    //             setUsers(res)
    //             setTotalItems(response.data.totalCount)
    //         })
    //         .catch((error:any) => 
    //             console.log(error)
    //             // toast.error(error.msg)
    //         );
    // }

    const getAllRoles = () => {
        var request: Record<string, any> = {
            what: "getAllRoles",
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                setRoles(res)
            })
            .catch((error:any) => toast.error(error.msg));
    }

    const [isSubmitting, setIsSubmitting] = useState(false)
    const DeleteUser = () => {
        var request: Record<string, any> = {
            what: "DeleteUser",
            params: {
                Email: userId
            }
        };
        
        setIsSubmitting(true)
        makeDeleteRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                handleCloseModal("DeleteUser")
                toast.success(response.msg)
                getAllUsers()
            })
            .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
    }

    const ActivateDeactivateUser = () => {
        var request: Record<string, any> = {
            what: activity === "activate" ? "ActivateUser" : "DeactivateUser",
            params: {
                userId: userId
            }
        };
        setIsSubmitting(true)
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success(response.msg)
                handleCloseModal("ToggleActiveUser")
                getAllUsers()
            })
            .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
    }

    const getUser = (id:string) => {
        const user = users?.find(user => user.user.id === id)
        const roleIds = user?.roles.map((userRole: string) => {
            const foundRole = roles?.find((role: any) => role.name === userRole);          
            // Check if foundRole is not undefined before setting it
            if (foundRole) return foundRole.id;          
            return null;
        });
          
        setFormData({
            id: user?.user.id,
            firstName: user?.user.firstName,
            lastName: user?.user.lastName,
            email: user?.user.email,
            category: user?.user.category,
            roleIds: roleIds,
            companyName: user?.user.companyName,
            address: user?.user.address,
            department: user?.user.department
        })
        setSelectedValue(roles?.filter(obj => roleIds?.includes(obj.id))?.map(obj => obj.name) ?? []);
        // setSelectedRoles(roleIds)
    }

    const HandleOnboardUser = () => {     
        var isCompanyNameSet, isAddressSet;    
      
        if (formData.category === "THIRDPARTY" && !formData.companyName) {
            isCompanyNameSet = false
            setErrorData({ ...errorData, companyName: 'This field is required' });
        } else isCompanyNameSet = true

        if (formData.category === "THIRDPARTY" && !formData.address) {
            isAddressSet = false
            setErrorData({ ...errorData, address: 'This field is required' });
        } else isAddressSet = true
        
        if(isCompanyNameSet && isAddressSet) {  
            setIsSubmitting(true)          
            setErrorData({ ...errorData, companyName: '' })            
            let data:any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                roleIds: formData.roleIds,
                category: formData.category,
            }

            if (Object.values(data).every(value => value)){
                data.companyName = formData.companyName
                data.address = formData.address
                data.department = formData.department
                var request:Record<string, any> = {
                    what: "OnboardUser",
                    data: data
                };             
                makePostRequest(request)
                    .then((response: any) => {  
                        setIsSubmitting(false)          

                        toast.success(response.msg)
                        handleCloseModal('CreateUserModal')  // close modal 
                        // display the newly added user 
                        setSearchValue(response.data.data.user.email)      
                        // getAllUsers() 
                    })
                    .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
            }else {
                toast.warning("Please provide information for all required fields")
            }
        }       
    }

    const HandleEditUser = () => {  
        let isFormReady;    
      
        if (formData.category === "THIRDPARTY" && !formData.companyName) {
            isFormReady = false
            setErrorData({ ...errorData, companyName: 'This field is required' });
        } else isFormReady = true

        if(formData.roleIds.length === 0) isFormReady = false
        else isFormReady = true;      
        
        if(isFormReady) {        
            setIsSubmitting(true)    
            setErrorData({ ...errorData, companyName: '' })            
            let data:any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                roleIds: formData.roleIds,
                category: formData.category,
            }

            if (Object.values(data).every(value => value)){
                data.companyName = formData.companyName
                data.address = formData.address
                data.department = formData.department
                
                var request:Record<string, any> = {
                    what: "UpdateUser",
                    data: data,
                    params: {
                        userId: formData.id
                    }
                };             
                makePatchRequest(request)
                    .then((response: any) => {    
                        setIsSubmitting(false)                 
                        toast.success(response.msg)
                        handleCloseModal('UpdateUserModal')  // close modal    
                        setSearchValue(response.data.user.email)
                    })
                    .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false) });
            }else {
                toast.warning("Please provide information for all required fields")
            }
        }       
    }

    useEffect(() => {
        if(formData.roleIds.length === 0) setErrorData({ ...errorData, eRole: 'This field is required' }); 
        else setErrorData({ ...errorData, eRole: '' })// eslint-disable-next-line
    }, [formData.roleIds])

    const handleChange = (event: any) => {        
        const { name, value } = event.target //get data form each input on change
        // if(name === "category") setSelectedRoles([]); 
        setFormData(values => ({...formData, [name]: value})) //set retrieved values to "formData" object 
    }

    // const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const { value, checked } = event.target;
    //     // setSelectedRoles(event.target.value)
    //     if (checked) {
    //         setSelectedRoles((prevSelectedRoles) => [...prevSelectedRoles, value]);
    //     } else {
    //         setSelectedRoles((prevSelectedRoles) =>
    //             prevSelectedRoles.filter((role:string) => role !== value)
    //         );
    //     }        
    // };

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

    useEffect(() => {
        // Update formData.role whenever selectedRoles changes
        setFormData({ ...formData, 
            roleIds: selectedValue.length ? roles
            ?.filter(obj => selectedValue.includes(obj.name)) // Filter objects whose name is in the namesArray
            .map(obj => obj.id) : []
            })
            // eslint-disable-next-line
    }, [selectedValue]);

    // useEffect(() => {
    //     // Update formData.role whenever selectedRoles changes
    //     setFormData({ ...formData, roleIds: selectedRoles }); // eslint-disable-next-line
    // }, [selectedRoles]);

    const row = users?.map((user, index) => {
        return (
                <tr key={index}>
                    <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                    <td>{ user.user.firstName } { user.user.lastName }</td>
                    <td><span onClick={() => handleCopy(user.user.email)} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>
                        { user.user.email }</td>
                    <td>{ user.user.category }</td>
                    <td>{ user.roles.join(", ") }</td>
                    <td><span className={user.user.isEnabled ? 'status green' : 'status red'}>{user.user.isEnabled ? "Active" : "Inactive"}</span></td>
                    <td className="actions">
                        <div className="dropdown">
                            <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                            <div className="dropdown-content">
                                <button
                                disabled={!user.user.isEnabled}
                                onClick={() => {handleOpenModal("UpdateUserModal"); getUser(user.user.id)}}
                                >View/Edit</button>

                                {user.user.isEnabled && <button
                                disabled={!user.user.isEnabled}
                                onClick={() => {handleOpenModal("ToggleActiveUser"); setActivity("deactivate"); setUserId(user.user.id)}}
                                >Deactivate</button>}

                                {!user.user.isEnabled && <button
                                disabled={user.user.isEnabled}
                                onClick={() => {handleOpenModal("ToggleActiveUser"); setActivity("activate"); setUserId(user.user.id)}}
                                >Activate</button>}

                                {/* <button
                                onClick={() => {handleOpenModal("DeleteUser"); setUserId(user.user.email)}}
                                // disabled={!user.user.isEnabled || userDetails?.email === user?.user.email}
                                // title={userDetails?.email === user?.user.email ? "You cannot delete the current user" : ""}
                                >Delete</button> */}
                            </div>
                        </div>
                    </td>
                </tr>
        )
    })
    // const formatRoleNames = (name: string) => {
    //     if(name.includes("Deputy General Manager")) return name.replace("Deputy General Manager", "DGM")
    //     else if(name.includes("General Manager")) return name.replace("General Manager", "GM")
    //     else if(name.includes("Executive Director")) return name.replace("Executive Director", "ED")
    //     else return name
    // }

    // const rowRoles = roles?.map((role, i) => {
    //     if(formData.category){
    //         return (
    //             (formData.category === "TEPNG" ? TepngRoles : ThirdPartyRoles).includes(role.name) && <>
    //                 <input
    //                     name="roleIds"
    //                     type="checkbox"
    //                     value={role.id}
    //                     key={i}
    //                     // onChange={handleCheckboxChange}
    //                     checked={formData.roleIds?.includes(role.id)}
    //                 /> <label>{formatRoleNames(role.name)}</label>
                    
    //                 <br />                    
    //             </>
    //         )
    //     }return null
    // })

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }
    useEffect(() => {
        if(!searchValue) setUsers([])
    }, [searchValue])

    useEffect(() => {
        if(accessToken && searchValue) getAllUsers() // eslint-disable-next-line
    }, [currentPage, itemsPerPage, searchValue])

    const [usersList, setUsersList] = useState([])
    const getAllTotalEnergiesUsers = () => {        
        var request: Record<string, any> = {
            what: "getAllTotalEnergiesUsers",
            params: {}
        };

        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                const formattedRecords = res.map((record: any) => {
                    return {label: `${record.firstName} ${record.lastName} - ${record.email}`, 
                    value: record.email, 
                    firstName: record.firstName, 
                    lastName: record.lastName,
                    department: `${record.department}; ${record.userId}`}
                })
                
                setUsersList(formattedRecords)
            })
            .catch((error:any) => 
                {toast.error(error);}
            );
    }

    useEffect(() => {
        if(accessToken) getAllRoles(); getAllTotalEnergiesUsers()
    }, [accessToken])   

    const page = "User Management"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>     
                    <div className="main-inner">
                        <div className="main-inner-top">
                            <div className="d-flex gap-2">
                                <div className="search-container">
                                    <span className="material-symbols-rounded">search</span>
                                    <input id="search" placeholder="Search Users" onKeyUp={handleSearch} />
                                </div>
                                <button className="custom-button orange" disabled={isLoading}
                                    onClick={() => {setSearchValue((document.getElementById("search") as HTMLInputElement)?.value); setCurrentPage(1)}}
                                >{isLoading ? "Searching..." : "Search"}</button>
                            </div>

                            {/* <select value={filterRoleValue} className='right-item' onChange={handleFilterRole} >
                                <option key="0" value="">All Roles</option>
                                {
                                    roles?.map((role, index) => {
                                        return (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        )
                                    })
                                }
                            </select> */}
                            {/* <select className='right-item' id='category' value={filterCategoryValue} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option key="0" value="">All Category</option>
                                <option key="1" value="TEPNG">TEPNG Staff</option>
                                <option key="2" value="THIRDPARTY">Third-Party User</option>
                            </select> */}
                            <button className="custom-button orange ml-2" onClick={() => handleOpenModal("CreateUserModal")}>
                                <span className="material-symbols-rounded">person</span>Onboard User
                            </button>
                        </div>                        

                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>SN</th>
                                        <th>Name</th>
                                        <th>Official Email</th>
                                        <th>Category</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th style={{width: "80px"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {isLoading ? null : (
                                        !users?.length ? <td className='no-records' colSpan={7}>{!searchValue ? "Search users to filter table" : "No Records Found"}</td>
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
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    handlePrevious={handlePrevious}
                                    handleNext={handleNext}
                                    setCurrentPage={setCurrentPage}
                                    getPageNumbers={getPageNumbers}
                                    setItemsPerPage={setItemsPerPage} />
                        </div> 
                    </div>                 
                </div>
            </div>

            <Modal isOpen={createUserModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Onboard User</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => handleCloseModal("CreateUserModal")}>close</span>
                </div>
                <div className="modal-body" style={{maxHeight: "400px", overflowY: "auto"}}>
                    <div className="d-flex gap-2" style={{alignItems: "start"}}>
                        <div className="w-50">
                            <label><span className="errorX mr-2">*</span>Category</label>
                            <select name='category' value={formData.category} onChange={handleChange}>
                                <option value="" key="0" disabled>Select Category</option>
                                <option value="TEPNG" key="1">TotalEnergies Staff</option>
                                <option value="THIRDPARTY" key="2">Third-Party User</option>
                            </select>
                            <p className="error">{ errorData.category }</p>
                        </div>
                        <div className="w-50">
                            <label><span className="errorX mr-2">*</span>Roles 
                            <span className='small-text'> (Multi-Choice)</span>
                            </label>  
                                <FormControl sx={{p: 0, mt: 1 }}>
                                    <Select
                                    multiple
                                    style={{width: "235px", borderRadius: "6px", margin: "0", fontSize: "12px"}}
                                    disabled={formData.category === ""}
                                    displayEmpty
                                    value={selectedValue}
                                    onChange={(event) => {
                                        const {
                                            target: { value },
                                        } = event;
                                        setSelectedValue(
                                            // On autofill we get a stringified value.
                                            typeof value === 'string' ? value.split(',') : value
                                        );
                                    }}
                                    input={<OutlinedInput />}
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                        return <em>Select...</em>;
                                        }

                                        return selected.join(', ');
                                    }}
                                    // MenuProps={MenuProps}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                    <MenuItem disabled value="" style={{fontSize: "12px"}}>
                                        <em>Select Role</em>
                                    </MenuItem>
                                    {roles
                                        ?.filter(role => 
                                            (formData.category === "TEPNG" ? TepngRoles : ThirdPartyRoles).includes(role.name)
                                        )
                                        .map(role => (
                                            <MenuItem
                                            key={role.id}
                                            value={role.name}                                            
                                            style={{ fontSize: "12px", padding: "8px !important" }}
                                            >
                                            {role.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            {/* <div className='role-checklist'>                                    
                                { rowRoles }                                  
                            </div> */}
                            <p className="error">{ errorData.role }</p>
                        </div>                            
                    </div>                    
                    
                    {formData.category && <label><span className="errorX mr-2">*</span>Official Email</label>}
                    {formData.category === "THIRDPARTY" && <input name="email" value={formData.email} 
                        disabled={!formData.roleIds.length}
                        onChange={handleChange} 
                        onKeyUp={() => {
                            formData.email.length < 1 ? setErrorData({ ...errorData, email: 'This field is required' }) : 
                            setErrorData({ ...errorData, email: '' })}} /> }                                           
                     
                     {formData.category === "TEPNG" && <Autocomplete             
                            // name="email"                                          
                            filterOptions={filterOptions}                            
                            disableClearable={true}
                            disabled={!formData.roleIds.length}
                            onChange={(e, option:any) => setFormData({...formData, 
                                'email': option.value, 
                                'firstName': option.firstName, 
                                'lastName': option.lastName,
                                'department': option.department })}
                            isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                            options={usersList}                            
                            className='mt-1'                            
                            renderInput={(params) => 
                                <TextField placeholder='Select...' variant='outlined' {...params} />} /> }                     
                    <p className="error">{ errorData.email }</p>

                    <div className="d-flex gap-2">
                        <div>
                            <label><span className="errorX mr-2">*</span>First Name</label>
                            <input name="firstName" value={formData.firstName} 
                                disabled={!formData.roleIds?.length || formData.category === "TEPNG" }
                                onChange={handleChange} 
                                onKeyUp={() => {
                                    formData.firstName.length < 1 ? setErrorData({ ...errorData, firstName: 'This field is required' }) : 
                                    setErrorData({ ...errorData, firstName: '' })}} />
                            <p className="error">{ errorData.firstName }</p>
                        </div>
                        <div>
                            <label><span className="errorX mr-2">*</span>Last Name</label>
                            <input name="lastName" value={formData.lastName} 
                                disabled={!formData.roleIds?.length || formData.category === "TEPNG"}
                                onChange={handleChange} 
                                onKeyUp={() => {
                                    formData.lastName.length < 1 ? setErrorData({ ...errorData, lastName: 'This field is required' }) : 
                                    setErrorData({ ...errorData, lastName: '' })}} />
                            <p className="error">{ errorData.lastName }</p>
                        </div>
                    </div>   

                    {formData.category === "THIRDPARTY" && 
                    <>
                        <label><span className="errorX mr-2">*</span>Company Name</label>
                        <input name="companyName" value={formData.companyName} 
                            disabled={!formData.roleIds.length}
                            onChange={handleChange} 
                            onKeyUp={() => {
                                formData.companyName.length < 1 ? setErrorData({ ...errorData, companyName: 'This field is required' }) : 
                                setErrorData({ ...errorData, companyName: '' })}} />                        
                        <p className="error">{ errorData.companyName }</p>
                    </>} 

                    {formData.category === "THIRDPARTY" && 
                    <>
                        <label><span className="errorX mr-2">*</span>Company Address</label>
                        <textarea
                            name="address" 
                            value={formData.address} 
                            className='mt-1'
                            rows={3}
                            disabled={!formData.roleIds.length}
                            onChange={handleChange} 
                            onKeyUp={() => {
                                formData.address.length < 1 ? setErrorData({ ...errorData, address: 'This field is required' }) : 
                                setErrorData({ ...errorData, address: '' })}}
                        ></textarea>                       
                        <p className="error">{ errorData.address }</p>
                    </>} 

                    {/* <label><span className="errorX mr-2">*</span>Department</label>
                    <input name="department" value={formData.department} 
                        disabled={true}
                        onChange={handleChange} 
                        onKeyUp={() => {
                            formData.department.length < 1 ? setErrorData({ ...errorData, department: 'This field is required' }) : 
                            setErrorData({ ...errorData, department: '' })}} />                        
                    <p className="error">{ errorData.department }</p>                            */}
                </div>
                {/* <p className="or-text">or</p> */}
                <div className="modal-footer bt-1">
                    <button className="custom-button grey-outline"
                        onClick={() => handleCloseModal("CreateUserModal")}>Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="custom-button orange"
                        onClick={() => HandleOnboardUser()}>{isSubmitting ? "Loading..." : "Submit"}</button>
                </div>
            </Modal>

            <Modal isOpen={updateUserModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Edit User</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => handleCloseModal("UpdateUserModal")}>close</span>
                </div>
                <div className="modal-body" style={{maxHeight: "400px", overflowY: "auto"}}>
                    <div className="d-flex">
                        <div className="mr-2 w-50">
                            <label><span className="errorX mr-2">*</span>Category</label>
                            <select name='category' value={formData.category} onChange={handleChange}>
                                <option value="" key="0" disabled>Select Category</option>
                                <option value="TEPNG" key="1">TotalEnergies Staff</option>
                                <option value="THIRDPARTY" key="2">Third-Party User</option>
                            </select>
                            <p className="error">{ errorData.category }</p>
                        </div>
                        <div className="ml-2 w-50">
                            <label><span className="errorX mr-2">*</span>Roles 
                            <span className='small-text'> (Multi-Choice)</span>
                            </label>  
                            <FormControl sx={{p: 0, mt: 1 }}>
                                <Select
                                multiple
                                style={{width: "235px", borderRadius: "6px", margin: "0", fontSize: "12px"}}
                                disabled={formData.category === ""}
                                displayEmpty
                                value={selectedValue}
                                onChange={(event) => {
                                    const {
                                        target: { value },
                                    } = event;
                                    setSelectedValue(
                                        // On autofill we get a stringified value.
                                        typeof value === 'string' ? value.split(',') : value
                                    );
                                }}
                                input={<OutlinedInput />}
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                    return <em>Select...</em>;
                                    }

                                    return selected.join(', ');
                                }}
                                // MenuProps={MenuProps}
                                inputProps={{ 'aria-label': 'Without label' }}
                                >
                                <MenuItem disabled value="" style={{fontSize: "12px"}}>
                                    <em>Select Role</em>
                                </MenuItem>
                                {roles
                                    ?.filter(role => 
                                        (formData.category === "TEPNG" ? TepngRoles : ThirdPartyRoles).includes(role.name)
                                    )
                                    .map(role => (
                                        <MenuItem
                                        key={role.id}
                                        value={role.name}                                            
                                        style={{ fontSize: "12px", padding: "8px !important" }}
                                        >
                                        {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* <div className='role-checklist'>                                    
                                { rowRoles }                                  
                            </div> */}
                            <p className="error">{ errorData.eRole }</p>
                        </div>                            
                    </div>
                    <label><span className="errorX mr-2">*</span>Official Email</label>
                    <input name="email" value={formData.email} 
                        disabled={true}
                        onChange={handleChange} 
                        onKeyUp={() => {
                            formData.email.length < 1 ? setErrorData({ ...errorData, email: 'This field is required' }) : 
                            setErrorData({ ...errorData, email: '' })}} />                        
                    <p className="error">{ errorData.email }</p>   
                    <div className="d-flex">
                        <div className="mr-2">
                            <label><span className="errorX mr-2">*</span>First Name</label>
                            <input name="firstName" value={formData.firstName} 
                                disabled={!formData.roleIds.length || formData.category === "TEPNG"}
                                onChange={handleChange} 
                                onKeyUp={() => {
                                    formData.firstName.length < 1 ? setErrorData({ ...errorData, firstName: 'This field is required' }) : 
                                    setErrorData({ ...errorData, firstName: '' })}} />
                            <p className="error">{ errorData.firstName }</p>
                        </div>
                        <div className="ml-2">
                            <label><span className="errorX mr-2">*</span>Last Name</label>
                            <input name="lastName" value={formData.lastName} 
                                disabled={!formData.roleIds.length || formData.category === "TEPNG"}
                                onChange={handleChange} 
                                onKeyUp={() => {
                                    formData.lastName.length < 1 ? setErrorData({ ...errorData, lastName: 'This field is required' }) : 
                                    setErrorData({ ...errorData, lastName: '' })}} />
                            <p className="error">{ errorData.lastName }</p>
                        </div>
                    </div>
                    
                    {formData.category === "THIRDPARTY" && 
                    <>
                        <label><span className="errorX mr-2">*</span>Company Name</label>
                        <input name="companyName" value={formData.companyName} 
                            disabled={!formData.roleIds.length}
                            onChange={handleChange} 
                            onKeyUp={() => {
                                formData.companyName.length < 1 ? setErrorData({ ...errorData, companyName: 'This field is required' }) : 
                                setErrorData({ ...errorData, companyName: '' })}} />                        
                        <p className="error">{ errorData.companyName }</p>
                    </>} 

                    {formData.category === "THIRDPARTY" && 
                    <>
                        <label><span className="errorX mr-2">*</span>Company Address</label>
                        <textarea
                            name="address" 
                            value={formData.address} 
                            className='mt-1'
                            rows={3}
                            disabled={!formData.roleIds.length}
                            onChange={handleChange} 
                            onKeyUp={() => {
                                formData.address.length < 1 ? setErrorData({ ...errorData, address: 'This field is required' }) : 
                                setErrorData({ ...errorData, address: '' })}}
                        ></textarea>                                              
                        <p className="error">{ errorData.address }</p>
                    </>} 

                    {/* <label><span className="errorX mr-2">*</span>Department</label>
                    <input name="department" value={formData.department} 
                        disabled={!formData.roleIds.length}
                        onChange={handleChange} 
                        onKeyUp={() => {
                            formData.department.length < 1 ? setErrorData({ ...errorData, department: 'This field is required' }) : 
                            setErrorData({ ...errorData, department: '' })}} />                        
                    <p className="error">{ errorData.department }</p>                           */}
                </div>
                {/* <p className="or-text">or</p> */}
                <div className="modal-footer bt-1">
                    <button className="custom-button grey-outline"
                        onClick={() => handleCloseModal("UpdateUserModal")}>Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="custom-button orange"
                        onClick={() => HandleEditUser()}>{isSubmitting ? "Loading..." : "Update"}</button>
                </div>
            </Modal>

            <Modal isOpen={toggleActiveUser} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Are you sure you want to {activity} this user?</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => handleCloseModal("ToggleActiveUser")}>close</span>
                </div>
                <div className="modal-footer">
                    <button className="custom-button grey-outline"
                        onClick={() => handleCloseModal("ToggleActiveUser")}>Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="custom-button orange"
                        onClick={() => ActivateDeactivateUser()}>{isSubmitting ? "Loading..." : "Yes"}</button>
                </div>
            </Modal> 

            <Modal isOpen={deleteUserModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Are you sure you want to delete this user?</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => handleCloseModal("DeleteUser")}>close</span>
                </div>
                <div className="modal-footer">
                    <button className="custom-button grey-outline"
                        onClick={() => handleCloseModal("DeleteUser")}>Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="custom-button orange"
                        onClick={() => DeleteUser()}>{isSubmitting ? "Loading..." : "Yes"}</button>
                </div>
            </Modal> 
            <ToastContainer />
        </Layout>
    )
}

export default UserManagement