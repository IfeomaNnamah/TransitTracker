import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { makeGetRequest } from '../../../request';
import { Users } from '../../../interfaces/index.interface';
import { useSelector } from 'react-redux';
import Pagination from '../../../components/Pagination';
import Layout from '../../Layout';

const LocalClearingAgent =  () => {
    const accessToken:any = useSelector((state: any) => state.accessToken.value); 
    const navigate = useNavigate()

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
                roleName: "Local Clearing Agent"
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
                <tr key={index}>
                    <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                    <td>{ user.user.firstName }</td>
                    <td>{ user.user.lastName }</td>
                    <td><span onClick={() => handleCopy(user.user.email)} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>
                        { user.user.email }</td>
                    <td>{ user.user.companyName }</td>
                    <td className="actions">
                        <div className="dropdown">
                            <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                            <div className="dropdown-content">
                                <button
                                onClick={() => {navigate("/transitofficer/batch-assign-shipping-documents/"+user.user.email);}}
                                >Batch Assign Shipping Documents</button>

                                <button
                                onClick={() => {navigate("/transitofficer/assigned-shipping-documents/"+user.user.email);}}
                                >View Assigned Shipping Documents</button>
                            </div>
                        </div>
                    </td>
                </tr>
        )
    })

    useEffect(() => {
        if(accessToken) getAllUsersForARole()
        // eslint-disable-next-line
    }, [accessToken, currentPage, itemsPerPage, searchValue])

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const page = "Local Clearing Agent Assignment"

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
                                    <input id="search" placeholder="Search Local Clearing Agents" onKeyUp={handleSearch} />
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
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Official Email</th>
                                        <th>Company Name</th>
                                        <th style={{width: "220px"}}>Action</th>
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
            <ToastContainer /> 
        </Layout>
    )
}

export default LocalClearingAgent