import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout";
import PdfGenerator from "../../pdftemplates/generateProofOfCollection";
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Modal from "react-modal"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import loading from "../../../assets/images/loading.gif"
import { makeGetRequest } from 'request';
import { customStyles } from "helpers";

const ProofOfCollectionDetail =  () => {
    const param = useParams()    
    const accessToken: any = useSelector((state: any) => state.accessToken.value);
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: number };
    const [proofOfCollection, setProofOfCollection] = useState<Record <string, any>>([])
    const [isLoading, setIsLoading] = useState(false) 
    const [activeTab, setActiveTab] = useState("")      
    const [packages, setPackages] = useState([])       
    const [packagingLists, setPackingLists] = useState([])       
    const [selectedPackingListPackages, setSelectedPackingListPackages] = useState<Record <string, any>>([])           

    const getProofofCollection = (packageId: string) => {
        setIsLoading(true)
        var request = {
            what: "getProofOfCollectionById",
            id: param.id,
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const proofOfCollection = response.data.data
                setProofOfCollection(proofOfCollection)
                const packingLists = proofOfCollection.materialReadinessDocuments[0].packingLists                
                const packages = packingLists.map((record: any) => record.packages[0])                
                const selectedId = packages[0].id // selected the first package  
                const selectedPackingListPackages = packingLists.find((record: any) => record.packages[0].id === selectedId)
                setPackages(packages)                
                setPackingLists(packingLists)                
                setActiveTab(selectedId)
                setSelectedPackingListPackages(selectedPackingListPackages)            
            })
            .catch(error => 
                {toast.error(error); setIsLoading(false)}
            );
    }  

    const handleTabToggle = (packageId: string) => {
        setActiveTab(packageId)
        getPackage(packageId)
    }

    const getPackage = (selectedId: string) => {
        setSelectedPackingListPackages(packagingLists.find((record: any) => record?.packages[0]?.id === selectedId)??[]);
    }
    
    useEffect(() => {
        if(accessToken) getProofofCollection("") // eslint-disable-next-line
    }, [accessToken])

    const page = "Proof Of Collection"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <Link to="/candp/proofofcollection" state={{status: statusAfterNavigation?.status}} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Proof of Collection</p>
                            </Link>

                            <div className="tab">                                
                                {
                                    packages?.map((data: any, i: number) => {
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
                            </div>                      
                        </div>
                    </div> 

                    <div className="main-inner mt-1" style={{minHeight: "500px"}}>
                        <PdfGenerator 
                                proofOfCollection={proofOfCollection} 
                                selectedPackingListPackages = {selectedPackingListPackages} />
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

export default ProofOfCollectionDetail