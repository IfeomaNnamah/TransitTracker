import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import { makeGetRequest, makePostRequest } from "../../../request";
import { useSelector } from "react-redux";
import { formatDateTime } from "../../../helpers";
import Pagination from "../../../components/Pagination";
import Layout from "../../Layout";
import { MRDInfo, SelectedMRD } from "../../../interfaces/materialreadinessdocument.interface";

const CreateProofOfCollection =  () => {

    // VARIABLE DEFINITION
    const navigate = useNavigate()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const [materialReadinessDocuments, setMaterialReadinessDocuments] = useState<MRDInfo[]>()
    const [mrdNumber] = useState("")
    const [selectedMRDs, setSelectedMRDs] = useState<SelectedMRD[]>([])
    const [formData, setFormData] = useState<Record <string, any>>({
        pickUpDate: "",
        freightForwarderReference: "TEPNG-" + (user?.id).substring(0, 8).toUpperCase(),
        packaging: "",
        freightForwarderAddress: ""
    } )
    // const [errorData, setErrorData] = useState<Record <string, any>>([])
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
            const selectedItem:SelectedMRD = {
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
                <td>{ currentPage === 1 ? currentPage + i : (((itemsPerPage*currentPage)-itemsPerPage)+1) + i }</td>
                <td>{ data.mrdNumber }</td>
                <td>{ formatDateTime(data.createdDate) }</td>
                <td>{ data.countryOfSupply }</td>
                <td>{ data.pickUpAddress }</td>
                <td>{ data.destination }</td>
            </tr>
        )
    })

    const [isLoading, setIsLoading] = useState(false)
    const getMaterialReadinessDocuments = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getMRDForFreightForwarder",
            params: {
                page: currentPage,
                pageSize: itemsPerPage,
                FreightForwarderId: user.id,
                Status: 5, // READY_FOR_POC
                PickedUp: true,
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

                const selectallmrd = res.data.map((data: any) => ({
                    id: data.id,
                    mrdNumber: data.mrdNumber,
                    createdDate: data.createdDate,
                    destination: data.destination,
                    pickUpAddress: data.pickUpAddress,
                    commercialInvoice: {
                        modeOfShipping: data.commercialInvoice.modeOfShipping,
                    }
                }))

                setSelectedMRDs(selectallmrd) // automatically selecting all open mrds
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }

    const [isSubmitting, setIsSubmitting] = useState(false)    
    const CreateProofOfCollection = () => {
        const selectedId = selectedMRDs.map((data) => data.id)
        const data = {
            userId: user.id,
            materialReadinessDocumentIds: selectedId,
            clientName: "TotalEnergies EP Nigeria Limited",
            pickUpDate: formData.pickUpDate,
            numberOfPackage: selectedId.length,
            freightForwarderReference: "TEPNG-" + (user.id).substring(0, 8),
            Packaging: formData.packaging,
            freightForwarderAddress: user.address,
            freightForwarderCompanyName: user.companyName,
        }        
        
        if(!selectedMRDs.length) toast.warning("Atleast one purchase order must be selected.")
        else {
            if(Object.values(data).every(value => value)){
                setIsSubmitting(true)
                var request: Record<string, any> = {
                    what: "CreateProofOfCollection",
                    data: data
                };

                makePostRequest(request)
                    .then((response: any) => {
                        setIsSubmitting(false)
                        toast.success(response.msg)

                        setTimeout(() => {
                            navigate("/freightforwarder/proofofcollection")
                        }, 1000);                    
                    })
                    .catch((error:any) => {toast.error(error.errorMessage); setIsSubmitting(false)});
            }
        }
    }    

    const handleInputChange = (e: any) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value})
    }

    useEffect(() => {
        if(accessToken) getMaterialReadinessDocuments()
        // eslint-disable-next-line
    }, [mrdNumber, currentPage, itemsPerPage])

    const page = "Proof Of Collection"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main mt-2">
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <Link to={"/freightforwarder/proofofcollection"} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Proof of Collections</p>
                            </Link>  
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">assignment_add</span>
                                    <p>Create Proof of Collection</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="main-inner mt-1">  
                        <div style={{padding:"16px", fontSize: "12px"}}>
                            <span className="errorX mr-2">*</span>
                            Material Readiness Documents <span className="fw-500">({selectedMRDs.length} Selected)</span>
                        </div>
                        <div className='table-container custom'>
                            <table>
                                <thead>
                                    <tr className="no-textwrap">
                                        <th><input type="checkbox" onChange={handleCheckAll} /></th>
                                        <th>SN</th>
                                        <th>MRD Number</th>
                                        <th>Issuance Date</th>
                                        <th>Country of Supply</th>
                                        <th>Pickup Address</th>
                                        <th>Destination</th>
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
                    <div className="main-inner mt-1">   
                        <div className="form-view-container custom" style={{padding: "24px 8px"}}>
                            <div className="layout">
                                <div className="label">Summary</div>                    
                                <div className="body d-grid-2"> 
                                    <div className='form-item'>
                                        <label><span className="errorX mr-2">*</span>Packaging</label>
                                        <select value={formData.packaging} onChange={(e) => setFormData({...formData, "packaging": e.target.value})} required>
                                            <option value="" disabled >Select...</option>
                                            <option value="Container" >Container</option>
                                            <option value="BreakBulk" >BreakBulk</option>
                                            <option value="Box" >Box</option>
                                            <option value="Air Freight Package" >Air Freight Package</option>
                                        </select>                                    
                                    </div>
                                    
                                    <div className='form-item'>
                                        <label><span className="errorX mr-2">*</span>Pick Up Date</label>
                                        <input name="pickUpDate" value={formData?.pickUpDate} onChange={handleInputChange} type='date' required />                                    
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>
                    
                    <div className="main-inner mt-1" style={{padding: "16px 0"}}>                 
                        <button type="submit" className="custom-button orange"
                        disabled={isSubmitting} 
                        onClick={() => CreateProofOfCollection()}
                        style={{margin: "0 auto"}}>
                            <span className="material-symbols-rounded">web_traffic</span>{isSubmitting ? "Loading..." : "Create Proof of Collection"}
                        </button>
                    </div>         
                </div>
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default CreateProofOfCollection