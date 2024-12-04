import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal"
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import PdfGeneratedHandoffDocument from "../../pdftemplates/generateHandOffDocument";
import { makeGetRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customStyles } from "helpers";
import loading from "../../../assets/images/loading.gif"


const HandoffDocumentDetail =  () => {
    const navigate = useNavigate()  
    const param = useParams()  
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: number };
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
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
                            <div onClick={() => navigate("/portofficer/shippingdocuments", {state: {status: statusAfterNavigation?.status}})} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Shipping Documents</p>
                            </div>
                              
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">receipt_long</span>
                                    <p>Preview Handoff Document</p>
                                </div>    
                            </div>                     
                        </div>
                    </div> 

                     
                    <div className="main-inner mt-1" style={{minHeight:"450px"}}>                 
                        {!isLoading && <PdfGeneratedHandoffDocument shippingDocument={data} consolidatedCommercialInvoice={data?.consolidatedCommercialInvoice} referenceNumber={data?.referenceNumber} localClearingAgent={data?.localClearingAgent} />}                        
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

export default HandoffDocumentDetail