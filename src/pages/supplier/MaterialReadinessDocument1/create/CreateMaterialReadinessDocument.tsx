import Layout from "pages/Layout"
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { makeDeleteRequest, makeGetRequest, makePostRequest } from "request";
import { setPageContext } from "store/pageContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreatePackage from "./CreatePackage";
import BasicInformation from "./SaveBasicInformation";
import UpdatePackage from "../update/UpdatePackage";
import MaterialPictures from "./UploadMaterialPictures";
import OtherAttachments from "./UploadOtherAttachments";
import Modal from 'react-modal'
import loading from "../../../../assets/images/loading.gif"
import { customStyles } from "helpers";


const CreateMaterialReadinessDocument =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(false)
    const [packages, setPackages] = useState<Record <string, any>>([])
    const [packageDetails, setPackageDetails] = useState({})
    const [toggleTab1, setToggleTab1] = useState(false)
    const [toggleTab2, setToggleTab2] = useState(false)
    const [packageId, setPackageId] = useState("")
    const [purchaseOrderNumberFromPackage, setPurchaseOrderNumberFromPackage] = useState([])
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const accessToken:any = useSelector((state: any) => state.accessToken.value);   
    const [activeTab, setActiveTab] = useState("1")
    const [basicInformation, setBasicInformation] = useState<Record <string, any>>({})
    const [pickupAddress, setPickupAddress] = useState("")
    const [destination, setDestination] = useState("")
    const [countryOfSupply, setCountryOfSupply] = useState("")
    // 1 => Basic Information
    // 2 => Create Package
    // 3 => Update Package
    // 4 => Upload Material Pictures
    // 5 => Upload Attachments
    const handleTabToggle = (stepValue: string) => {
        setActiveTab(stepValue)
    }

    const [countries, setCountries] = useState<string[]>([])
    const getCountries = () => {
        var request: Record<string, any> = {
            what: "getAllCountries",           
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                const countriesArray = res.map((country: any) => country.name);
                setCountries(countriesArray.sort())
            })
            .catch((error:any) => 
                {toast.error(error)}
            );
    }

    const getPackages = () => {
        var request: Record<string, any> = {
            what: "getPackages",
            params: {
                page: 1,
                pageSize: 10,
                userId: user?.id,
                packingListId: "null",
                OrderBy: 1
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data              
                                
                const purchaseOrderNumbers = res.map((data: any) => 
                    // Getting information from each package
                    ({
                        purchaseOrderNumber: data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber,
                        packageId: data.id,
                        isUploadedPackageAttachments: !!data.packageAttachments.length,
                        isUploadedPackageMaterialPictures: (data.purchaseOrderItemSupplies.map((item: any) => item.purchaseOrderItemSupplyAttachments)).every((subArray: any) => subArray.length > 0),
                        packageAttachments: data.packageAttachments,
                        commercialInvoiceId: data.purchaseOrderItemSupplies[0].commercialInvoiceId

                    }))
                setPackages(res)
                setPurchaseOrderNumberFromPackage(purchaseOrderNumbers)
            })
            .catch((error:any) => 
                {toast.error(error); }
            );
    }

    const getMaterialReadinessDocumentBasicInfoBySupplier = () => {
        var request: Record<string, any> = {
            what: "getMaterialReadinessDocumentBasicInfoBySupplier",
            id: user?.id
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                setBasicInformation(res)
                setPickupAddress(res.pickUpAddress); 
                setDestination(res.destination)
                setCountryOfSupply(res.countryOfSupply) // Pickup Country
            })
            .catch((error:any) => 
                {toast.error(error); }
            );
    }

    const [isOpenDeleteConfirmationModal, setIsOpenDeleteConfirmationModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const HandleDeletePackage = () => { 
        setIsSubmitting(true)
        var request:Record<string, any> = {
            what: "DeletePackage",
            params: {
                packageId: packageId
            }
        }

        makeDeleteRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success(response.msg)
                setPackageId("")
                setIsOpenDeleteConfirmationModal(false)
                getPackages()
                setActiveTab("2") // new package form
            }).catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
    }

    const [hasCClickedCreationButton, setHasCClickedCreationButton] = useState<Boolean>(false)
    const [creationErrorList, setCreationErrorList] = useState({
        packages: false,
        materialPictures: false,
        attachments: false
    })
    const handleCreateMaterialReadinessDocument = () => {
        const data = {
            materialReadinessDocumentId: basicInformation?.id,
            packages: packages.map((data: any) => ({
                packageId: data.id,
                purchaseOrderId: data.purchaseOrderItemSupplies[0].purchaseOrderItem.purchaseOrderId,
                purchaseOrderItems: data.purchaseOrderItemSupplies.map((item: any) => item.id)
            })),
        }      

        const purchaseOrderItemSupplies = packages.map((data: any) => data.purchaseOrderItemSupplies).flat()
        const ErrorList = {
            packages: !!packages.length,
            materialPictures: Boolean(purchaseOrderItemSupplies.map((item: any) => item.purchaseOrderItemSupplyAttachments).every((subArray: any) => subArray.length > 0)),
            attachments: Boolean(packages.map((data: any) => data.packageAttachments.length).every((attachment: any) => attachment >= 2))
        }
        setCreationErrorList(ErrorList);
        setHasCClickedCreationButton(true)

        if(Object.values(ErrorList).every(value => value)){
            setIsLoading(true)
            var request:Record<string, any> = {
                what: "CreateMaterialReadinessDocument",
                data: data
            }
            makePostRequest(request)
                .then((response: any) => {
                    dispatch(setPageContext({status: "0"})) //open tab
                    setIsLoading(false)
                    getPackages() // reload data
                    navigate("/supplier/materialreadinessdocuments")

                    toast.success(response.msg)
                }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
        }
    }   

    
    useEffect(() => {
       if(accessToken) {
            getPackages() 
            getCountries()
            getMaterialReadinessDocumentBasicInfoBySupplier()
        } // eslint-disable-next-line
    }, [accessToken, activeTab === "2"])

    useEffect(() => {
        if(accessToken) {
            const purchaseOrderItemSupplies = packages.map((data: any) => data.purchaseOrderItemSupplies).flat()
            const ErrorList = {
                packages: !!packages.length,
                materialPictures: Boolean(purchaseOrderItemSupplies.map((item: any) => item.purchaseOrderItemSupplyAttachments).every((subArray: any) => subArray.length > 0)),
                attachments: Boolean(packages.map((data: any) => data.packageAttachments.length).every((attachment: any) => attachment >= 2))
            }
            setCreationErrorList(ErrorList);
        } // eslint-disable-next-line
     }, [packages])

    const page = "Material Readiness Documents"

    return (
        <Layout title={page}>
            {// eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a id="top">Page Top</a>}
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2"> 
                        <div className="detail-top-section">
                            <button onClick={() => {navigate(-1); dispatch(setPageContext({status: "0"}))}} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
                            </button>
                            
                            <div className="tab">
                                <div className={"tab-item active"}>
                                    <span className="material-symbols-rounded fw-600">add</span>
                                    <p>Create Material Readiness Document</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="mt-1 two-columns">
                        <div className="sidebar">
                            {/* TAB 1 */}
                            <button 
                                className={`tab ${activeTab === "1" ? "active" : ""}`} 
                                onClick={() => setActiveTab("1")}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">info</span>
                                    <span>Basic Information</span>
                                </div>

                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>

                            {/* TAB 2 */}

                            <button className="tab no-hover mt-1" disabled={!pickupAddress}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">box_add</span>
                                    <span>Batch Purchase Orders</span>
                                </div>

                                {/* <span className="material-symbols-rounded">keyboard_arrow_down</span> */}
                            </button>
                            {
                                purchaseOrderNumberFromPackage.map((data: any, i: number) => {
                                    return (
                                        <button 
                                            className={`tab sub mt-1 ${activeTab === `3 ${data.packageId}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            >
                                            <div className="d-flex"
                                            onClick={() => {
                                                setActiveTab(`3 ${data.packageId}`); 
                                                setPackageDetails({...packageDetails, 
                                                    packageId: data.packageId, 
                                                    purchaseOrderNumber: data.purchaseOrderNumber,
                                                    commercialInvoiceId: data.commercialInvoiceId
                                                });
                                            }}
                                            >
                                                {/* The icon numbers stop at 9. Displaying just circles afterwards */}
                                                {(i >= 0 && i < 10) && <span className="material-symbols-rounded mr-1">counter_{i+1}</span>}
                                                {i > 9 && <span className="material-symbols-rounded mr-1">circle</span>}
                                                <span>PO {data.purchaseOrderNumber}</span>
                                            </div>

                                            <span className="material-symbols-rounded close" title="Delete Package" onClick={() => {setIsOpenDeleteConfirmationModal(true); setPackageId(data.packageId)}}>close</span>
                                        </button>
                                    )
                                })
                            }                            

                            <button 
                                className={`tab sub mt-1 ${activeTab === "2" ? "active" : ""}`}
                                disabled={!pickupAddress} 
                                onClick={() => setActiveTab("2")}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">add</span>
                                    <span>Create Package</span>
                                </div>

                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>

                            {/* TAB 3 */}

                            <button className="tab mt-1" disabled={!pickupAddress} onClick={() => setToggleTab1(!toggleTab1)}> 
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">upload</span>
                                    <span>Upload Material Pictures</span>
                                </div>

                                {pickupAddress && <span className="material-symbols-rounded">{`keyboard_arrow_${toggleTab1 ? "up" : "down"}`}</span>}
                            </button> 
                            {
                                toggleTab1 && purchaseOrderNumberFromPackage.map((data: any, i: number) => {
                                    return (
                                        <button 
                                            className={`tab sub mt-1 ${activeTab === `4 ${data.packageId}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            onClick={() => {setActiveTab(`4 ${data.packageId}`); 
                                            setPackageDetails({...packageDetails, packageId: data.packageId
                                                // , purchaseOrderNumber: data.purchaseOrderNumber
                                            });} }
                                            >
                                            <div className="d-flex">
                                                {/* The icon numbers stop at 9. Displaying just circles afterwards */}
                                                {(i >= 0 && i < 10) && <span className="material-symbols-rounded mr-1">counter_{i+1}</span>}
                                                {i > 9 && <span className="material-symbols-rounded mr-1">circle</span>}

                                                <span>PO {data.purchaseOrderNumber}</span>
                                                <span className={`status ${data.isUploadedPackageMaterialPictures ? "green" : "yellow"} ml-2`} style={{fontSize: "10px"}}>
                                                    {data.isUploadedPackageMaterialPictures ? "Done" : "Pending"}
                                                </span>
                                            </div>

                                            <span className="material-symbols-rounded">chevron_right</span>
                                        </button>
                                    )
                                })
                            }        

                            {/* TAB 4 */} 

                            <button className="tab mt-1" disabled={!pickupAddress} onClick={() => setToggleTab2(!toggleTab2)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">attach_file</span>
                                    <span>Upload Attachments</span>
                                </div>

                                {pickupAddress && <span className="material-symbols-rounded">{`keyboard_arrow_${toggleTab2 ? "up" : "down"}`}</span>}
                            </button>

                            {
                                toggleTab2 && purchaseOrderNumberFromPackage.map((data: any, i: number) => {
                                    return (
                                        <button 
                                            className={`tab sub mt-1 ${activeTab === `5 ${data.packageId}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            onClick={() => {setActiveTab(`5 ${data.packageId}`); setPackageDetails({...packageDetails, packageId: data.packageId, 
                                                // purchaseOrderNumber: data.purchaseOrderNumber,
                                                packageAttachments: data.packageAttachments});} }
                                            >
                                            <div className="d-flex">
                                                <span className="material-symbols-rounded mr-1">counter_{i+1}</span>
                                                <span>PO {data.purchaseOrderNumber}</span>
                                                <span className={`status ${data.isUploadedPackageAttachments ? "green" : "yellow"} ml-2`} style={{fontSize: "10px"}}>
                                                    {data.isUploadedPackageAttachments ? "Done" : "Pending"}
                                                </span>
                                            </div>

                                            <span className="material-symbols-rounded" >chevron_right</span>
                                        </button>
                                    )
                                })
                            }  

                            {/* TAB 5 - Submit MRD  */}
                            <hr className="mt-2 mb-2" />
                            <button 
                                className="custom-button orange" 
                                disabled={!Object.values(creationErrorList).every(value => value)}
                                style={{width: "100%", height: "40px", justifyContent: "center", }}
                                onClick={() => handleCreateMaterialReadinessDocument()}
                                >
                                Create Material Readiness Document
                            </button>

                            {/* <div className="alert alert-error mt-1" style={{padding: "8px", width: "auto"}}>
                                <span className="material-symbols-outlined mr-2" style={{color: "#C00000"}}>exclamation</span>
                                <p style={{margin: 0}}>Pickup Information is missing.</p>
                            </div> */}
                            {!creationErrorList?.packages && hasCClickedCreationButton && <div className="alert alert-error mt-1" style={{padding: "8px", width: "auto"}}>
                                <span className="material-symbols-outlined mr-2" style={{color: "#C00000"}}>exclamation</span>
                                <p style={{margin: 0}}>Package(s) are missing.</p>
                            </div>}
                            {!creationErrorList?.materialPictures && hasCClickedCreationButton && <div className="alert alert-error" style={{padding: "8px", width: "auto"}}>
                                <span className="material-symbols-outlined mr-2" style={{color: "#C00000"}}>exclamation</span>
                                <p style={{margin: 0}}>Some material pictures are yet to be uploaded.</p>
                            </div>}
                            {!creationErrorList?.attachments && hasCClickedCreationButton && <div className="alert alert-error" style={{padding: "8px", width: "auto"}}>
                                <span className="material-symbols-outlined mr-2" style={{color: "#C00000"}}>exclamation</span>
                                <p style={{margin: 0}}>Some attachments are yet to be uploaded.</p>
                            </div>}
                        </div>
                        <div className="content">
                            {activeTab === "1" && 
                                <BasicInformation 
                                    countries={countries} 
                                    setActiveTab={setActiveTab} 
                                    packages={packages} 
                                    basicInformation={basicInformation} 
                                    getMaterialReadinessDocumentBasicInfoBySupplier={getMaterialReadinessDocumentBasicInfoBySupplier}
                                    setBasicInformation={setBasicInformation}
                                    />}      

                            {activeTab === "2" && 
                                <CreatePackage 
                                    handleToggle={handleTabToggle} 
                                    // pickupAddress={pickupAddress} 
                                    destination={destination} 
                                    countryOfSupply={countryOfSupply} 
                                    getPackages={getPackages}
                                    packages={packages}
                                    countries={countries}   /> }

                            {activeTab.startsWith("3") && 
                                <UpdatePackage 
                                    handleToggle={handleTabToggle} 
                                    pickupAddress={pickupAddress} 
                                    getPackages={getPackages} 
                                    packageDetails={packageDetails} 
                                    countries={countries} />}       

                            {activeTab.startsWith("4") && 
                                <MaterialPictures 
                                    handleToggle={handleTabToggle} 
                                    packageDetails={packageDetails}
                                    getPackages={getPackages} />}   
                                    

                            {activeTab.startsWith("5") && 
                                <OtherAttachments  
                                    packageDetails={packageDetails}
                                    getPackages={getPackages} />}       
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isOpenDeleteConfirmationModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Are you sure you want to delete this package?</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => setIsOpenDeleteConfirmationModal(false)}>close</span>
                </div>
                <div className="modal-footer">
                    <button className="custom-button grey-outline"
                        onClick={() => setIsOpenDeleteConfirmationModal(false)}>Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="custom-button orange"
                        onClick={() => HandleDeletePackage()}>{isSubmitting ? "Loading..." : "Yes"}</button>
                </div>
            </Modal>
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
            <ToastContainer />
        </Layout>
    )
}

export default CreateMaterialReadinessDocument