import Layout from "pages/Layout"
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { makeGetRequest, makePostRequest } from "request";
import { setPageContext } from "store/pageContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreatePackage from "./CreatePackage";
import BasicInformation from "./SaveBasicInformation";
import UpdatePackage from "../create2/UpdatePackage";
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
    const [purchaseOrderNumberFromPackage, setPurchaseOrderNumberFromPackage] = useState<Record<string, any>[]>([]);
    // const [purchaseOrderNumberFromPackageTemp, setPurchaseOrderNumberFromPackageTemp] = useState<Record<string, any>[]>([]);
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

                // for each res check data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber and group the data by the purchaseOrderNumber
                const groupedData = res.reduce((acc: any, obj: any) => {
                    if (!acc[obj.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber]) {
                        acc[obj.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber] = [];
                    }
                    acc[obj.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber].push(obj);
                    return acc;
                }, {})
                //make the initial code an array instead of an object
                const formattedPurchaseOrderData = Object.keys(groupedData).map((key) => ({ 
                    purchaseOrderNumber: key, 
                    packages: groupedData[key],
                    packageId: "",
                    isUploadedPackageAttachments: groupedData[key].every((data: any) => data.packageAttachments.length > 0),
                    isUploadedPackageMaterialPictures: groupedData[key].every((eachPackage: any) => 
                      eachPackage.purchaseOrderItemSupplies.every((item: any) => 
                        item.purchaseOrderItemSupplyAttachments.length > 0
                      )
                    ),
                    purchaseOrderItems: groupedData[key].map((data: any) => data.purchaseOrderItemSupplies.map((data: any) => ({
                        id: data.id,
                        purchaseOrderItemNumber: data.purchaseOrderItem.purchaseOrderItemNumber,
                        materialNumber: data.purchaseOrderItem.materialNumber,
                        materialDescription: data.purchaseOrderItem.materialDescription,
                        quantity: data.quantity,
                        purchaseOrderItemSupplyAttachments: data.purchaseOrderItemSupplyAttachments,
                    }))).flat(),
                    packageAttachments: groupedData[key][0].packageAttachments // package attachment per po - the first package attachment is same for all packages in that po
                }));     
                
                setPackages(res)
                setPurchaseOrderNumberFromPackage(formattedPurchaseOrderData)

                // Temporary attachment fix
                // const purchaseOrderNumbers = res.map((data: any) => 
                // // Getting information from each package
                // ({
                //     purchaseOrderNumber: data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber,
                //     packageId: data.id,
                //     isUploadedPackageAttachments: !!data.packageAttachments.length,
                //     isUploadedPackageMaterialPictures: (data.purchaseOrderItemSupplies.map((item: any) => item.purchaseOrderItemSupplyAttachments)).every((subArray: any) => subArray.length > 0),
                //     packageAttachments: data.packageAttachments,
                //     commercialInvoiceId: data.purchaseOrderItemSupplies[0].commercialInvoiceId,
                    
                // }))
                // setPurchaseOrderNumberFromPackageTemp(purchaseOrderNumbers)
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

    const [isMaterialReadinessDocumentReady, setIsMaterialReadinessDocumentReady] = useState(false)
    const purchaseOrderItemSupplies = packages.map((data: any) => data.purchaseOrderItemSupplies).flat()
    const ErrorList = {
        packages: !!packages.length,
        materialPictures: purchaseOrderItemSupplies.every((item: any) => item.purchaseOrderItemSupplyAttachments.length > 0),
        attachments: packages.every((pkg: any) => pkg.packageAttachments.length > 0)
    }
    const handleCreateMaterialReadinessDocument = () => {
        const data = {
            materialReadinessDocumentId: basicInformation?.id,
            packages: packages.map((data: any) => ({
                packageId: data.id,
                purchaseOrderId: data.purchaseOrderItemSupplies[0].purchaseOrderItem.purchaseOrderId,
                purchaseOrderItems: data.purchaseOrderItemSupplies.map((item: any) => item.id)
            })),
        }     
        if(Object.values(ErrorList).every(value => value)) setIsMaterialReadinessDocumentReady(true)

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
        if(accessToken) setIsMaterialReadinessDocumentReady(Object.values(ErrorList).every(value => value))
        // eslint-disable-next-line
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
                                            className={`tab sub mt-1 ${activeTab === `3 ${data.purchaseOrderNumber}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            >
                                            <div className="d-flex"
                                            onClick={() => {
                                                setActiveTab(`3 ${data.purchaseOrderNumber}`); 
                                            }}
                                            >
                                                {/* The icon numbers stop at 9. Displaying just circles afterwards */}
                                                {(i >= 0 && i < 10) && <span className="material-symbols-rounded mr-1">counter_{i+1}</span>}
                                                {i > 9 && <span className="material-symbols-rounded mr-1">circle</span>}
                                                <span>PO {data.purchaseOrderNumber}</span>
                                            </div>

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
                                            className={`tab sub mt-1 ${activeTab === `4 ${data.purchaseOrderNumber}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            onClick={() => {setActiveTab(`4 ${data.purchaseOrderNumber}`); 
                                        } }
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
                                            className={`tab sub mt-1 ${activeTab === `5 ${data.purchaseOrderNumber}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            onClick={() => {setActiveTab(`5 ${data.purchaseOrderNumber}`);
                                            setPackageDetails({
                                                packageGroupingKey: data?.packages[0]?.packageGroupingKey
                                            })}}
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
                                disabled={!isMaterialReadinessDocumentReady}
                                style={{width: "100%", height: "40px", justifyContent: "center", }}
                                onClick={() => handleCreateMaterialReadinessDocument()}
                                >
                                Create Material Readiness Document
                            </button>
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
                                    destination={destination}
                                    countryOfSupply={countryOfSupply}
                                    getPackages={getPackages} 
                                    setActiveTab={setActiveTab}
                                    selectedPurchaseOrderPackages={purchaseOrderNumberFromPackage.find((data:any) => activeTab.includes(data.purchaseOrderNumber))?.packages} 
                                    purchaseOrderNumber={activeTab.split(" ")[1]} 
                                    countries={countries} />}       

                            {activeTab.startsWith("4") && 
                                <MaterialPictures 
                                    handleToggle={handleTabToggle} 
                                    // packageDetails={packageDetails}
                                    purchaseOrderItems={purchaseOrderNumberFromPackage.find((data:any) => activeTab.includes(data.purchaseOrderNumber))?.purchaseOrderItems}
                                    getPackages={getPackages} />}   

                            {activeTab.startsWith("5") && 
                                <OtherAttachments  
                                    packageDetails={packageDetails}
                                    getPackages={getPackages} 
                                    isUploadedPackageAttachments={purchaseOrderNumberFromPackage.find((data:any) => activeTab.includes(data.purchaseOrderNumber))?.isUploadedPackageAttachments}                                    
                                    />}       
                        </div>
                    </div>
                </div>
            </div>
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