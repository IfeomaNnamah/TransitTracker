import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import loading from "../../../../assets/images/loading.gif"
import Modal from "react-modal"
import { useSelector } from "react-redux";
import Layout from "../../../Layout";
import PdfGeneratorPackingList from "../../../pdftemplates/generatePackingList";
import PdfGeneratorCommercialInvoice from "../../../pdftemplates/generateCommercialInvoice";
import AttachedDocumentsList from "./AttachedDocumentsList";
import { customStyles, formatDateTime, getMaterialReadinessDocumentChatTitle } from "helpers";
import PickupInformation from "./PickupInformation";
import { makeGetRequest, makePatchRequest } from "request";
import MaterialPicturesList from "./MaterialPicturesList";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MaterialReadinessDocumentDetail =  () => {
    const navigate = useNavigate()  
    const param = useParams()  
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: number };
    const [activeTab, setActiveTab] = useState("")      
    const [isLoading, setIsLoading] = useState(false)
    const [isShowCommercialInvoice, setIsShowCommercialInvoice] = useState(false)
    const [isShowPackingList, setIsShowPackingList] = useState(false)
    const [isShowAttachedDocuments, setIsShowAttachedDocuments] = useState(false)
    const [isShowMaterialPictures, setIsShowMaterialPictures] = useState(false)
    const [materialReadinessDocument, setMaterialReadinessDocument] = useState<Record <string, any>>([])
    const [packages, setPackages] = useState([]) // To list the Purchase Orders
    const [selectedCommercialInvoice, setSelectedCommercialInvoice] = useState({})
    const [selectedPackage, setSelectedPackage] = useState<Record <string, any>>({}) // To get all the details for each package/purchase order.
    const handleTabToggle = (packageId: string) => {
        setActiveTab(packageId)
        if(packageId !== "1") getPackage(packageId)
    }

    const getMaterialReadinessDocuments = () => {
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
                const packages = res.packingLists.map((packinglist: any) => packinglist.packages[0])
                // this selects the id of the first packinglists package => PO124 - pack1,pack2 - pack1.id
                const selectedId = packages[0].id
                // gets all the packing list with the selected package id
                const selectedPackage = res.packingLists.find((record: any) => record.packages[0].id === selectedId)
                // gets all the commercial invoice with the selected package id
                const selectedCommercialInvoice = res.commercialInvoices.find((invoice: any) =>
                    invoice.purchaseOrderItemSupplies.some((supply: any) => supply.packageId === selectedId)
                );
                setPackages(packages)
                setActiveTab(selectedId)
                setSelectedPackage(selectedPackage)
                setSelectedCommercialInvoice(selectedCommercialInvoice)
            })
            .catch(error => 
                {console.log(error)}
            );
    }

    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chatData, setChatData] = useState({
        materialReadinessDocumentId: "",
        comment: "",
        supplierId: ""
    })
    const clearChatData = () => {
        setChatData({
            materialReadinessDocumentId: "",
            comment: "",
            supplierId: ""
        })
    }

    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "AddCommentForMaterialReadinessDocument",
            data: {
                materialReadinessDocumentId: materialReadinessDocument?.id,
                comment: chatData.comment,
                sender: user?.id,
                senderCompany: user?.companyName,
                senderRole: roles?.join(", "),
                receiver: materialReadinessDocument?.supplierId, // enter supplier id for the mrd
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success("Chat Sent Successfully!")
                getMaterialReadinessDocumentChatHistory()
                clearChatData()
                setOpenChatHistory(false)
                getMaterialReadinessDocuments()
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    } 

    const getMaterialReadinessDocumentChatHistory = () => {
        setIsChatLoading(true)
        var request: Record<string, any> = {
            what: "getMaterialReadinessDocumentChatHistory",
            id: materialReadinessDocument?.id,
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

    const getPackage = (packageId: string) => {
        setSelectedPackage(materialReadinessDocument.packingLists.find((record: any) => record.packages[0].id === packageId))
        setSelectedCommercialInvoice(materialReadinessDocument.commercialInvoices.find((invoice: any) =>
            invoice.purchaseOrderItemSupplies.some((supply: any) => supply.packageId === packageId)
        ))
    }

    useEffect(() => {
        if(accessToken) getMaterialReadinessDocuments() //eslint-disable-next-line
    }, [accessToken])

    const page = "Material Readiness Documents"
    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <div className="d-flex">
                                <div 
                                    onClick={() => navigate("/freightforwarder/materialreadinessdocument", {state: {status: statusAfterNavigation?.status}})} className="actions">
                                    <p><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
                                </div>
                                <button className="actions"
                                    onClick={() => {setOpenChatHistory(true); getMaterialReadinessDocumentChatHistory()} }>
                                    <p><span className="material-symbols-outlined">forum</span>Send | View Chats</p>
                                </button>
                            </div>
                              
                            <div className="tab">
                                
                                {
                                    packages.map((data: any, i: number) => {
                                        return (
                                            <div className={activeTab === data.id ? "tab-item active" : "tab-item"} onClick={() => handleTabToggle(data.id)}>
                                                {/* The icon numbers stop at 9. Displaying just circles afterwards */}
                                                {(i >= 0 && i < 10) && <span className="material-symbols-rounded">counter_{i+1}</span>}
                                                {i > 9 && <span className="material-symbols-rounded">circle</span>}
                                                <p>PO {data.purchaseOrderItemSupplies[0]?.purchaseOrderItem?.purchaseOrderNumber}</p>
                                            </div>
                                        )
                                    })
                                }
                                <div className={activeTab === "1" ? "tab-item active" : "tab-item"} onClick={() => handleTabToggle("1")}>
                                    <span className="material-symbols-rounded">contact_phone</span>
                                    <p>Pickup Information</p>
                                </div>
                            </div>                      
                        </div>
                    </div> 
                    {activeTab !== "1" && <div className="main-inner mt-1" style={{minHeight: "calc(100vh - 160px)", padding: "16px", boxSizing: "border-box"}}> 
                        <div className="accordion">
                            <div className={`header d-flex ${isShowCommercialInvoice ? 'active' : ''}`} onClick={() => setIsShowCommercialInvoice(!isShowCommercialInvoice)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowCommercialInvoice ? "expand_more" : "chevron_right"}</span>
                                    <span>Commercial Invoice</span>
                                </div>
                                
                            </div>
                            {isShowCommercialInvoice && <div className="body">
                                <PdfGeneratorCommercialInvoice 
                                    data={selectedCommercialInvoice} 
                                    otherData={
                                        {
                                            pickUpAddress: materialReadinessDocument.pickUpAddress,
                                            soldTo: materialReadinessDocument.soldTo,
                                            shipTo: materialReadinessDocument.shipTo
                                        }} />
                            </div>}
                        </div>
                        <div className="accordion mt-1">
                            <div className={`header d-flex ${isShowPackingList ? 'active' : ''}`} onClick={() => setIsShowPackingList(!isShowPackingList)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowPackingList ? "expand_more" : "chevron_right"}</span>
                                    <span>Packing List</span>
                                </div>
                                
                            </div>
                            {isShowPackingList && <div className="body">
                                <PdfGeneratorPackingList 
                                    data={selectedPackage} 
                                    otherData={
                                        {
                                            pickUpAddress: materialReadinessDocument.pickUpAddress,
                                            soldTo: materialReadinessDocument.soldTo,
                                            shipTo: materialReadinessDocument.shipTo
                                        }} />
                            </div>}
                        </div>

                        <div className="accordion mt-1">
                            <div className={`header d-flex ${isShowAttachedDocuments ? 'active' : ''}`} onClick={() => setIsShowAttachedDocuments(!isShowAttachedDocuments)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowAttachedDocuments ? "expand_more" : "chevron_right"}</span>
                                    <span>Attached Documents</span>
                                </div>
                                
                            </div>
                            {isShowAttachedDocuments && <div className="body">
                                <AttachedDocumentsList packageAttachments={selectedPackage?.packages[0].packageAttachments} />
                            </div>}
                        </div>

                        <div className="accordion mt-1">
                            <div className={`header d-flex ${isShowMaterialPictures ? 'active' : ''}`} onClick={() => setIsShowMaterialPictures(!isShowMaterialPictures)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowMaterialPictures ? "expand_more" : "chevron_right"}</span>
                                    <span>Material Pictures</span>
                                </div>
                                
                            </div>
                            {isShowMaterialPictures && <div className="body">
                                <MaterialPicturesList purchaseOrderItems={selectedPackage?.packages[0].purchaseOrderItemSupplies} />
                            </div>}
                        </div>
                    </div>}

                    {activeTab === "1" && <div className="main-inner mt-1" style={{minHeight: "calc(100vh - 160px)", boxSizing: "border-box"}}> 
                        <PickupInformation materialReadinessDocument={materialReadinessDocument} />                                
                    </div>}
                </div>
                <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Chats</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => {setOpenChatHistory(false); setIsSubmitting(false); clearChatData()} }>close</span>
                    </div>
                    
                    <div className="modal-body" style={{ maxHeight: "250px", minHeight: "150px"}}>
                        {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                        {!isChatLoading && 
                        <div className='chat-container'>
                            {chats.map((chat: any, index: number) => {
                                return (
                                    <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                        <label className='title'>
                                            {getMaterialReadinessDocumentChatTitle(chat.sender, chat.senderCompany, chat.senderRole)}
                                        </label>
                                        {
                                            chat.message.split('|').map((message: string, index: number) => {
                                                return <p key={index}>{message}</p>
                                            })
                                        }
                                        <span className='date'>{formatDateTime(chat.createdDate)}</span>
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
                    {/* i.e. hide send chat if picked or poc generated */}
                    {(materialReadinessDocument.materialReadinessDocumentStatus !== "POC_GENERATED" && materialReadinessDocument.materialReadinessDocumentStatus !== "READY_FOR_POC") 
                    && <form onSubmit={handleSendChat}>
                    <div className="modal-footer">
                        <textarea 
                            name="comment" 
                            placeholder="Message for supplier..." 
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
                    <div className="alert alert-warning" style={{margin: "12px 0 0 0 ", padding: "8px", width: "auto", alignItems: "start"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#e4b14b", fontSize: "16px"}}>warning</span>
                        <div style={{fontSize: "10.5px"}}>
                            <p style={{margin: 0, marginBottom: "4px"}}>Keep in mind information</p>
                            <span style={{fontWeight: "300"}}>Sending a chat requires the supplier to update the material readiness document. Avoid initiating if no update is needed.</span>
                        </div>
                    </div>
                    </form>}
                </Modal>
                <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p>Loading data...</p>
                    </div>
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default MaterialReadinessDocumentDetail