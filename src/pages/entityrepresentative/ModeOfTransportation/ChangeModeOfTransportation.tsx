import { FormEvent, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import loading from "../../../assets/images/loading.gif"
import { makeGetRequest, makePostRequest } from "../../../request";
import { useSelector } from "react-redux";
import { customStyles, GUID } from "../../../helpers";
import Layout from "../../Layout";
import Autocomplete from "@mui/material/Autocomplete";
import { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import Modal from "react-modal"
const filterOptions = createFilterOptions({ limit: 100 });

const ChangeModeOfTransportation =  () => {

    // VARIABLE DEFINITION
    const navigate = useNavigate()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    // const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [openUploadModal, setOpenUploadModal] = useState(false)
    interface FileObject {
        id: string;
        type: string;
        file: string;
    }
    const [selectedFiles, setSelectedFiles] = useState<FileObject[]>([]);
    const [files, setFiles] = useState([{
        id: GUID(4),
        type: "",
        name:"",
        file: ""
    }])

    const addFile = () => {
        setFiles([...files, ({
            id: GUID(4),
            type: "",
            name:"",
            file: ""
        })])
    }

    const removeFile = (id: string) => {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    };

    const removeSelectedFile = (id: string) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    };

    const handleChange = (event: any, id: string) => {        
        const { name, value } = event.target //get data form each input on change
        setFiles(prevFiles => prevFiles.map(file => 
            file.id === id ? { ...file, [name]: value } : file
        ));  
    }

    const handleFileChange = (event: any, id: string) => {
        const {name, files} = event.target
        let selectedFile = files[0]

        let file = selectedFile.name.split(".");
        const fileFormat = file ? file[file.length - 1] : ''
        if (fileFormat === "zip" 
            || fileFormat === "pdf") {
            setFiles(prevFiles => prevFiles.map(file => 
                file.id === id ? { ...file, [name]: selectedFile, name: selectedFile.name } : file
            ));
        }
        else {
            if(fileFormat) toast.error("Attempted to upload an invalid file format. Please re-upload the correct file formats.")
            const element = event.target as HTMLInputElement
            element.value = ""
        }               
    }

    const clearFiles =  () => {
        setFiles([{
            id: GUID(4),
            type: "",
            name:"",
            file: ""
        }])
    }
    const handleSelectedFiles = (event: FormEvent) => {
        event.preventDefault()
        setSelectedFiles([...selectedFiles, ...files]); 
        setOpenUploadModal(false);
        clearFiles()
    }
    const [formData, setFormData] = useState<Record <string, any>>(
        {
            freightForwarderId: "",
            nameOfRequester: "",
            department: "",
            division: "",         
            justification: "",            
            igg: "",            
            userId: "",
            requesterManagerName: "", // Manager Name
            requesterManagerEmail: "", // Manager Email
            requesterGeneralManagerName: "", // GM Name
            requesterGeneralManagerEmail: "", // GM Email             
        }          
    )
    const [purchaseOrders, setPurchaseOrders] = useState<Record <string, any>[]>([{
        id: GUID(8),
        purchaseOrderNumber: "",  
        purchaseOrderId: "",
        purchaseRequisitionNumber: "",
        purchaseRequestDate: "",
        purchaseOrderSupplyItemIds: [],
        purchaseOrderItems: [],
        freightForwarderId: "",
        error: "",
    }])
    const [errorData, setErrorData] = useState<Record <string, any>>([])

    const addPurchaseOrderRow = () => {
        setPurchaseOrders([...purchaseOrders, ({
            id: GUID(8),
            purchaseOrderNumber: "",  
            purchaseOrderId: "",
            purchaseRequisitionNumber: "",
            purchaseRequestDate: "",
            purchaseOrderSupplyItemIds: [],
            purchaseOrderItems: [],
            freightForwarderId: "",
            error: "",
        })])
    }

    const removePurchaseOrderRow = (id: string) => {
        setPurchaseOrders(prevFiles => prevFiles.filter(row => row.id !== id));
    };

    // To update formData freightForwaderId and purchaseOrderSupplyItemIds keys
    useEffect(() => {  
        const purchaseOrderWithItems = purchaseOrders?.filter((data: any) => data.purchaseOrderItems?.length > 0)      
        if(purchaseOrderWithItems) {
            setPurchaseOrders(prevItems => {
                return prevItems?.map((purchaseOrder: any) => {
                    // Check if the current purchaseOrder is the one being updated
                    if (purchaseOrder?.purchaseOrderItems?.length > 0) {
                        const checkedItems = purchaseOrder?.purchaseOrderItems?.filter((item: any) => item.isChecked)// Add only the selected items
                        
                        const freightForwarderIds = checkedItems?.map((item: any) => item.freightForwarderId)
                        const itemSuppliedIds = checkedItems?.map((item: any) => item.itemSuppliedId)// Update purchaseOrderItemsIds.                                                  

                        return { ...purchaseOrder, 
                            purchaseOrderSupplyItemIds: [...itemSuppliedIds], freightForwarderId:  freightForwarderIds}
                    }
                    return purchaseOrder;
                });
            });
        }
    }, [purchaseOrders])
    const handlePurchaseOrderInput = (e:React.ChangeEvent<HTMLInputElement>, id: string) => {
        const { value, name } = e.target;
    
        setPurchaseOrders(prevItems => {
            return prevItems?.map((purchaseOrder: any) => {
                // If the purchase order obj ID matches the selected id and set the value
                if (purchaseOrder.id === id) {
                    return { ...purchaseOrder, [name]: value };
                }
                // If it's not the selected id, keep the object unchanged
                return purchaseOrder;
            });
        });
    };

    // Handles clearing the purchase order items when the user attempt to update the purchase order number searched for
    useEffect(() => { 
        purchaseOrders.forEach((purchaseOrder: any) => {
            if(purchaseOrder.purchaseOrderNumber.length < 10 && purchaseOrder.purchaseOrderItems.length > 0) {
                setPurchaseOrders((prevOrders) =>
                    prevOrders.map((order) => {
                      if (order.id === purchaseOrder.id) {
                        // Return a new object with updated fields if id matches
                        return {
                          ...order,
                          purchaseOrderItems: [],
                          purchaseOrderId: "",
                        };
                      }
                      // Return the original object if id does not match
                      return order;
                    })
                );
            }
        })
    }, [purchaseOrders])

    //Update the checked value for each purchase order item per purchase order
    const handleCheckForPurchaseOrderSuppliesItems = (e:React.ChangeEvent<HTMLInputElement>, id: string) => {
        const { value, checked } = e.target;
        setPurchaseOrders(prevItems => {
            return prevItems?.map((purchaseOrder: any) => {
                // Check if the current purchaseOrder is the one being updated
                if (purchaseOrder.id === id) {
                    // Update purchaseOrderItems with isChecked values
                    const updatedPurchaseOrderItems = purchaseOrder.purchaseOrderItems?.map((item: any) => {
                        // If the item ID matches the value, update isChecked
                        if (item.itemSuppliedId === value) {
                            return { ...item, isChecked: checked };
                        }
                        return item;
                    });
        
                    return { ...purchaseOrder, purchaseOrderItems: updatedPurchaseOrderItems };
                }
                return purchaseOrder;
            });
        });
    }; 
    
    // const handleCheckForPurchaseOrderRequestItems = (e:React.ChangeEvent<HTMLInputElement>, id: string) => {
    //     const { value, checked } = e.target;
    //     setPurchaseOrders(prevItems => {
    //         return prevItems?.map((purchaseOrder: any) => {
    //             // Check if the current purchaseOrder is the one being updated
    //             if (purchaseOrder.id === id) {
    //                 // Update purchaseOrderItems with isChecked values
    //                 const updatedPurchaseOrderItems = purchaseOrder.purchaseOrderItems?.map((item: any) => {
    //                     // If the item ID matches the value, update isChecked
    //                     if (item.id === value) {
    //                         return { ...item, isChecked: checked };
    //                     }
    //                     return item;
    //                 });
        
    //                 return { ...purchaseOrder, purchaseOrderItems: updatedPurchaseOrderItems };
    //             }
    //             return purchaseOrder;
    //         });
    //     });
    // }; 

    const [usersList, setUsersList] = useState([])
    const getAllTotalEnergiesUsers = () => {        
        var request: Record<string, any> = {
            what: "getAllTotalEnergiesUsers",
            params: {}
        };

        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                const formattedRecords = res.map((record: any) => {
                    return {label: `${record.firstName} ${record.lastName} - ${record.email}`, value: record.email, name: `${record.firstName} ${record.lastName}`}
                })
                
                setUsersList(formattedRecords)
            })
            .catch((error:any) => 
                {toast.error(error);}
            );
    }

    const [selectedTab, setSelectedTab] = useState("")
    useEffect(() => {
        if(accessToken) getAllTotalEnergiesUsers()
        if(purchaseOrders) setSelectedTab(purchaseOrders[0]?.id)
        // eslint-disable-next-line
    }, [accessToken, user])

    useEffect(() => {
        if(user && formData.nameOfRequester === "") {
            setFormData(prevFormData => ({...prevFormData, nameOfRequester: `${user?.firstName} ${user?.lastName}`, department: user?.department.split(';')[0], igg: user?.department.split(';')[1], userId: user?.id}))
        }// eslint-disable-next-line
    }, [formData, user])

   
    const getPurchaseOrder = (purchaseOrderNumber: string, purchaseOrdersId: string) => {
        if(purchaseOrders.find((purchaseOrder: any) => (purchaseOrder.purchaseOrderNumber === purchaseOrderNumber) && (purchaseOrder.purchaseOrderItems.length > 0))?.purchaseOrderId) {
            toast.error("Purchase order already exists!")
            return
        }

        setIsSearching(true);
        // setSelectedFreightForwarder("")
        var request: Record<string, any> = {
            what: "getPurchaseOrder",
            id: purchaseOrderNumber
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsSearching(false)
                const res = response.data
                if(res.data){           
                    setPurchaseOrders(prevItems => {
                        return prevItems?.map((purchaseOrder: any) => {
                            // If the purchase order obj ID matches the selected id and set the value
                            if (purchaseOrder.id === purchaseOrdersId) {
                                return { ...purchaseOrder, purchaseOrderId: res.data.id };
                            }
                            // If it's not the selected id, keep the object unchanged
                            return purchaseOrder;
                        });
                    });
                    const items = res.data.purchaseOrderItems
                                    //filter out items with purchaseOrderItemSupplies
                                    .filter((res: any) => res.purchaseOrderItemSupplies.length > 0)                                      
                                    // .map((item: any) => ({
                                    //     id: item.id,
                                    //     purchaseOrderItemNumber: item.purchaseOrderItemNumber,
                                    //     purchaseOrderItemSupplies: item.purchaseOrderItemSupplies,
                                    //     materialDescription: item.materialDescription,
                                    //     materialNumber: item.materialNumber,
                                    //     manufacturer: item.manufacturer,
                                    //     quantity: item.quantity,
                                    //     isChecked: false
                                    // }))
                                    // // get all itemSupplies that has not been shipped
                                    // .filter((item:any) => 
                                    //     item.status !== "SHIPPED"
                                    // || item.status !== "ARRIVED_IN_COUNTRY"
                                    // || item.status !== "CUSTOM_CLEARANCE"
                                    // || item.status !== "CLEARED_AT_CUSTOM"
                                    // || item.status !== "DELIVERED_AT_BASE")
                                    // .sort((a:any, b:any) => a.purchaseOrderItemNumber - b.purchaseOrderItemNumber)
                                    
                    
                    const formattedItems = items.flatMap((item: any) =>
                        item.purchaseOrderItemSupplies.map((supply: any) => ({
                            ...item,
                            quantity: supply.quantity, // Retrieving the supplied quantity not the requested quantity
                            status: supply.status,
                            itemSuppliedId: supply.id,
                            freightForwarderId: supply.freightForwarderId,
                            freightForwarder: supply.freightForwarder,
                            modeOfTransportationId: supply.modeOfTransportationId,
                            modeOfTransportationPurchaseOrderId: supply.modeOfTransportationPurchaseOrderId,
                            isChecked: false
                        }))
                    )
                    // get all itemSupplies that has not been shipped
                    .filter((item:any) => 
                        item.status === "PICKED")
                    .sort((a:any, b:any) => a.purchaseOrderItemNumber - b.purchaseOrderItemNumber)                    

                    setPurchaseOrders(prevItems => {
                        return prevItems?.map((purchaseOrder: any) => {
                            // If the purchase order obj ID matches the selected id and set the value
                            if (purchaseOrder.id === purchaseOrdersId) {
                                return { ...purchaseOrder, purchaseOrderItems: formattedItems };
                            }
                            // If it's not the selected id, keep the object unchanged
                            return purchaseOrder;
                        });
                    });              

                    toast.success(res.message)
                }else toast.error("No records was found with this purchase order number :"+ purchaseOrderNumber)
            })
            .catch((error:any) => {
                toast.error(error.msg); setIsSearching(false)
            });
    }

    const [isSubmitting, setIsSubmitting] = useState(false)    
    const HandleChangeModeOfTransportation = (event: FormEvent) => {    
        event.preventDefault()    
        // purchase orders form validation 
        const formattedForValidation = purchaseOrders.map((purchaseOrder: any) => ({
            purchaseOrderId: purchaseOrder.purchaseOrderId,
            purchaseRequisitionNumber: purchaseOrder.purchaseRequisitionNumber,
            purchaseRequestDate: purchaseOrder.purchaseRequestDate,
            purchaseOrderSupplyItemIds: purchaseOrder.purchaseOrderSupplyItemIds,
            error: purchaseOrder.error,
        }))
        formattedForValidation.forEach((purchaseOrder: any, index: number) => {
            // update the error key with error message
            if (purchaseOrder.purchaseOrderSupplyItemIds.length === 0) {
                purchaseOrders[index]["error"] = "Kindly select at least one item for this purchase order.";
            }else if (Object.entries(purchaseOrder).every(([key, value]) => {
                if (key !== "error" && key !== "purchaseOrderSupplyItemIds") {
                  return Boolean(value) // Convert value to a boolean
                }
                return true // If key is "error" or "purchaseOrderSupplyItemIds", return true
            })) {            
              purchaseOrders[index]["error"] = "";
            } else {
                purchaseOrders[index]["error"] = "This form is missing some mandatory fields";
            }
        });  

        const data = formData        
        data.purchaseOrders = purchaseOrders.map((purchaseOrder: any) => ({
            purchaseOrderId: purchaseOrder.purchaseOrderId,
            purchaseRequisitionNumber: purchaseOrder.purchaseRequisitionNumber,
            purchaseRequestDate: purchaseOrder.purchaseRequestDate,
            purchaseOrderSupplyItemIds: purchaseOrder.purchaseOrderSupplyItemIds,
        }))

        // if the purchase orders formData is not valid return
        const hasInvalidData = purchaseOrders.some((purchaseOrder: any) =>
            !purchaseOrder.purchaseOrderId ||
            !purchaseOrder.purchaseRequisitionNumber ||
            !purchaseOrder.purchaseRequestDate ||
            !purchaseOrder.purchaseOrderSupplyItemIds.length
        );
        
        if (hasInvalidData) return; // Exit the function
        
        // const distinctfreightForwarder = purchaseOrders.filter((data: any, index: number, self: any[]) =>
        //     index === self.findIndex((comparedFreightForwarderId) => (
        //         comparedFreightForwarderId === data.freightForwarderId
        //     ))
        // ).join(", ")  
        data.freightForwarderId = purchaseOrders[0]?.freightForwarderId[0]// Temporary fix for multiple freight forwarders
        
        if(Object.values(data).every(value => value)){
            setIsSubmitting(true)
            var request: Record<string, any> = {
                what: "ChangeModeOfTransportation",
                data: data
            };

            makePostRequest(request)
                .then((response: any) => {
                    setIsSubmitting(false)
                    toast.success(response.msg)

                    setTimeout(() => {
                        navigate("/entityrepresentative/modeoftransportationchange")
                    }, 1000);                    
                })
                .catch((error:any) => {setIsSubmitting(false); toast.error(error.msg)});
        }else {toast.warning("Kindly ensure all required fields are provided."); setIsSubmitting(false)}
    }    

    const handleInputChange = (e: any) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value})
    }

    const page = "Mode Of Transportation Change"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main mt-2">
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <Link to={"/entityrepresentative/modeoftransportationchange"} className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Mode of Transportation</p>
                            </Link>  
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">rule_settings</span>
                                    <p>Change Mode Of Transportation</p>
                                </div>
                            </div>                      
                        </div>                        
                    </div>

                    <form onSubmit={HandleChangeModeOfTransportation}>

