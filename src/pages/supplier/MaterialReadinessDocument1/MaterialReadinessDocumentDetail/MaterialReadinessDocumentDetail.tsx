import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import loading from "../../../../assets/images/loading.gif"
import Modal from "react-modal"
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../../Layout";
import PdfGeneratorPackingList from "../../../pdftemplates/generatePackingList";
import PdfGeneratorCommercialInvoice from "../../../pdftemplates/generateCommercialInvoice";
import { setPageContext } from "store/pageContext";
import AttachedDocumentsList from "./AttachedDocumentsList";
import { customStyles } from "helpers";
import PickupInformation from "./PickupInformation";
import { makeGetRequest } from "request";
import MaterialPicturesList from "./MaterialPicturesList";

const MaterialReadinessDocumentDetail =  () => {
    const navigate = useNavigate()    
    const dispatch = useDispatch()  
    const param = useParams()  
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const pageContext:any = useSelector((state: any) => state.pageContext.value);
    // const user: any = useSelector((state: any)=> state.tepngUser.value)
    
    const queryParams = new URLSearchParams(window.location.search); 
    const queryParamActiveTab = queryParams.get("tab") // if tab = 1 for pickup information tab
    const [activeTab, setActiveTab] = useState(queryParamActiveTab ?? "")      
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

        if(packageId !== "1"){
            getPackage(packageId)
        }
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
                setSelectedCommercialInvoice(selectedCommercialInvoice)
                
                if(!queryParamActiveTab) {
                    setActiveTab(selectedId)
                    setSelectedPackage(selectedPackage)
                }
            })
            .catch(error => 
                {console.log(error)}
            );
    }

    const getPackage = (packageId: string) => {
        setSelectedPackage(materialReadinessDocument.packingLists.find((record: any) => record.packages[0].id === packageId))
        setSelectedCommercialInvoice(materialReadinessDocument.commercialInvoices.find((record: any) => record.purchaseOrderItemSupplies[0].packageId === packageId))
    }

    // const getPackage = (packageId: string) => {
    //     if(!isLoading) setIsLoading(true)
    //     var request: Record<string, any> = {
    //         what: "getPackage",
    //         id: packageId,
    //         params: {
    //             userId: user?.id,
    //         }
    //     };
        
    //     makeGetRequest(request)
    //         .then((response: any) => {
    //             setIsLoading(false)
    //             const res = response.data.data
    //             setSelectedPackage(res)
    //         })
    //         .catch((error:any) => 
    //             {console.log(error);}
    //         );
    // }

    useEffect(() => {
        if(accessToken) getMaterialReadinessDocuments() //eslint-disable-next-line
    }, [accessToken])

    const page = pageContext ? pageContext.page : "Material Readiness Documents"
    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <div onClick={() => {navigate("/supplier/materialreadinessdocuments"); dispatch(setPageContext({status: pageContext?.status}))}} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
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
                <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p>Loading data...</p>
                    </div>
                </Modal>
            </div>
        </Layout>
    )
}

export default MaterialReadinessDocumentDetail