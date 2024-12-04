import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout";
import PdfGenerator from "../../pdftemplates/generateModeOfTransportation";

const ModeOfTransportationDetail =  () => {
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: string };
    const page = "Mode Of Transportation Change"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <Link to={"/deputygeneralmanagertechnicallogistics/modeoftransportationchange"} state={{status: statusAfterNavigation?.status}} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Mode of Transportation</p>
                            </Link>

                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">description</span>
                                    <p>Preview Mode Of Transportation Request</p>
                                </div>    
                            </div>                      
                        </div>
                    </div> 

                    <div className="main-inner mt-1" style={{minHeight: "500px"}}><PdfGenerator role="Deputy General Manager Technical Logistics" /></div>
                </div>
            </div>
        </Layout>
    )
}

export default ModeOfTransportationDetail