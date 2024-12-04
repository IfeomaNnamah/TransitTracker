import { customStyles } from "helpers";
import { FormEvent, useEffect,useState } from "react";
import Modal from 'react-modal';
import { useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makePatchRequest } from "request";

const PickupInformation = (props: any) => {
    const { materialReadinessDocument } = props
    const [formData, setFormData] = useState<Record <string, any>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openChatModal, setOpenChatModal] = useState(false)
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const roles:any = useSelector((state: any) => state.roles.value);
    const [chatData, setChatData] = useState({
        comment: "",
    })
    const clearChatData = () => {
        setChatData({
            comment: "",
        })
    }

    const handleRequestPickupAddressUpdate = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request: Record<string, any> = {
            what: "RequestChangePickupAddress",
            data: {
                materialReadinessDocumentId: materialReadinessDocument?.id,
            }
        };
        
        makePatchRequest(request)
            .then((response: any) => {                
                toast.success(response.msg)
                handleSendChat()
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }  
    const handleSendChat = () => {        
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
                clearChatData()
                setOpenChatModal(false)
            })
            .catch((error:any) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    }    

    useEffect(() => {
        if(materialReadinessDocument) setFormData({
            nameOfContactPerson: materialReadinessDocument?.nameOfContactPerson,
            emailOfContactPerson: materialReadinessDocument?.emailOfContactPerson,
            phoneNumberOfContactPerson: materialReadinessDocument?.phoneNumberOfContactPerson,
            countryOfSupply: materialReadinessDocument?.countryOfSupply,
            pickupAddress: materialReadinessDocument?.pickUpAddress,
            openingHour: materialReadinessDocument?.openingHour,
            closingHour: materialReadinessDocument?.closingHour,
            otherRelevantInformation: materialReadinessDocument?.otherRelevantInformation,
            canChangePickupAddress: materialReadinessDocument?.canChangePickupAddress,
            materialReadinessDocumentStatus: materialReadinessDocument?.materialReadinessDocumentStatus,
            city: materialReadinessDocument?.city
        }) //eslint-disable-next-line
    }, [materialReadinessDocument])

    return (
        <div>
            <div className="form-view-container custom" style={{padding: "16px", backgroundColor: "white", margin:0, borderRadius: "6px"}}>
                <div className="layout">
                    <div className="label">Pickup Information</div>
                    
                    <div className="body d-grid-2"> 
                        <div className='form-item span-col-1'>
                            <label>Name of Contact Person</label>
                            <input required disabled name="nameOfContactPerson" value={formData?.nameOfContactPerson} />
                            
                        </div> 
                        <div className='form-item span-col-1'>
                            <label>Email Address</label>
                            <input type="email" required disabled name="emailAddress" value={formData?.emailOfContactPerson} />
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <label>Phone Number</label>
                            <input name="phoneNumberOfContactPerson" disabled value={formData?.phoneNumberOfContactPerson} />                             
                        </div> 
                        <div className='form-item span-col-1'>
                            <div className="two-fields">
                                <div>
                                    <label>Country of Supply</label>
                                    <input name="countryOfSupply" disabled value={formData?.countryOfSupply} />    
                                </div> 
                                <div>
                                    <label>City</label>
                                    <input name="city" disabled value={formData?.city} type="text" />
                                </div>
                            </div>                       
                        </div> 
                        <div className='form-item span-col-2'>
                        <label style={{display: "flex", gap: "4px"}}>Pickup Address 
                            {formData?.materialReadinessDocumentStatus==="ASSIGNED_TO_FREIGHT_FORWARDER"&&<span 
                                className="blue-text"
                                onClick={() => formData?.canChangePickupAddress ? null : setOpenChatModal(true)}
                                title="Request Pickup Address Update From Supplier"
                            > .  Request Update</span>}
                        </label>
                        <input required name="pickupAddress" disabled value={formData?.pickupAddress} type="text" />
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <div className="two-fields">
                                <div>
                                <label>Opening Hour</label>
                                <input name="openingHour" disabled value={formData?.openingHour} />
                                </div>          
                                <div>
                                <label>Closing Hour</label>
                                <input name="closingHour" disabled value={formData?.closingHour} />  
                                </div> 
                            </div> 
                        </div>

                        <div className='form-item span-col-1'>
                            <label>Other Relevant Information</label>
                            <input name="otherRelevantInformation" value={formData.otherRelevantInformation} disabled />
                            
                        </div>
                    </div>                                    
                </div>
            </div>
            <Modal isOpen={openChatModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Request Pickup Address Update</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenChatModal(false); setIsSubmitting(false); clearChatData()}}>close</span>
                </div>
                <form onSubmit={handleRequestPickupAddressUpdate}>
                <div className="modal-body">
                    <div>
                        <label>
                            <span className="errorX mr-2">*</span> Reason
                        </label>  
                        <textarea 
                            className="mt-1" 
                            name="comment" 
                            placeholder="Message for supplier..." 
                            rows={4} 
                            maxLength={300}
                            onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                            value={chatData.comment} 
                            required ></textarea>
                    </div> 
                    <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => {setOpenChatModal(false); clearChatData()}}>Cancel</button>
                    <button type="submit" 
                    disabled={isSubmitting}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
                </div>
                </form>
            </Modal>
            <ToastContainer />
        </div>
    )
}

export default PickupInformation