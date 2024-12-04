import { useEffect,useState } from "react";

const PickupInformation = (props: any) => {
    const { materialReadinessDocument } = props
    const [formData, setFormData] = useState<Record <string, any>>({})

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
            city: materialReadinessDocument?.city,
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
                            <label>Pickup Address</label>
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
        </div>
    )
}

export default PickupInformation