import { FormEvent, useEffect, useState } from "react"
import CountryCodes from "../../../CountryCodes.json"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makePatchRequest } from "request";
import Modal from 'react-modal'
import loading from "../../../../assets/images/loading.gif"
import { useSelector } from "react-redux";
import { customStyles, destinations, totalEnergiesAddress } from "helpers";

const UpdateBasicInformation = (props: any) => {
    const { countries, materialReadinessDocument, getMaterialReadinessDocumentById } = props
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nameOfContactPerson: "",
        emailAddress: "",
        countryCode: "",
        phoneNumber: "",
        countryOfSupply: "",
        pickupAddress: "",
        openingHours: "",
        openingHoursPeriod: "",
        closingHours: "",
        closingHoursPeriod: "",
        soldTo: "",
        shipTo: "",
        otherRelevantInformation: "",
        destination: "",
        cityForCountry: ""
    })
    const handleChange = (e: any) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value})
    }

    const timeHours = Array.from({ length: 12 }, (_, i) => {
        return (i + 1).toString().padStart(2, '0');
    });

    useEffect(() => {
        setFormData({
        ...formData,
        countryCode: CountryCodes.find(countrycode => countrycode.country === formData?.countryOfSupply)?.code ?? ''});
        //eslint-disable-next-line
    }, [formData?.countryOfSupply])

    const handleUpdatePickupInformation = (event: FormEvent) => {
        event.preventDefault()
        const data = {
            materialReadinessDocumentId: materialReadinessDocument?.id,
            countryOfSupply: formData?.countryOfSupply,
            soldTo: formData?.soldTo,
            shipTo: formData?.shipTo,
            destination: formData?.destination,
            supplierId: user?.id,
            nameOfContactPerson: formData?.nameOfContactPerson,
            emailOfContactPerson: formData?.emailAddress,
            phoneNumberOfContactPerson: `(${formData?.countryCode})${formData?.phoneNumber}`,
            openingHour: `${formData?.openingHours} ${formData?.openingHoursPeriod}`,
            closingHour: `${formData?.closingHours} ${formData?.closingHoursPeriod}`,
            otherRelevantInformation: formData?.otherRelevantInformation,
            city: formData?.cityForCountry,
            ...(materialReadinessDocument?.canChangePickupAddress && { pickUpAddress: formData?.pickupAddress })
        }         

        setIsLoading(true)
        var request:Record<string, any> = {
            what: "UpdateMaterialReadinessDocumentBasicInformation",
            data: data
        }

        makePatchRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                toast.success(response.msg)
                getMaterialReadinessDocumentById()
            }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }

    useEffect(() => {
        if(materialReadinessDocument) {
            setFormData({
                nameOfContactPerson: materialReadinessDocument.nameOfContactPerson,
                emailAddress: materialReadinessDocument.emailOfContactPerson,
                countryCode: materialReadinessDocument?.phoneNumberOfContactPerson?.split("(")[1].split(")")[0],
                phoneNumber: materialReadinessDocument?.phoneNumberOfContactPerson?.split(")")[1],
                countryOfSupply: materialReadinessDocument.countryOfSupply,
                pickupAddress: materialReadinessDocument.pickUpAddress,
                openingHours: materialReadinessDocument.openingHour?.split(" ")[0],
                openingHoursPeriod: materialReadinessDocument.openingHour?.split(" ")[1],
                closingHours: materialReadinessDocument.closingHour?.split(" ")[0],
                closingHoursPeriod: materialReadinessDocument.closingHour?.split(" ")[1],
                soldTo: materialReadinessDocument.soldTo,
                shipTo: materialReadinessDocument.shipTo,
                otherRelevantInformation: materialReadinessDocument.otherRelevantInformation,
                destination: materialReadinessDocument.destination,
                cityForCountry: materialReadinessDocument.city
            })
        }
    }, [materialReadinessDocument])

    return (
        <form onSubmit={handleUpdatePickupInformation}>
            <div className="form-view-container custom" style={{padding: "16px", backgroundColor: "white", margin:0, borderRadius: "6px"}}>
                <div className="layout">
                    <div className="label">Pickup Information</div>
                    
                    <div className="body d-grid-2"> 
                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Name of Contact Person</label>
                            <input required name="nameOfContactPerson" value={formData?.nameOfContactPerson} onChange={handleChange} />
                            
                        </div> 
                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Email Address</label>
                            <input type="email" required placeholder="example@gmail.com" name="emailAddress" value={formData?.emailAddress} onChange={handleChange} />
                            
                        </div>

                        <div className='form-item span-col-1'>                            
                            <div className="two-fields">
                                <div>
                                    <label><span className="errorX mr-2">*</span> Country of Supply</label>
                                    <select name="countryOfSupply" 
                                        value={formData?.countryOfSupply} 
                                        onChange={handleChange}
                                        title={`${!materialReadinessDocument?.canChangePickupAddress ? "The pickup address can be changed only upon request by the reviewing team." : null}`}
                                        disabled={!materialReadinessDocument?.canChangePickupAddress} 
                                        required>
                                            <option value="" disabled>Select...</option>
                                            {
                                                countries?.map((country: string, index: number) => {
                                                    return (
                                                        <option key={index} value={country}>{ country }</option>
                                                    )
                                                })
                                            }
                                        </select>
                                </div>
                                <div>
                                    <label><span className="errorX mr-2">*</span> City</label>
                                    <input required name="cityForCountry" value={formData?.cityForCountry} onChange={handleChange} />                            
                                </div>
                            </div>
                            
                        </div> 
                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Phone Number</label>
                            <div className="contact-container">
                                {/* <input name="countryCode" disabled value={CountryCodes.find(countrycode => countrycode.country === formData?.countryOfSupply)?.code} onChange={handleChange} /> */}
                                <select name="countryCode" value={formData?.countryCode} onChange={handleChange} >
                                    <option value="" disabled>--</option>
                                    {
                                        CountryCodes.map((item: { country: string; code: string; }, index: number) => {
                                            return <option key={index} value={item.code}>{item.code}</option>;
                                        })
                                    }
                                </select>
                                <input required name="phoneNumber" value={formData?.phoneNumber} onChange={handleChange} type="number" maxLength={17} placeholder="Enter number w/o country code" />
                            </div>
                            
                        </div> 
                        
                        <div className='form-item span-col-2'>
                            <label><span className="errorX mr-2">*</span> Pickup Address <span className="text-red">{materialReadinessDocument?.canChangePickupAddress ? "- Kindly update the pickup address. See chats for more details." : null}</span> </label>
                            <input required name="pickupAddress" 
                            disabled={!materialReadinessDocument?.canChangePickupAddress} 
                            value={formData?.pickupAddress} 
                            title={`${!materialReadinessDocument?.canChangePickupAddress ? "The pickup address can be changed only upon request by the reviewing team." : null}`}
                            onChange={handleChange} type="text" />
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Opening Hour</label>
                            <div className="time-selection">
                                <select name="openingHours" onChange={handleChange} value={formData.openingHours} >
                                    <option key="0" value="">--</option>
                                    {
                                        timeHours.map((hour: string, index: number) => {
                                            return <option key={index+1} value={hour}>{hour}</option>
                                        })
                                    }
                                </select>
                                <select name="openingHoursPeriod" value={formData.openingHoursPeriod} onChange={handleChange} >
                                    <option value="" disabled>--</option>                                    
                                    <option value={"AM"}>AM</option>
                                    <option value={"PM"}>PM</option>
                                </select>
                            </div>
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Closing Hour</label>
                            <div className="time-selection">
                                <select name="closingHours" onChange={handleChange} value={formData.closingHours} >
                                    <option key="0" value="">--</option>                                    
                                    {
                                        timeHours.map((hour: string, index: number) => {
                                            return <option key={index} value={hour}>{hour}</option>
                                        })
                                    }
                                </select>
                                <select name="closingHoursPeriod" value={formData.closingHoursPeriod} onChange={handleChange} >
                                    <option value="" disabled>--</option>
                                    <option value={"AM"}>AM</option>
                                    <option value={"PM"}>PM</option>
                                </select>
                            </div>
                            
                        </div>
                    </div>                                    
                </div>
            </div>

            <div className="form-view-container custom mt-1" style={{padding: "16px", backgroundColor: "white", margin:0, borderRadius: "6px"}}>
                <div className="layout">
                    <div className="label">Other Details</div>
                    
                    <div className="body d-grid-4"> 
                        <div className='form-item span-col-4'>
                            <label><span className="errorX mr-2">*</span> Sold To</label>
                            <select required name="soldTo" value={formData.soldTo} onChange={handleChange} >
                                <option value="" disabled>--Select--</option>
                                {
                                    totalEnergiesAddress.map((address: string, index: number) => {
                                        return (
                                            <option key={index} value={address}>{ address }</option>
                                        )
                                    })
                                }
                            </select>
                            
                        </div>
                        <div className='form-item span-col-4'>
                            <label><span className="errorX mr-2">*</span> Ship To</label>
                            <select required name="shipTo" value={formData.shipTo} onChange={handleChange} >
                                <option value="" disabled>--Select--</option>
                                {
                                    totalEnergiesAddress.map((address: string, index: number) => {
                                        return (
                                            <option key={index} value={address}>{ address }</option>
                                        )
                                    })
                                }
                            </select>                            
                        </div> 
                        <div className='form-item span-col-4 mt-2'>
                            <label><span className="errorX mr-2">*</span> Destination</label>
                            <select required name="destination" value={formData.destination} onChange={handleChange} disabled>
                                <option value="" disabled>--Select--</option>
                                {
                                    destinations.map((address: string, index: number) => {
                                        return (
                                            <option key={index} value={address}>{ address }</option>
                                        )
                                    })
                                }
                            </select>                            
                        </div> 
                        <div className='form-item span-col-4 mt-2'>
                            <label>Other Relevant Information</label>
                            <input name="otherRelevantInformation" value={formData.otherRelevantInformation} onChange={handleChange}/>                            
                        </div>
                    </div>                                    
                </div>
            </div>   

            <div className="main-inner mt-1" style={{padding: "16px", boxSizing: "border-box", minHeight: "calc(100vh - 600px)"}}>
                {/* {isPickupInformationSaved && !!packages?.length && <div className="alert alert-warning" style={{marginBottom: "16px", padding: "8px", marginTop: 0, width: "auto"}}>
                <span className="material-symbols-outlined mr-2" style={{color: "#be6f02"}}>warning</span>
                <p style={{margin: 0}}>You must delete all newly created packages before you can clear this form.</p></div>   } */}
                
                <div className="d-flex-center gap-2 mt-2">                    
                    <button type="button" className="custom-button grey-outline">Cancel</button>              
                    <button type="submit" className="custom-button orange">
                        Update
                    </button>
                </div>
            </div>
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
            <ToastContainer /> 
        </form>
    )
}

export default UpdateBasicInformation