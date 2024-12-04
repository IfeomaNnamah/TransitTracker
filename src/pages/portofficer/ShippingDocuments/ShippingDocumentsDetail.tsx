import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useParams } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
import Modal from "react-modal"
import PdfGeneratorConsCommercialInvoice from "../../pdftemplates/generateConsolidatedCommercialInvoice";
import PdfGeneratorConsPackingList from "../../pdftemplates/generateConsolidatedPackingList";
import { makeGetRequest } from "../../../request";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import { customStyles, formatDateTime, handleDownloadForShippingDocuments, handlePreviewForShippingDocuments } from "helpers";

const ShippingDocumentsDetail =  () => {
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const param = useParams()
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: number };
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<Record <string, any>>([])
    const [isShowInvoice, setIsShowInvoice] = useState(false)
    const [isShowPackingList, setIsShowPackingList] = useState(false)

    const getShippingDocument = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getShippingDocumentById",
            id: param.id
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setData(res)
            })
            .catch((error:any) => 
                toast.error(error.errorMessage)
            );
    }

    const handleDownloadClick = async (shipment: any, documentName: string, title: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handleDownloadForShippingDocuments(shipment, documentName, title);
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };

    const handlePreviewClick = async (shipment: any, documentName: string) => {
        // Set isLoading to true when the download process starts
        setIsLoading(true);
    
        // Call the function to handle the document download
        const result = await handlePreviewForShippingDocuments(shipment, documentName);
    
        // Set isLoading to false based on the result of the download operation
        setIsLoading(result);
    };
    
    /**
     * Retrives the last occurence that matches the document name
     *
     * @param {any} shipment - The shipment object containing the document attachments.
     * @param {string} documentName - The name of the document to retrieve the blob storage name for.
     * @return {string | null} The document blob storage name if found, otherwise null.
     */
    const getDocumentBlobStorageName = (shipment: any, documentName: string) => {
        return shipment?.shippingDocumentAttachments?.reduce((prev: any, curr: any) => {
          return curr.documentName === documentName ? curr : prev;
        }, null)?.documentBlobStorageName;
    };

    const getDocumentUploadDate = (shipment:any, documentName: string) => {
        return shipment?.shippingDocumentAttachments?.find((attachment: any) => attachment.documentName === documentName)?.createdDate
    }

    useEffect(() => {
        if(accessToken) getShippingDocument() // eslint-disable-next-line
    }, [accessToken])

    const page = "Shipping Documents"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>     
                    
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <Link to={"/portofficer/shippingdocuments"} state={{ status: statusAfterNavigation?.status}} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Shipping Documents</p>
                            </Link>
                              
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">visibility</span>
                                    <p>Preview Shipping Documents</p>
                                </div>
                            </div>                      
                        </div>
                    </div>   

                    <div className="main-inner mt-1" style={{minHeight: "100vh", padding: "16px", boxSizing: "border-box"}}> 
                        <div className="accordion">
                            <div className={`header d-flex ${isShowInvoice ? 'active' : ''}`} onClick={() => setIsShowInvoice(!isShowInvoice)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowInvoice ? "expand_more" : "chevron_right"}</span>
                                    <span>Consolidated Commercial Invoice</span>
                                </div>
                                <p className="small-text m-0">Created: {formatDateTime(data?.createdDate)}</p>
                            </div>
                            {isShowInvoice && <div className="body">
                                <PdfGeneratorConsCommercialInvoice key="1" data={data?.consolidatedCommercialInvoice} />
                            </div>}
                        </div>    

                        <div className="accordion mt-1">
                            <div className={`header d-flex ${isShowPackingList ? 'active' : ''}`} onClick={() => setIsShowPackingList(!isShowPackingList)}>
                                <div className="d-flex">
                                    <span className="material-symbols-rounded">{isShowPackingList ? "expand_more" : "chevron_right"}</span>
                                    <span>Consolidated Packing List</span>
                                </div>
                                <p className="small-text m-0">Created: {formatDateTime(data?.createdDate)}</p>
                            </div>
                            {isShowPackingList && <div className="body">
                                <PdfGeneratorConsPackingList key="2" data={data?.consolidatedPackingList} />
                            </div>}
                        </div>

                        <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "DraftBillOfLadingOrAirWayBill") ? "disabled" : ""}>
                                Draft Bill Of Lading/Air Way Bill
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DraftBillOfLadingOrAirWayBill"))}</p>
                            </span>  
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "DraftBillOfLadingOrAirWayBill")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "DraftBillOfLadingOrAirWayBill")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> } 
                                <button className='actions blue' 
                                    disabled={!getDocumentBlobStorageName(data, "DraftBillOfLadingOrAirWayBill")} 
                                    onClick={() => handleDownloadClick(data, "DraftBillOfLadingOrAirWayBill", "Draft_Bill_Of_Lading_Or_Air_Way_Bill_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "DraftCombinedCertificateValueOrigin") ? "disabled" : ""}>
                                Draft Combined Certificate Value Origin (CCVO)
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DraftCombinedCertificateValueOrigin"))}</p>
                            </span>
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "DraftCombinedCertificateValueOrigin")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "DraftCombinedCertificateValueOrigin")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }   
                                <button className='actions blue' 
                                    disabled={!getDocumentBlobStorageName(data, "DraftCombinedCertificateValueOrigin")} 
                                    onClick={() => handleDownloadClick(data, "DraftCombinedCertificateValueOrigin", "Draft_Combined_Certificate_Value_Origin_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill") ? "disabled" : ""}>
                                Bill Of Lading/Air Way Bill
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "BillOfLadingOrAirWayBill"))}</p>
                            </span> 
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "BillOfLadingOrAirWayBill")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }  
                                <button className='actions blue' 
                                    disabled={!getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill")} 
                                    onClick={() => handleDownloadClick(data, "BillOfLadingOrAirWayBill", "Bill_Of_Lading_Or_Air_Way_Bill_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div>    

                        <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin") ? "disabled" : ""}>
                                Combined Certificate Value Origin (CCVO)
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "CombinedCertificateValueOrigin"))}</p>
                            </span>  
                            <div className="d-flex">
                            {getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "CombinedCertificateValueOrigin")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> } 
                                <button className='actions blue'
                                    disabled={!getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin")} 
                                    onClick={() => handleDownloadClick(data, "CombinedCertificateValueOrigin", "Combined_Certificate_Value_Origin_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div> 

                        {/* Other shipping documents */}
                        {getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") ? "disabled" : ""}>
                                Final Duty Assessment Document
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "FinalDutyAssessmentDocument"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "FinalDutyAssessmentDocument")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument")} 
                                        onClick={() => handleDownloadClick(data, "FinalDutyAssessmentDocument", "Final_Duty_Assessment_Document_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div> }

                        {getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") ? "disabled" : ""}>
                                SONCAP
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")} 
                                        onClick={() => handleDownloadClick(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme", "Standard_Organisation_Of_Nigeria_Conformity_Assessment_Programme_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") ? "disabled" : ""}>
                                Pre Arrival Assessment Report (PAAR)
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "PreArrivalAssessmentReport"))}</p>
                            </span> 
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "PreArrivalAssessmentReport")?.split('.')[1] === "pdf"
                                &&<button className='actions blue mr-1'
                                    onClick={() => handlePreviewClick(data, "PreArrivalAssessmentReport")}>
                                        <span className="material-symbols-rounded">preview</span>
                                        <span>Preview</span>
                                </button> }
                                <button className='actions blue'
                                    disabled={!getDocumentBlobStorageName(data, "PreArrivalAssessmentReport")} 
                                    onClick={() => handleDownloadClick(data, "PreArrivalAssessmentReport", "Pre_Arrival_Assessment_Report")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>
                        </div>} 

                        {getDocumentBlobStorageName(data, "DemandNotice") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "DemandNotice") ? "disabled" : ""}>
                                Demand Notice
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DemandNotice"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "DemandNotice")?.split('.')[1] === "pdf"
                                &&<button className='actions blue mr-1'
                                    onClick={() => handlePreviewClick(data, "DemandNotice")}>
                                        <span className="material-symbols-rounded">preview</span>
                                        <span>Preview</span>
                                </button> }
                                <button className='actions blue'
                                    disabled={!getDocumentBlobStorageName(data, "DemandNotice")} 
                                    onClick={() => handleDownloadClick(data, "DemandNotice", "Demand_Note_")}>
                                        <span className="material-symbols-rounded">download</span>
                                        <span>Download</span>
                                </button>
                            </div>   
                        </div>}

                        {getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") ? "disabled" : ""}>
                                Demand Notice Payment Receipt
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "DemandNoticePaymentReceipt"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "DemandNoticePaymentReceipt")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt")} 
                                        onClick={() => handleDownloadClick(data, "DemandNoticePaymentReceipt", "Demand_Notice_Payment_Receipt_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>} 

                        {getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") ? "disabled" : ""}>
                                SGD Form
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "SingleGoodsDeclarationForm"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "SingleGoodsDeclarationForm")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm")} 
                                        onClick={() => handleDownloadClick(data, "SingleGoodsDeclarationForm", "Single_Goods_Declaration_Form_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>} 

                        {getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") ? "disabled" : ""}>
                                SGD Detail Of Valuation Note
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "SingleGoodsDeclarationDetailOfValuationNote"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "SingleGoodsDeclarationDetailOfValuationNote")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote")} 
                                        onClick={() => handleDownloadClick(data, "SingleGoodsDeclarationDetailOfValuationNote", "Single_Goods_Declaration_Detail_Of_Valuation_Note_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div> }

                        {getDocumentBlobStorageName(data, "ExchangeControl") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "ExchangeControl") ? "disabled" : ""}>
                                Exchange Control
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ExchangeControl"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "ExchangeControl")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "ExchangeControl")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "ExchangeControl")} 
                                        onClick={() => handleDownloadClick(data, "ExchangeControl", "Exchange_Control_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div> }

                        {getDocumentBlobStorageName(data, "FormM") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "FormM") ? "disabled" : ""}>
                                Form M
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "FormM"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "FormM")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "FormM")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "FormM")} 
                                        onClick={() => handleDownloadClick(data, "FormM", "FormM_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") ? "disabled" : ""}>
                                Shipping And Terminal Company Receipts
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ShippingAndTerminalCompanyReceipts"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "ShippingAndTerminalCompanyReceipts")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts")} 
                                        onClick={() => handleDownloadClick(data, "ShippingAndTerminalCompanyReceipts", "Shipping_And_Terminal_Company_Receipts_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "ProofOfDelivery") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "ProofOfDelivery") ? "disabled" : ""}>
                                Proof Of Delivery
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ProofOfDelivery"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "ProofOfDelivery")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "ProofOfDelivery")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "ProofOfDelivery")} 
                                        onClick={() => handleDownloadClick(data, "ProofOfDelivery", "Proof_Of_Delivery_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "NAFDACReleaseNote") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "NAFDACReleaseNote") ? "disabled" : ""}>
                                NAFDAC Release Note
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "NAFDACReleaseNote"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "NAFDACReleaseNote")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "NAFDACReleaseNote")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "NAFDACReleaseNote")} 
                                        onClick={() => handleDownloadClick(data, "NAFDACReleaseNote", "NAFDAC_Release_Note_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "AcknowledgementLetter") && <div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "AcknowledgementLetter") ? "disabled" : ""}>
                                Acknowledgement Letter
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "AcknowledgementLetter"))}</p>
                            </span> 
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "AcknowledgementLetter")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "AcknowledgementLetter")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> } 
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "AcknowledgementLetter")} 
                                        onClick={() => handleDownloadClick(data, "AcknowledgementLetter", "Acknowledgement_Letter_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "ExitNote") &&<div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "ExitNote") ? "disabled" : ""}>
                                Customs Exit Note
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ExitNote"))}</p>
                            </span>  
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "ExitNote")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "ExitNote")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> }
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "ExitNote")} 
                                        onClick={() => handleDownloadClick(data, "ExitNote", "Exit_Note_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}

                        {getDocumentBlobStorageName(data, "ContainerRefundDocuments") &&<div className="d-flex file-input-container mt-1">
                            <span className={!getDocumentBlobStorageName(data, "ContainerRefundDocuments") ? "disabled" : ""}>
                                Container Refund Documents
                                <p className="small-text m-0 mt-1">Uploaded: {formatDateTime(getDocumentUploadDate(data, "ContainerRefundDocuments"))}</p>
                            </span> 
                            <div className="d-flex">
                                {getDocumentBlobStorageName(data, "ContainerRefundDocuments")?.split('.')[1] === "pdf"
                                    &&<button className='actions blue mr-1'
                                        onClick={() => handlePreviewClick(data, "ContainerRefundDocuments")}>
                                            <span className="material-symbols-rounded">preview</span>
                                            <span>Preview</span>
                                    </button> } 
                                    <button className='actions blue'
                                        disabled={!getDocumentBlobStorageName(data, "ContainerRefundDocuments")} 
                                        onClick={() => handleDownloadClick(data, "ContainerRefundDocuments", "Container_Refund_Documents_")}>
                                            <span className="material-symbols-rounded">download</span>
                                            <span>Download</span>
                                    </button>
                            </div>
                        </div>}
                    </div>
                </div>
                <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p>Loading data...</p>
                    </div>
                </Modal> 
                <ToastContainer />
            </div>
            <ToastContainer />
        </Layout>
    )
}

export default ShippingDocumentsDetail