{/* Requester Details */}
                    <div className="main-inner mt-1">   
                        <div className="summary-title">
                            Requester's Details
                        </div>                      
                        <div className="form-view-container for-mot">
                            <div className='d-grid-3'>        
                                <div className='form-item span-col-1'>
                                    <label><span className="errorX mr-2">*</span>IGG</label>
                                    <input name="igg" value={user?.department.split(';')[1]} disabled />
                                    <p className="error"></p>
                                </div>                         
                                <div className='form-item span-col-1'>
                                    <label><span className="errorX mr-2">*</span>Division</label>
                                    <input disabled name="department" value={user?.department.split(';')[0]} />
                                    <p className="error"></p>
                                </div>
                                <div className='form-item span-col-1'>
                                    <label><span className="errorX mr-2">*</span>Department</label>
                                    <select name="division" value={formData.division} onChange={handleInputChange} required>
                                        <option value="" disabled >Select...</option>
                                        <option value="Medicals" >Medicals</option>
                                        <option value="Drilling" >Drilling</option>
                                        <option value="Field Operations" >Field Operations</option>
                                    </select>
                                    <p className="error"></p>
                                </div>
                                <div className='form-item span-col-2'>
                                    <label><span className="errorX mr-2">*</span>Requester's Manager Email</label>
                                    <Autocomplete             
                                        // name="requesterManagerEmail"                                          
                                        filterOptions={filterOptions}                            
                                        disableClearable={true}
                                        onChange={(e, option:any) => setFormData({...formData, 'requesterManagerEmail': option.value, 'requesterManagerName': option.name})}
                                        isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                                        options={usersList}                            
                                        className='mt-1'                            
                                        renderInput={(params) => 
                                            <TextField placeholder='Select...' variant='outlined' {...params} />} />
                                    <p className="error"></p>
                                </div>  
                                <div className='form-item span-col-1'>
                                    <label>Requester's Manager Name</label>
                                    <input value={formData?.requesterManagerName} disabled />
                                    <p className="error">{ errorData?.requesterGeneralManagerName }</p>
                                </div>
                                <div className='form-item span-col-2'>
                                    <label><span className="errorX mr-2">*</span>Requester's GM/EGM Email</label>
                                    <Autocomplete             
                                        // name="requesterGeneralManagerEmail"                                          
                                        filterOptions={filterOptions}                            
                                        disableClearable={true}
                                        onChange={(e, option:any) => setFormData({...formData, 'requesterGeneralManagerEmail': option.value, 'requesterGeneralManagerName': option.name})}
                                        isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                                        options={usersList}                            
                                        className='mt-1'                            
                                        renderInput={(params) => 
                                            <TextField placeholder='Select...' variant='outlined' {...params} />} />
                                    <p className="error"></p>
                                </div>  
                                <div className='form-item span-col-1'>
                                    <label>Requester's GM/EGM Name</label>
                                    <input value={formData?.requesterGeneralManagerName} disabled />
                                    <p className="error">{ errorData?.requesterGeneralManagerName }</p>
                                </div>                           
                            </div> 
                        </div>
                    </div>

