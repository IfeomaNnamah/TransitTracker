import { FormEvent, useEffect, useState } from "react"
import CountryCodes from "../../../CountryCodes.json"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { customStyles, destinations, totalEnergiesAddress } from "helpers";
import Modal from 'react-modal'
import loading from "../../../../assets/images/loading.gif"
import { makeDeleteRequest, makePostRequest } from "request";

const BasicInformation = (props: any) => {
    const { countries, setActiveTab, packages, basicInformation, getMaterialReadinessDocumentBasicInfoBySupplier, setBasicInformation } = props
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const [isPickupInformationSaved, setIsPickupInformationSaved] = useState(false)
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
        destination: ""
    })

    const clearForm = () => {
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "ClearMaterialReadinessDocumentBasicInfo",
            id: basicInformation?.id
        }

        makeDeleteRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                toast.success(response.msg)
                setIsPickupInformationSaved(false)
                setFormData({
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
                    destination: ""
                })
                setBasicInformation({})
            }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }

    const handleChange = (e: any) => {
        const {name, value} = e.target
        // console.log(name, value)
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

    const handleSavingPickupInformation = (event: FormEvent) => {
        event.preventDefault()
        const data = {
            countryOfSupply: formData?.countryOfSupply,
            soldTo: formData?.soldTo,
            shipTo: formData?.shipTo,
            destination: formData?.destination, // remove this later - system separation
            supplierId: user?.id,
            pickUpAddress: formData?.pickupAddress,
            nameOfContactPerson: formData?.nameOfContactPerson,
            emailOfContactPerson: formData?.emailAddress,
            phoneNumberOfContactPerson: `(${formData?.countryCode})${formData?.phoneNumber}`,
            openingHour: `${formData?.openingHours} ${formData?.openingHoursPeriod}`,
            closingHour: `${formData?.closingHours} ${formData?.closingHoursPeriod}`,
            otherRelevantInformation: formData?.otherRelevantInformation
        } 
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "CreateMaterialReadinessDocumentWithBasicInformation",
            data: data
        }
        makePostRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                setActiveTab("2")
                toast.success(response.msg)
                getMaterialReadinessDocumentBasicInfoBySupplier()
            }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }
    
    useEffect(() => {
        if(!!Object.values(basicInformation).length) {
            setFormData({
                nameOfContactPerson: basicInformation?.nameOfContactPerson,
                emailAddress: basicInformation?.emailOfContactPerson,
                countryCode: basicInformation?.phoneNumberOfContactPerson?.split("(")[1].split(")")[0],
                phoneNumber: basicInformation?.phoneNumberOfContactPerson?.split(")")[1],
                countryOfSupply: basicInformation?.countryOfSupply,
                pickupAddress: basicInformation?.pickUpAddress,
                openingHours: basicInformation?.openingHour?.split(" ")[0],
                openingHoursPeriod: basicInformation?.openingHour?.split(" ")[1],
                closingHours: basicInformation?.closingHour?.split(" ")[0],
                closingHoursPeriod: basicInformation?.closingHour?.split(" ")[1],
                soldTo: basicInformation?.soldTo,
                shipTo: basicInformation?.shipTo,
                otherRelevantInformation: basicInformation?.otherRelevantInformation,
                destination: basicInformation?.destination
            })
            setIsPickupInformationSaved(true)
        } //eslint-disable-next-line
    }, [basicInformation])

    return (
        <form onSubmit={handleSavingPickupInformation}>
            <div className="form-view-container custom" style={{padding: "16px", backgroundColor: "white", margin:0, borderRadius: "6px"}}>
                <div className="layout">
                    <div className="label">Pickup Information</div>
                    
                    <div className="body d-grid-2"> 
                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Name of Contact Person</label>
                            <input required disabled={isPickupInformationSaved} name="nameOfContactPerson" value={formData?.nameOfContactPerson} onChange={handleChange} />
                            
                        </div> 
                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Email Address</label>
                            <input type="email" required disabled={isPickupInformationSaved}  placeholder="example@gmail.com" name="emailAddress" value={formData?.emailAddress} onChange={handleChange} />
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Country of Supply</label>
                            <select name="countryOfSupply" value={formData?.countryOfSupply} disabled={isPickupInformationSaved} onChange={handleChange} required>
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
                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Phone Number</label>
                            <div className="contact-container">
                                {/* <input name="countryCode" disabled value={CountryCodes.find(countrycode => countrycode.country === formData?.countryOfSupply)?.code} onChange={handleChange} /> */}
                                <select name="countryCode" value={formData?.countryCode} onChange={handleChange} disabled={isPickupInformationSaved} >
                                    <option value="" disabled>--</option>
                                    {
                                        CountryCodes.map((item: { country: string; code: string; }, index: number) => {
                                            return <option key={index} value={item.code}>{item.code}</option>;
                                        })
                                    }
                                </select>
                                <input required name="phoneNumber" disabled={isPickupInformationSaved} value={formData?.phoneNumber} onChange={handleChange} type="number" maxLength={17} placeholder="Enter number w/o country code" />
                            </div>
                            
                        </div> 
                        
                        <div className='form-item span-col-2'>
                            <label><span className="errorX mr-2">*</span> Pickup Address</label>
                            <input required name="pickupAddress" disabled={isPickupInformationSaved} value={formData?.pickupAddress} onChange={handleChange} type="text" />
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Opening Hour</label>
                            <div className="time-selection">
                                <select name="openingHours" onChange={handleChange} value={formData.openingHours} disabled={isPickupInformationSaved} >
                                    <option key="0" value="">--</option>
                                    {
                                        timeHours.map((hour: string, index: number) => {
                                            return <option key={index+1} value={hour}>{hour}</option>
                                        })
                                    }
                                </select>
                                <select name="openingHoursPeriod" value={formData.openingHoursPeriod} onChange={handleChange} disabled={isPickupInformationSaved} >
                                    <option value="" disabled>--</option>                                    
                                    <option value={"AM"}>AM</option>
                                    <option value={"PM"}>PM</option>
                                </select>
                            </div>
                            
                        </div>

                        <div className='form-item span-col-1'>
                            <label><span className="errorX mr-2">*</span> Closing Hour</label>
                            <div className="time-selection">
                                <select name="closingHours" onChange={handleChange} value={formData.closingHours} disabled={isPickupInformationSaved} >
                                    <option key="0" value="">--</option>                                    
                                    {
                                        timeHours.map((hour: string, index: number) => {
                                            return <option key={index} value={hour}>{hour}</option>
                                        })
                                    }
                                </select>
                                <select name="closingHoursPeriod" value={formData.closingHoursPeriod} onChange={handleChange} disabled={isPickupInformationSaved} >
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
                        <div className='form-item span-col-2'>
                            <label><span className="errorX mr-2">*</span> Sold To</label>
                            <select required name="soldTo" value={formData.soldTo} onChange={handleChange} disabled={isPickupInformationSaved} >
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
                        <div className='form-item span-col-2 mt-2'>
                            <label><span className="errorX mr-2">*</span> Ship To</label>
                            <select required name="shipTo" value={formData.shipTo} onChange={handleChange} disabled={isPickupInformationSaved} >
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
                        <div className='form-item span-col-2 mt-2'>
                            <label><span className="errorX mr-2">*</span> Destination</label>
                            <select required name="destination" value={formData.destination} onChange={handleChange} disabled={isPickupInformationSaved} >
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
                        <div className='form-item span-col-2 mt-2'>
                            <label>Other Relevant Information</label>
                            <input name="otherRelevantInformation" value={formData.otherRelevantInformation} onChange={handleChange} disabled={isPickupInformationSaved} />                            
                        </div>
                    </div>                                    
                </div>
            </div>   

            <div className="main-inner mt-1" style={{padding: "16px", boxSizing: "border-box", minHeight: "calc(100vh - 600px)"}}>
                {isPickupInformationSaved && !!packages?.length && <div className="alert alert-warning" style={{marginBottom: "16px", padding: "8px", marginTop: 0, width: "auto"}}>
                <span className="material-symbols-outlined mr-2" style={{color: "#be6f02"}}>warning</span>
                <p style={{margin: 0}}>You must delete all newly created packages before you can clear this form.</p></div>   }
                
                <div className="d-flex-center gap-2 mt-2">                    
                    <button type="button" className="custom-button grey-outline" 
                        // The supplier cannot clear the form if he has already started creating packages
                        disabled={!!packages?.length}
                        onClick={() => clearForm()}>Clear Form</button>              
                    <button type="submit" className="custom-button orange" 
                        disabled={isPickupInformationSaved}>
                        Save
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

export default BasicInformation