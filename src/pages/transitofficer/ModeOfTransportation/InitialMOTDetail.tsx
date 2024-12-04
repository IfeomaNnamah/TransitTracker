import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../../Layout";
import PdfGenerator from "../../pdftemplates/generateModeOfTransportation";
import { FormEvent, useEffect, useState } from 'react';
import { formatCurrency, getCurrencySymbol } from 'helpers';
import { makeGetRequest, makePatchRequest } from 'request';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';


const ModeOfTransportationDetail =  () => {
    const param = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: string };
    const [modeOfTransportation, setModeOfTransportation] = useState<Record <string, any>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const user: any = useSelector((state: any) => state.tepngUser.value);
    const permissions: any = useSelector((state: any) => state.permissions.value);
    const [isChecked, setIsChecked] = useState(false)
    const [formData, setFormData] = useState({
        modeOfTransportationId: param.id,
        estimatedCostSeaFreight: 0,
        estimatedCostAirFreight: 0,
        freightCostCurrency: "USD",
        estimatedDimensions: "",
        estimatedWeight: "",
        shippingOfficerCheck: "Approved",
        shippingOfficerId: user?.id,
    })
    const [errorData, setErrorData] = useState({
        estimatedCostSeaFreight: "",
        estimatedCostAirFreight: "",
        freightCostCurrency: "",
        estimatedDimensions: "",
        estimatedWeight: "",
    })

    const clearFormData = () => {
        setFormData({
            modeOfTransportationId: param.id,
            estimatedCostSeaFreight: 0,
            estimatedCostAirFreight: 0,
            freightCostCurrency: "USD",
            estimatedDimensions: "",
            estimatedWeight: "",
            shippingOfficerCheck: "Approved",
            shippingOfficerId: user?.id,
        })
    }
    const handleInputChange = (e: any) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value})
    }

    const getModeOfTransportationById = () => {
        var request = {
            what: "getModeOfTransportationById",
            id: param.id,
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                setModeOfTransportation(res)
            })
            .catch((error) => 
                {console.log(error)}
            );
        }

    const submitResponse = (response: string) => {
        setIsSubmitting(true)
        var request = {
            what: "handleShippingManagerApproval",
            data: {
                modeOfTransportationId: param?.id,
                shippingOfficerManagerId: user?.id,
                shippingOfficerManagerCheck: response
            },
        };
        
        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success(response.msg)
    
                setTimeout(() => {
                    navigate("/transitofficer/modeoftransportationchange")
                }, 700);
            })
            .catch((error) => 
                {toast.error(error.msg); setIsSubmitting(false)}
            );
        }

    const handleUpdateMOTInformation = (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)
        var request = {
            what: "UpdateMOTInformation",
            data: formData,
        };

        makePatchRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                toast.success(response.msg)  
                clearFormData()
                setTimeout(() => {
                    window.location.reload();
                }, 700);
            })
            .catch((error) => 
                {toast.error(error); setIsSubmitting(false);}
            );
        }
    

    useEffect(() => {
        getModeOfTransportationById()
        // eslint-disable-next-line
    }, [])
    const page = "Mode Of Transportation Change"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">                    
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <Link to="/transitofficer/modeoftransportationchange" state={{status: statusAfterNavigation?.status}} className="actions">
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
                    
                    {/* MOT Document */}
                    <div className="main-inner mt-1" style={{minHeight: "500px"}}><PdfGenerator /></div>

                    {permissions?.includes("ValidateMOT") 
                        && (modeOfTransportation?.estimatedCostSeaFreight === 0 && modeOfTransportation?.estimatedCostAirFreight === 0)
                        && <div className="main-inner mt-1">   
                            <div className="summary-title">
                                Mode of Transportation Analysis
                            </div>                      
                            <form onSubmit={handleUpdateMOTInformation} className="form-view-container for-mot">
                                <div className='d-grid-3'>                                    
                                    <div className='form-item span-col-1'  style={{height: "fit-content"}}>
                                        <label><span className="errorX mr-2">*</span>Frieght Cost Currency</label>
                                        <select name="freightCostCurrency" value={formData.freightCostCurrency} onChange={handleInputChange} required>
                                            <option value="" disabled >Select...</option>
                                            <option value="USD" >USD</option>
                                            <option value="GBP" >GBP</option>
                                            <option value="EUR" >EUR</option>
                                        </select>
                                        <p className="error"></p>
                                    </div> 
                                    {/* <div className='form-item span-col-3'>
                                        <label><span className="errorX mr-2">*</span>Justification for this Request (Summary)</label>
                                        <textarea name="justification" rows={5} maxLength={300} className="mt-1" value={formData?.justification} onChange={handleInputChange} required
                                            onKeyUp={() => {formData.justification.length < 1 ? setErrorData({ ...errorData, justification: 'This field is required' }) : 
                                            setErrorData({ ...errorData, justification: '' })}}> 
                                        </textarea>
                                        <small style={{fontSize: "10px"}} className={formData.justification.length >= 300 ? "mt-1 error" : "mt-1"}>{formData.justification.length}/300 Characters</small>
                                        <p className="error">{ errorData?.justification }</p>
                                    </div>                                */}
                                    <div className='form-item span-col-1' style={{height: "fit-content"}}>
                                        <label><span className="errorX mr-2">*</span>Estimated Sea Freight Cost</label>
                                        <div style={{display: "flex"}}>
                                            <input name="estimatedCostSeaFreight" 
                                            style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} 
                                                disabled={!formData.freightCostCurrency}
                                                value={formData?.estimatedCostSeaFreight} onChange={handleInputChange} type='number' required
                                                onKeyUp={() => {Number(formData.estimatedCostSeaFreight) < 0 ? setErrorData({ ...errorData, estimatedCostSeaFreight: 'This field is required' }) : 
                                                setErrorData({ ...errorData, estimatedCostSeaFreight: '' })}} />
                                            <input
                                            style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                                            type="text" disabled value={`${getCurrencySymbol(formData?.freightCostCurrency)} ${formatCurrency(formData?.estimatedCostSeaFreight)}`} />
                                        </div>                                    
                                        <p className="error">{ errorData?.estimatedCostSeaFreight }</p>
                                    </div>
                                    <div className='form-item span-col-1' style={{height: "fit-content"}}>
                                        <label><span className="errorX mr-2">*</span>Estimated Air Freight Cost</label>
                                        <div style={{display: "flex"}}>
                                            <input name="estimatedCostAirFreight"
                                                style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} 
                                                disabled={!formData.freightCostCurrency}
                                                value={formData?.estimatedCostAirFreight} 
                                                onChange={handleInputChange} 
                                                type='number' 
                                                required
                                                onKeyUp={() => {Number(formData.estimatedCostAirFreight) < 0 ? setErrorData({ ...errorData, estimatedCostAirFreight: 'This field is required' }) : 
                                                setErrorData({ ...errorData, estimatedCostAirFreight: '' })}} />       
                                            <input
                                            style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                                            type="text" disabled value={`${getCurrencySymbol(formData?.freightCostCurrency)} ${formatCurrency(formData?.estimatedCostAirFreight)}`} />
                                        </div>                                                                   
                                        <p className="error">{ errorData?.estimatedCostAirFreight }</p>
                                    </div>
                                    <div className='form-item span-col-1'>
                                        <label><span className="errorX mr-2">*</span>Estimated Dimensions (L x W x H)</label>
                                        <input name="estimatedDimensions" 
                                            value={formData?.estimatedDimensions} onChange={handleInputChange} type='text' required
                                            onKeyUp={() => {formData.estimatedDimensions.length < 1 ? setErrorData({ ...errorData, estimatedDimensions: 'This field is required' }) : 
                                            setErrorData({ ...errorData, estimatedDimensions: '' })}} />
                                        <p className="error">{ errorData?.estimatedDimensions }</p>
                                    </div> 
                                    <div className='form-item span-col-1'>
                                        <label><span className="errorX mr-2">*</span>Estimated Weight (Kilograms)</label>
                                        <input name="estimatedWeight" 
                                            value={formData?.estimatedWeight} onChange={handleInputChange} type='text' required
                                            onKeyUp={() => {formData.estimatedWeight.length < 1 ? setErrorData({ ...errorData, estimatedWeight: 'This field is required' }) : 
                                            setErrorData({ ...errorData, estimatedWeight: '' })}} />
                                        <p className="error">{ errorData?.estimatedWeight }</p>
                                    </div>                       
                                </div> 
                                <button 
                                    disabled={isSubmitting}
                                    style={{width: "100%"}}
                                    className='custom-button orange-outline d-flex-center' 
                                    type='submit'>{isSubmitting ? 'Saving...' : 'Save Changes'}</button> 
                            </form>
                        </div>}

                    {/* Approval of MOT by Shipping Manager */}
                    {permissions?.includes("ApproveMOTCostAndDimensions") &&
                    !modeOfTransportation?.requesterManagerApproval &&
                    <div className="main-inner mt-1" style={{padding: "16px", boxSizing: "border-box"}}>
                        <div>
                            <input onClick={(event: any) => setIsChecked(event.target.checked)} type="checkbox" />
                            <small className="ml-2" style={{fontSize: "12px"}}>I, <strong className="uppercase">{user?.firstName} {user?.lastName}</strong>, approve the above stated mode of transportation change request with the displayed cost and dimensions.</small>
                        </div>
                        
                        <div className='d-flex-center' style={{gap: "8px", borderTop: "1px solid #d9d9d9", paddingTop: "16px", marginTop: "16px"}}>
                            <button 
                                style={{width: "100%", justifyContent: "center"}} 
                                type="submit" 
                                disabled={!isChecked || isSubmitting}
                                className="custom-button red-outline"
                                onClick={() => submitResponse("Rejected")}>Reject</button>
                            <button 
                                style={{width: "100%", justifyContent: "center"}} 
                                type="submit" 
                                disabled={!isChecked || isSubmitting}
                                className="custom-button orange"
                                onClick={() => submitResponse("Approved")}>Approve</button>
                        </div>
                    </div>}
                </div>
                <ToastContainer />
            </div>
        </Layout>
        
    )
}

export default ModeOfTransportationDetail