{/* Request Info */}
                    <div className="main-inner mt-1" style={{paddingBottom: "4px"}}>   
                        <div className="summary-title">
                            Request Information
                        </div>                      
                        {
                            purchaseOrders?.map((purchaseOrder: any, index: number) => {
                                return (
                                    <div style={{margin: "16px", border:"1px solid #d9d9d9", borderRadius: "6px"}} key={index}>
                                        <div className="d-flex" style={{fontSize: "12px", backgroundColor: "#f4f7fc", padding: "12px", borderRadius: "6px 6px 0 0"}}>
                                            <div className="d-flex-2" style={{cursor: "pointer"}} onClick={() => setSelectedTab(prevTab => (prevTab === purchaseOrder?.id ? "" : purchaseOrder?.id))} >
                                                <span className="material-symbols-rounded">{selectedTab === purchaseOrder?.id ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
                                                <span className="fw-500">{index+1}. Purchase Order {purchaseOrder?.purchaseOrderItems.length > 0 ? purchaseOrder?.purchaseOrderNumber : null}</span>
                                            </div>
                                            {purchaseOrder?.error &&<div className="text-red d-flex-2 gap-2">
                                                <span className="material-symbols-rounded f-16">error</span>
                                                <span>{purchaseOrder?.error}</span>
                                            </div>}
                                        </div>
                                        {selectedTab === purchaseOrder?.id && <div className="form-view-container for-mot">
                                            <div className='d-grid-3'>        
                                                <div className='form-item span-col-1'>
                                                    <label><span className="errorX mr-2">*</span>Purchase Order Number</label>
                                                    <div style={{gap: "8px", display: "flex"}}>
                                                        <input name="purchaseOrderNumber" id={purchaseOrder.id} type='text' required style={{width:"100%"}}
                                                            placeholder="Must be 10-digits"
                                                            maxLength={10}
                                                            value={purchaseOrder.purchaseOrderNumber}
                                                            onChange={(event) => handlePurchaseOrderInput(event, purchaseOrder.id)}
                                                            // onKeyUp={() => {purchaseOrderNumber?.length < 1 ? setErrorData({ ...errorData, purchaseOrderNumber: 'This field is required' }) : 
                                                            // setErrorData({ ...errorData, purchaseOrderNumber: '' })}}
                                                            />
                                                        <button 
                                                            disabled={isSearching} 
                                                            type="button"
                                                            className="custom-button orange mt-1" 
                                                            onClick={() => ((document.getElementById(purchaseOrder.id) as HTMLInputElement)?.value)?.length !== 10 ? toast.warning("Purchase Order Number must be 10-digits")
                                                                : getPurchaseOrder(((document.getElementById(purchaseOrder.id) as HTMLInputElement)?.value), purchaseOrder.id)}>{isSearching ? "Searching..." : "Search"}</button>
                                                    </div>
                                                    <p className="error"></p>
                                                </div>    
                                                <div className='form-item span-col-1'>
                                                    <label><span className="errorX mr-2">*</span>Purchase Requisition Number</label>
                                                    <input name="purchaseRequisitionNumber" value={purchaseOrder.purchaseRequisitionNumber} onChange={(event) => handlePurchaseOrderInput(event, purchaseOrder.id)} type='number' required
                                                        // onKeyUp={() => {formData.purchaseRequisitionNumber.length < 1 ? setErrorData({ ...errorData, purchaseRequisitionNumber: 'This field is required' }) : 
                                                        // setErrorData({ ...errorData, purchaseRequisitionNumber: '' })}} 
                                                        />
                                                    <p className="error"></p>
                                                </div> 
                                                <div className='form-item span-col-1'>
                                                    <label><span className="errorX mr-2">*</span>Purchase Request Date</label>
                                                    <input name="purchaseRequestDate" value={purchaseOrder.purchaseRequestDate} onChange={(event) => handlePurchaseOrderInput(event, purchaseOrder.id)} type='date' required
                                                        // onKeyUp={() => {formData.purchaseRequestDate.length < 1 ? setErrorData({ ...errorData, purchaseRequestDate: 'This field is required' }) : 
                                                        // setErrorData({ ...errorData, purchaseRequestDate: '' })}} 
                                                        />
                                                    <p className="error"></p>
                                                </div> 
                                            </div> 
                                        </div>}
                                        {selectedTab === purchaseOrder?.id && <div className='table-container custom' style={{minHeight: "300px", maxHeight: "440px", borderTop: "1px solid #d9d9d9", borderRadius: "0"}}>
                                            <table>
                                                <thead style={{position:"sticky", top:0 }}>
                                                    <tr className="no-textwrap">
                                                        <th className="no-border" style={{width: "5%"}}></th>
                                                        <th className="no-border" style={{width: "23.75%"}}>PO Item No</th>
                                                        <th className="no-border" style={{width: "23.75%"}}>Material Number</th>
                                                        <th className="no-border" style={{width: "23.75%"}}>Material Description</th>
                                                        <th className="no-border" style={{width: "23.75%"}}>Quantity</th>
                                                        {/* <th className="no-border">Manufacturer</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {           purchaseOrders?.find(data => data.id === purchaseOrder.id)?.purchaseOrderItems?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                                                : purchaseOrders?.find(data => data.id === purchaseOrder.id)?.purchaseOrderItems?.map((data: any, i: number) => {
                                                                    return (
                                                                        <>
                                                                        <tr 
                                                                            className={data?.modeOfTransportationPurchaseOrderId ? "disabled" : ""}
                                                                            // style={{backgroundColor: "#d5e1ec"}}
                                                                            title={data?.modeOfTransportationPurchaseOrderId ? "Change of Mode of Transportation Request has already been raised for this record." : ""}
                                                                        >
                                                                            <td>
                                                                                <input type="checkbox" 
                                                                                // value={data.id} 
                                                                                value={data.itemSuppliedId} 
                                                                                onChange={(event) => handleCheckForPurchaseOrderSuppliesItems(event, purchaseOrder.id)} 
                                                                                checked={data?.isChecked}
                                                                                disabled={!!data?.modeOfTransportationPurchaseOrderId}/>
                                                                            </td>
                                                                            <td>Item { data.purchaseOrderItemNumber }</td>
                                                                            <td>{ data.materialNumber }</td>
                                                                            <td>{ data.materialDescription }</td>
                                                                            <td>{ data.quantity }</td>
                                                                            {/* <td className="no-textwrap ">{ data.manufacturer }</td> */}
                                                                        </tr>
                                                                        {/* {data?.purchaseOrderItemSupplies.length > 0 && <tr>
                                                                            <td className="no-border"></td>
                                                                            <td className="no-border fw-600">MRD Number</td>
                                                                            <td className="no-border fw-600">MRD Issuance Date</td>
                                                                            <td className="no-border fw-600">Item Status</td>
                                                                            <td className="no-border fw-600">Supplied Quantity</td>
                                                                        </tr>}
                                                                        {data?.purchaseOrderItemSupplies.map((item: any, i: number) => (
                                                                            <tr key={i}>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td>{item?.status.replaceAll("_", " ")}</td>
                                                                                <td>{item?.quantity}</td>
                                                                            </tr>
                                                                        ))} */}
                                                                        </>
                                                                    )
                                                                })
                                                        }
                                                </tbody>
                                            </table>
                                            {/* {isLoading ? <div className="loader">
                                                        <img src={loading} alt="loading" />
                                                        <p>Loading data...</p>
                                                    </div> : null} */}
                                        </div>}
                                        {index !== 0 && selectedTab === purchaseOrder?.id && <div className="d-flex-center" style={{padding: "12px 8px", borderTop: "1px solid #d9d9d9"}}>                                
                                            <button className="actions text-red" type="button" onClick={() => removePurchaseOrderRow(purchaseOrder.id)}>
                                                <span className="material-symbols-outlined f-16" >close</span>
                                                <span>Remove</span>
                                            </button>
                                        </div>}
                                    </div>
                                )
                            }) 
                        }

                        {/* Add Purchase Order  */}
                        <div className="d-flex-center" style={{padding: "12px 8px", borderTop: "1px solid #d9d9d9"}}>
                            <button className="actions blue-text" type="button" onClick={() => addPurchaseOrderRow()}>
                                <span className="material-symbols-outlined f-16">add</span>
                                <span>Add Purchase Order</span>
                            </button>
                        </div>
                    </div>

