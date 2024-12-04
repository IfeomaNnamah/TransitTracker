import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal"
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout";
import PdfGeneratorConsPackingList from "../../pdftemplates/generateConsolidatedPackingList";
import PdfGeneratorConsCommercialInvoice from "../../pdftemplates/generateConsolidatedCommercialInvoice";
import { setPageContext } from "store/pageContext";
import { makeGetRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customStyles } from "helpers";
import loading from "../../../assets/images/loading.gif"


const ConsolidatedDocumentDetail =  () => {
    const navigate = useNavigate()    
    const dispatch = useDispatch()  
    const param = useParams()  
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [activeTab, setActiveTab] = useState("preview-invoice")
    const handleTabToggle = (name: string) => {
        setActiveTab(name)
    }   

    const [data, setData] = useState<Record <string, any>>([])
    const [isLoading, setIsLoading] = useState(true)

    const getConsolidatedDocuments = () => {
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
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    useEffect(() => {
        getConsolidatedDocuments() // eslint-disable-next-line
    }, [accessToken])

    const page = "Consolidated Documents"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <div onClick={() => {navigate(-1); dispatch(setPageContext({tab: "mrd"}))}} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Consolidated Documents</p>
                            </div>
                              
                            <div className="tab">
                                <div className={activeTab === "preview-invoice" ? "tab-item active" : "tab-item"} onClick={() => handleTabToggle("preview-invoice")}>
                                    <span className="material-symbols-rounded">receipt_long</span>
                                    <p>Preview Commercial Invoice</p>
                                </div>
                                <div className={activeTab === "preview-packinglist" ? "tab-item active" : "tab-item"} onClick={() => handleTabToggle("preview-packinglist")}>
                                    <span className="material-symbols-rounded">list_alt</span>
                                    <p>Preview Packing List</p>
                                </div>
                            </div>                      
                        </div>
                    </div> 

                     
                    <div className="main-inner mt-1" style={{minHeight:"450px"}}>                 
                        {activeTab === "preview-invoice" && !isLoading && <PdfGeneratorConsCommercialInvoice data={data?.consolidatedCommercialInvoice} />}
                        {activeTab === "preview-packinglist" && !isLoading && <PdfGeneratorConsPackingList data={data?.consolidatedPackingList} />}
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
        </Layout>
    )
}

export default ConsolidatedDocumentDetail