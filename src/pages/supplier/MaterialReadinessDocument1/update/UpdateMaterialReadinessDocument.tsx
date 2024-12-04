import Layout from "pages/Layout"
import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { makeDeleteRequest, makeGetRequest, makePatchRequest } from "request";
import { setPageContext } from "store/pageContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateBasicInformation from "./UpdateBasicInformation";
import UpdatePackage from "./UpdatePackageNew";
import Modal from 'react-modal'
import loading from "../../../../assets/images/loading.gif"
import { customStyles, formatDateTime, getMaterialReadinessDocumentChatTitle, handleDownloadForPackageAttachment, handleDownloadForPOItemSupplyAttachment } from "helpers";
import UpdateOtherAttachments from "./UpdateOtherAttachments";
import UpdateMaterialPictures from "./UpdateMaterialPictures";


const UpdateMaterialReadinessDocument =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const param = useParams()
    const pageContext: any = useSelector((state: any)=> state.pageContext.value)

    const [isLoading, setIsLoading] = useState(false)
    const [packages, setPackages] = useState<Record <string, any>>([])
    const [packageDetails, setPackageDetails] = useState({})
    const [toggleTab1, setToggleTab1] = useState(true)
    const [toggleTab2, setToggleTab2] = useState(true)
    const [packageId, setPackageId] = useState("")
    const [purchaseOrderNumberFromPackage, setPurchaseOrderNumberFromPackage] = useState<Record <string, any>>([])
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);
    const accessToken:any = useSelector((state: any) => state.accessToken.value);   
    const [activeTab, setActiveTab] = useState("1")
    const [destination, setDestination] = useState("")
    const [countryOfSupply, setCountryOfSupply] = useState("")
    const [pickupAddress, setPickupAddress] = useState("")
    // 1 => Basic Information
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

    const handleDownloadClickForItemSupply = async (documentBlobStorageName: any, documentName: string, purchaseOrderItemSuppliesId: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handleDownloadForPOItemSupplyAttachment(
          documentBlobStorageName,
          documentName,
          purchaseOrderItemSuppliesId
        )
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };

    const handleDownloadClickForPackage = async (packageId: any, documentBlobStorageName: string, documentName: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handleDownloadForPackageAttachment(packageId, documentBlobStorageName, documentName)
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [openChatModal, setOpenChatModal] = useState(false)

    const [chatData, setChatData] = useState({
        materialReadinessDocumentId: "",
        supplierId: "",
        comment: "",
    })
    const clearChatData = () => {
        setChatData({
            materialReadinessDocumentId: "",
            supplierId: "",
            comment: "",
        })
    }

    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "AddCommentForMaterialReadinessDocument",
            data: {
                materialReadinessDocumentId: materialReadinessDocument.id,
                comment: chatData.comment,
                sender: user.id,
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: "ExpeditingTeam",
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                clearChatData()
                toast.success("Chat Sent Successfully!")
                // relaod chat history
                getMaterialReadinessDocumentChatHistory(materialReadinessDocument.id, materialReadinessDocument.supplierId)
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }  

    const getMaterialReadinessDocumentChatHistory = (materialReadinessDocumentId: string, supplierId: string) => {
        setIsChatLoading(true)
        var request: Record<string, any> = {
            what: "getMaterialReadinessDocumentChatHistory",
            id: materialReadinessDocumentId,
            params: {
                orderBy: 1
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsChatLoading(false)
                const res = response.data.data
                setChats(res.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()))
            })
            .catch((error:any) => 
                {toast.error(error.msg); setIsChatLoading(false)}
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
                setPackages(res)
                // const purchaseOrderNumbers = res.map((data: any) => 
                //     // Getting information from each package
                //     ({
                //         purchaseOrderNumber: data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber,
                //         packageId: data.id,
                //         isUploadedPackageAttachments: !!data.packageAttachments.length,
                //         isUploadedPackageMaterialPictures: (data.purchaseOrderItemSupplies.map((item: any) => item.purchaseOrderItemSupplyAttachments)).every((subArray: any) => subArray.length > 0),
                //         packageAttachments: data.packageAttachments
                //     }))  
            })
            .catch((error:any) => 
                {toast.error(error); }
            );
    }

    const [isOpenDeleteConfirmationModal, setIsOpenDeleteConfirmationModal] = useState(false)
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

    const [creationErrorList, setCreationErrorList] = useState({
        packages: false,
        materialPictures: false,
        attachments: false
    })
    const purchaseOrderItemSupplies = packages.map((data: any) => data.purchaseOrderItemSupplies).flat()
    const ErrorList = {
        packages: !!packages.length,
        materialPictures: purchaseOrderItemSupplies.every((item: any) => item.purchaseOrderItemSupplyAttachments.length > 0),
        attachments: packages.every((pkg: any) => pkg.packageAttachments.length > 0)
    }
    const handleUpdateMaterialReadinessDocument = () => {
        const data = {
            materialReadinessDocumentId: materialReadinessDocument.id,
            purchaseOrderId: purchaseOrderNumberFromPackage[0].purchaseOrderId
        }  
        // alert(Object.values(ErrorList).every(value => value))

        if(Object.values(ErrorList).every(value => value)){
            setIsLoading(true)
            var request:Record<string, any> = {
                what: "FinalUpdateMaterialReadinessDocument",
                data: data
            }
            makePatchRequest(request)
                .then((response: any) => {
                    dispatch(setPageContext({status: "0"})) //open tab
                    setIsLoading(false)
                    toast.success(`${response.msg}. This document can now be found in the "open" tab.`)

                    setTimeout(() => {
                        navigate("/supplier/materialreadinessdocuments")
                    }, 1000);                    
                }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
        }
    }

    const [materialReadinessDocument, setMaterialReadinessDocument] = useState<Record <string, any>>({})
    const getMaterialReadinessDocumentById = () => {
        setIsLoading(true)
        var request = {
            what: "getMaterialReadinessDocumentById",
            id: param.id,
            OrderBy: 2
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setMaterialReadinessDocument(res)
                setPickupAddress(res.pickUpAddress)
                const packages = res.packingLists.map((packinglist: any) => packinglist.packages[0])
                // for each res check data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber and group the data by the purchaseOrderNumber
                const groupedData = packages.reduce((acc: any, obj: any) => {
                    if (!acc[obj.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber]) {
                        acc[obj.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber] = [];
                    }
                    acc[obj.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber].push(obj);
                    return acc;
                }, {})
                //make the initial code an array instead of an object
                const formattedPurchaseOrderData = Object.keys(groupedData).map((key) => { 
                    const packagesPerPuchaseOrder = res.packingLists.flatMap((packinglist: any) => packinglist.packages).filter((data: any) => data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber === key)
                    return {
                        purchaseOrderNumber: key, 
                        purchaseOrderId: packagesPerPuchaseOrder[0].purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderId, 
                        packages: packagesPerPuchaseOrder,
                        // packageId: "",
                        isUploadedPackageAttachments: groupedData[key].every((data: any) => data.packageAttachments.length > 0),
                        isUploadedPackageMaterialPictures: groupedData[key].every((eachPackage: any) => 
                        eachPackage.purchaseOrderItemSupplies.every((item: any) => 
                            item.purchaseOrderItemSupplyAttachments.length > 0
                        )
                        ),
                        purchaseOrderItems: packagesPerPuchaseOrder.map((data: any) => data.purchaseOrderItemSupplies.map((data: any) => ({
                            id: data.id,
                            purchaseOrderItemNumber: data.purchaseOrderItem.purchaseOrderItemNumber,
                            materialNumber: data.purchaseOrderItem.materialNumber,
                            materialDescription: data.purchaseOrderItem.materialDescription,
                            quantity: data.quantity,
                            purchaseOrderItemSupplyAttachments: data.purchaseOrderItemSupplyAttachments,
                        }))).flat(),
                        packageAttachments: groupedData[key][0].packageAttachments // package attachment per po - the first package attachment is same for all packages in that po
                    }
                });  
                console.log(formattedPurchaseOrderData)
                setPurchaseOrderNumberFromPackage(formattedPurchaseOrderData)
                setPackages(packages)
                setDestination(res.destination)
                setCountryOfSupply(res.countryOfSupply) // Pickup Country
                // const purchaseOrderNumbers = packages.map((data: any) => 
                //     // Getting information from each package
                //     ({
                //         purchaseOrderNumber: data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber,
                //         purchaseOrderId: data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderId,
                //         packageId: data.id,
                //         isUploadedPackageAttachments: !!data.packageAttachments.length,
                //         isUploadedPackageMaterialPictures: (data.purchaseOrderItemSupplies.map((item: any) => item.purchaseOrderItemSupplyAttachments)).every((subArray: any) => subArray.length > 0),
                //         packageAttachments: data.packageAttachments,
                //         commercialInvoiceId: data.purchaseOrderItemSupplies[0].commercialInvoiceId
                //     }))
                    
                // setPurchaseOrderNumberFromPackage(purchaseOrderNumbers)
            })
            .catch(error => 
                {console.log(error)}
            );
    }

    useEffect(() => {
       if(accessToken) {
            getMaterialReadinessDocumentById()
            getCountries()
        } // eslint-disable-next-line
    }, [accessToken, activeTab])

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

     const page = pageContext ? pageContext.page : "Material Readiness Documents"

    return (
        <Layout title={page}>
            {// eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a id="top">Page Top</a>}
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2"> 
                        <div className="detail-top-section">
                            <div className="d-flex">
                                <div onClick={() => {navigate("/supplier/materialreadinessdocuments"); dispatch(setPageContext({status: pageContext?.status}))}} className="actions">
                                    <p><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
                                </div>   

                                <div className="actions"
                                    onClick={() => {setOpenChatHistory(true); getMaterialReadinessDocumentChatHistory(materialReadinessDocument.id, materialReadinessDocument.supplierId)} }>
                                    <p><span className="material-symbols-outlined">forum</span>Send | View Chats</p>
                                </div>
                            </div>                    
                            
                            <div className="tab">
                                <div className={"tab-item active"}>
                                    <span className="material-symbols-rounded fw-600">add</span>
                                    <p>Update Material Readiness Document</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>
                    <div className="main-inner mt-1" style={{padding: "8px", boxSizing: "border-box"}}>
                        <div className="alert alert-warning" style={{margin: 0, padding: "8px", width: "auto"}}>
                            <span className="material-symbols-outlined mr-2" style={{color: "#e7882e"}}>info</span>
                            <p style={{margin: 0}}>Click the <strong>Update Material Readiness Document</strong> button once you have completed your updates. This action will notify the expediting team of the changes and update the status to "Open.".</p>
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

                            <button className="tab no-hover mt-1">
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
                                            // disabled={!pickupAddress} 
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

                            {/* TAB 3 */}

                            <button className="tab mt-1" onClick={() => setToggleTab1(!toggleTab1)}> 
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">image</span>
                                    <span>Update Material Pictures</span>
                                </div>

                                <span className="material-symbols-rounded">{`keyboard_arrow_${toggleTab1 ? "up" : "down"}`}</span>
                            </button> 
                            {
                                toggleTab1 && purchaseOrderNumberFromPackage.map((data: any, i: number) => {
                                    return (
                                        <button 
                                            className={`tab sub mt-1 ${activeTab === `4 ${data.purchaseOrderNumber}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            onClick={() => {
                                                setActiveTab(`4 ${data.purchaseOrderNumber}`); 
                                                setPackageDetails({
                                                    purchaseOrderItems: data?.purchaseOrderItems
                                                })
                                            }}
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

                            <button className="tab mt-1" onClick={() => setToggleTab2(!toggleTab2)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded mr-1">attach_file</span>
                                    <span>Update Attachments</span>
                                </div>

                                <span className="material-symbols-rounded">{`keyboard_arrow_${toggleTab2 ? "up" : "down"}`}</span>
                            </button>

                            {
                                toggleTab2 && purchaseOrderNumberFromPackage.map((data: any, i: number) => {
                                    return (
                                        <button 
                                            className={`tab sub mt-1 ${activeTab === `5 ${data.purchaseOrderNumber}` ? "active" : ""}`}
                                            disabled={!pickupAddress} 
                                            onClick={() => {setActiveTab(`5 ${data.purchaseOrderNumber}`);
                                            setPackageDetails({
                                                packageGroupingKey: data?.packages[0]?.packageGroupingKey,
                                                packageAttachments: data?.packageAttachments
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
                                disabled={!Object.values(creationErrorList).every(value => value)}
                                // disabled
                                style={{width: "100%", height: "40px", justifyContent: "center", }}
                                onClick={() => handleUpdateMaterialReadinessDocument()}
                                >
                                Update Material Readiness Document
                            </button>
                        </div>
                        <div className="content">
                            {activeTab === "1" && 
                                <UpdateBasicInformation 
                                    countries={countries} 
                                    materialReadinessDocument={materialReadinessDocument} 
                                    getMaterialReadinessDocumentById={getMaterialReadinessDocumentById} />}      

                            {activeTab.startsWith("3") && 
                                <UpdatePackage 
                                    handleToggle={handleTabToggle} 
                                    pickupAddress={materialReadinessDocument?.pickUpAddress} 
                                    destination={destination}
                                    countryOfSupply={countryOfSupply}
                                    getPackages={getPackages} 
                                    selectedPurchaseOrderPackages={purchaseOrderNumberFromPackage.find((data:any) => activeTab.includes(data.purchaseOrderNumber))?.packages}
                                    purchaseOrderNumber={activeTab.split(" ")[1]} 
                                    purchaseOrderId={purchaseOrderNumberFromPackage.find((data:any) => activeTab.includes(data.purchaseOrderNumber))?.purchaseOrderId} 
                                    getMaterialReadinessDocumentById={getMaterialReadinessDocumentById} 
                                    countries={countries}/>}       

                            {activeTab.startsWith("4") && 
                                <UpdateMaterialPictures
                                    handleToggle={handleTabToggle} 
                                    packageDetails={packageDetails}
                                    getPackages={getPackages}
                                    getMaterialReadinessDocumentById={getMaterialReadinessDocumentById} 
                                    handleDownloadClick={handleDownloadClickForItemSupply} />}   
                                    

                            {activeTab.startsWith("5") && 
                                <UpdateOtherAttachments  
                                    packageDetails={packageDetails}
                                    getMaterialReadinessDocumentById={getMaterialReadinessDocumentById} 
                                    handleDownloadClick={handleDownloadClickForPackage} />}       
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
            
            <Modal isOpen={openChatModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Send Chat</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenChatModal(false); setIsSubmitting(false); clearChatData()}}>close</span>
                </div>
                <form onSubmit={handleSendChat}>
                <div className="modal-body">
                    <div>
                        <label>
                            <span className="errorX mr-2">*</span> Message
                        </label>                          
                        <textarea 
                            className="mt-1" 
                            name="comment" 
                            placeholder="Write a message..." 
                            rows={4} 
                            maxLength={300}
                            onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                            value={chatData.comment} 
                            required ></textarea>
                    </div> 
                    <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small> 
                    <div className="alert alert-info" style={{margin: "12px 0", padding: "8px", width: "auto"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                        <p style={{margin: 0}}>All involved parties for this material readiness document will have access to the chat within the chat history modal.</p>
                    </div>
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => {setOpenChatModal(false); clearChatData()}}>Cancel</button>
                    <button type="submit" 
                    disabled={isSubmitting}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Send Chat"}</button>
                </div>
                </form>
            </Modal>

            <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Chats</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearChatData()} }>close</span>
                </div>
                <form onSubmit={handleSendChat}>
                <div className="modal-body" style={{ minHeight: "150px"}}>
                    {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                    {!isChatLoading && 
                    <div className='chat-container'>
                        {chats.map((chat: any, index: number) => {
                            return (
                                <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                    <div className="d-flex">
                                        <label className='title'>
                                            {getMaterialReadinessDocumentChatTitle(chat.sender, chat.senderCompany, chat.senderRole)?.split("(")[0]}
                                        </label>
                                        <span className='date'>{formatDateTime(chat.createdDate)}</span>
                                    </div> 
                                    {
                                        chat.message.split('|').map((message: string, index: number) => {
                                            return <p key={index}>{message}</p>
                                        })
                                    }
                                </div>
                            )
                        })}                        
                    </div>}

                    {isChatLoading && 
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p className="d-flex-center">Loading Chats...</p>
                    </div>}
                </div>                
                <div className="modal-footer">
                    <textarea 
                        name="comment" 
                        placeholder="Write a message..." 
                        rows={4} 
                        maxLength={300}
                        onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                        value={chatData.comment} 
                        required >
                    </textarea>
                    <button type="submit" 
                    disabled={isSubmitting || !chatData.comment}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
                </div>
                <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>    

                </form>
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

export default UpdateMaterialReadinessDocument