{/* MOT Ananlysis */}
                    <div className="main-inner mt-1">   
                        <div className="summary-title">
                            Mode of Transportation Analysis
                        </div>                      
                        <div className="form-view-container for-mot">
                            <div className='d-grid-3'>                                      
                                {/* <div className='form-item span-col-1'>
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

                                <div className='form-item span-col-1'  style={{height: "fit-content"}}>
                                    <label><span className="errorX mr-2">*</span>Frieght Cost Currency</label>
                                    <select name="freightCostCurrency" value={formData.freightCostCurrency} onChange={handleInputChange} required>
                                        <option value="" disabled >Select...</option>
                                        <option value="USD" >USD</option>
                                        <option value="GBP" >GBP</option>
                                        <option value="EUR" >EUR</option>
                                    </select>
                                    <p className="error"></p>
                                </div>  */}
                                <div className='form-item span-col-3'>
                                    <label><span className="errorX mr-2">*</span>Justification for this Request (Summary)</label>
                                    <textarea name="justification" rows={5} maxLength={300} className="mt-1" value={formData?.justification} onChange={handleInputChange} required
                                        onKeyUp={() => {formData.justification.length < 1 ? setErrorData({ ...errorData, justification: 'This field is required' }) : 
                                        setErrorData({ ...errorData, justification: '' })}}> 
                                    </textarea>
                                    <small style={{fontSize: "10px"}} className={formData.justification?.length >= 300 ? "mt-1 error" : "mt-1"}>{formData.justification?.length}/300 Characters</small>
                                    <p className="error">{ errorData?.justification }</p>
                                </div>                               
                                {/* <div className='form-item span-col-1' style={{height: "fit-content"}}>
                                    <label><span className="errorX mr-2">*</span>Estimated Sea Freight Cost</label>
                                    <div className="contact-container">
                                        <input name="estimatedCostSeaFreight" 
                                            disabled={!formData.freightCostCurrency}
                                            value={formData?.estimatedCostSeaFreight} onChange={handleInputChange} type='number' required
                                            onKeyUp={() => {Number(formData.estimatedCostSeaFreight) < 0 ? setErrorData({ ...errorData, estimatedCostSeaFreight: 'This field is required' }) : 
                                            setErrorData({ ...errorData, estimatedCostSeaFreight: '' })}} />
                                        <input type="text" disabled value={`${getCurrencySymbol(formData?.freightCostCurrency)} ${formatCurrency(formData?.estimatedCostSeaFreight)}`} />
                                    </div>                                    
                                    <p className="error">{ errorData?.estimatedCostSeaFreight }</p>
                                </div>
                                <div className='form-item span-col-1' style={{height: "fit-content"}}>
                                    <label><span className="errorX mr-2">*</span>Estimated Air Freight Cost</label>
                                    <div className="contact-container">
                                        <input name="estimatedCostAirFreight" 
                                            disabled={!formData.freightCostCurrency}
                                            value={formData?.estimatedCostAirFreight} 
                                            onChange={handleInputChange} 
                                            type='number' 
                                            required
                                            onKeyUp={() => {Number(formData.estimatedCostAirFreight) < 0 ? setErrorData({ ...errorData, estimatedCostAirFreight: 'This field is required' }) : 
                                            setErrorData({ ...errorData, estimatedCostAirFreight: '' })}} />       
                                        <input type="text" disabled value={`${getCurrencySymbol(formData?.freightCostCurrency)} ${formatCurrency(formData?.estimatedCostAirFreight)}`} />
                                    </div>                                                                   
                                    <p className="error">{ errorData?.estimatedCostAirFreight }</p>
                                </div> 
                                {false && <div className='form-item span-col-1' style={{height: "fit-content"}}>
                                    <label>Attachments</label>
                                    <button type="button" className="custom-button orange-outline mt-1" style={{width: "fit-content", height: "35px"}}
                                    onClick={() => setOpenUploadModal(true)}>Upload Attachments</button>
                                </div>}                                  */}
                            </div> 
                        </div>
                    </div>
{/* Attachments, if any */}
                    {!!selectedFiles.length && <div className="main-inner mt-1">
                        <div className="summary-title">
                            Attachments
                        </div> 
                        <div className="form-view-container for-mot">
                            {
                                selectedFiles?.map((data: any, index: number) => {
                                    return (
                                        <div key={index} className="d-flex file-input-container mb-1">
                                            <span className="d-flex-2">
                                                <span>{index+1}. {data.type}</span> 
                                                {/* <span> - {data.name}</span>  */}
                                                <p className="small-text m-0">. 02/03/2024</p>
                                            </span>  
                                            <div className="d-flex">
                                                <button className='actions red mr-1' type="button"
                                                onClick={() => removeSelectedFile(data.id)}
                                                >
                                                    <span className="material-symbols-rounded">remove</span>
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div> 
                                    )
                                })
                            }
                        </div>
                        
                    </div>}
                    
{/* Submit Button */}
                    <div className="main-inner mt-1" style={{padding: "16px 0"}}>                 
                        <button type="submit" className="custom-button orange"
                            disabled={isSubmitting} 
                            style={{margin: "0 auto"}}>
                            <span className="material-symbols-rounded">web_traffic</span>{isSubmitting ? "Loading..." : "Submit Form"}
                        </button>
                    </div> 
                    </form>        
                </div>
            </div>
            <Modal isOpen={openUploadModal} style={customStyles} className="modal modal-5" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Attachments</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenUploadModal(false);clearFiles()}}>close</span>
                </div>
                <form onSubmit={handleSelectedFiles}>
                <div className="modal-body" style={{height: "320px"}}>
                    <div className="d-grid-2"> 
                        {
                            files.map((data: any, index: number) => {
                                return (
                                    <>
                                        {index !== 0 && <p className='span-col-2' style={{borderTop: "1px solid #d9d9d9"}}></p>}
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span>Attachment Name</label>
                                            <input
                                                id="fileNameInput"
                                                type="text"
                                                name="type"
                                                onChange={(event) => handleChange(event, data.id)}
                                                required={index === 0}
                                            />
                                        </div> 
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span> Attachment (zip, pdf)</label>
                                            <input id="file" name="file" type="file" accept=".pdf, .zip" required={index === 0} onChange={(event) => handleFileChange(event, data.id)} />                                                
                                        </div>
                                        <button type="button" disabled={index === 0} className="actions red" onClick={() => removeFile(data.id)} >
                                            <span className="material-symbols-rounded">remove</span>
                                            <span>Remove Row</span>
                                        </button>

                                        {index === files.length - 1 && <button type="button" className="actions blue" style={{justifyContent: "end"}} onClick={() => addFile()}>
                                            <span className="material-symbols-rounded">add</span>
                                            <span>Add Row</span>
                                        </button>}
                                        
                                    </>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => {setOpenUploadModal(false); clearFiles()}}>Cancel</button>
                    <button type="submit" 
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Upload"}</button>
                </div>
                </form>
            </Modal>
            <ToastContainer />
        </Layout>
    )
}

export default ChangeModeOfTransportation