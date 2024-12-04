import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useParams } from "react-router-dom";
import Layout from "../../Layout";
import PdfGenerator from "../../pdftemplates/generateModeOfTransportation";
import { FormEvent, useEffect, useRef, useState } from 'react';
import { areArraysEqual, formatCurrency, getCurrencySymbol, GUID } from 'helpers';
import { makeGetRequest, makePatchRequest } from 'request';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';


const ModeOfTransportationDetail =  () => {
    const param = useParams()
    const location = useLocation()
    const statusAfterNavigation = location.state as { status: string };
    const [modeOfTransportation, setModeOfTransportation] = useState<Record <string, any>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const user: any = useSelector((state: any) => state.tepngUser.value);
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const permissions: any = useSelector((state: any) => state.permissions.value);
    const [formData, setFormData] = useState({
        modeOfTransportationId: param.id,
        estimatedCostSeaFreight: 0,
        estimatedCostAirFreight: 0,
        freightCostCurrency: "USD",
        shippingOfficerId: user?.id,
        shippingOfficerCheck: "Approved",

        estimatedDimensions: "",
        estimatedWeight: "",
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

    const handlePurchaseOrderItemCheck = (e:React.ChangeEvent<HTMLInputElement>, packageUID: string, purchaseOrderItemId: string) => {
        const { checked } = e.target
        setPackagesArray((prevItems) =>
            prevItems.map((item: any) => {
                if (item.id === packageUID) {
                    return {
                        ...item,
                        purchaseOrderItems: item.purchaseOrderItems.map(
                            (poItem: any) => ({
                                ...poItem,
                                isChecked:
                                    poItem.id === purchaseOrderItemId
                                        ? checked
                                        : poItem.isChecked,
                                quantityInPackage:
                                    poItem.id === purchaseOrderItemId
                                        ? checked
                                            ? "" //allows user to enter any value
                                            : "" // clear any value entered after its unchecked
                                        : poItem.quantityInPackage,
                            })
                        ),
                    };
                }
                return item;
            })
        );
        
    }

    const [formatedPurchaseOrderItemRequests, setFormatedPurchaseOrderItemRequests] = useState([])
    const getModeOfTransportationById = () => {
        
        var request = {
            what: "getModeOfTransportationById",
            id: param.id,
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                const purchaseOrderItemRequests = res.purchaseOrderItemRequests
                setModeOfTransportation(res)
                const formatedPurchaseOrderItemRequests = purchaseOrderItemRequests?.map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity,
                    quantityInPackage: "",
                    materialNumber: item.materialNumber,
                    purchaseOrderItemNumber: item.purchaseOrderItemNumber,
                    purchaseOrderNumber: item.purchaseOrderNumber,
                    isChecked: false
                }))
                setFormatedPurchaseOrderItemRequests(formatedPurchaseOrderItemRequests)
                setPackagesArray([
                    {
                        id: GUID(8),
                        length: "",
                        height: "",
                        width: "",
                        estimatedWeight: "",  
                        cubicMeters: "",      
                        purchaseOrderItems: formatedPurchaseOrderItemRequests,
                        error: "",
                    }
                ])
            })
            .catch((error) => 
                {console.log(error)}
            );
        }

    // const submitResponse = (response: string) => {
    //     setIsSubmitting(true)
    //     var request = {
    //         what: "handleShippingManagerApproval",
    //         data: {
    //             modeOfTransportationId: param?.id,
    //             shippingOfficerManagerId: user?.id,
    //             shippingOfficerManagerCheck: response
    //         },
    //     };
        
    //     makePatchRequest(request)
    //         .then((response: any) => {
    //             setIsSubmitting(false)
    //             toast.success(response.msg)
    
    //             setTimeout(() => {
    //                 navigate("/transitofficer/modeoftransportationchange")
    //             }, 700);
    //         })
    //         .catch((error) => 
    //             {toast.error(error.msg); setIsSubmitting(false)}
    //         );
    //     }

    const isDataCompleteForPackages = (packages: any[]) => {
        return packages.every((packageItem) => {
            // Check that all top-level fields in each package are provided (not empty)
            const allFieldsProvided = Object.keys(packageItem)
                .filter(key => (key !== "error" && key !== "info")) // Exclude the "error" key
                .every(key => packageItem[key]);
    
            // Check that all checked items have all required fields
            const allPurchaseOrderItemsComplete = 
                packageItem.purchaseOrderItems.some((poItem: any) => poItem.isChecked) && // Check at least one item is checked
                packageItem.purchaseOrderItems
                    .filter((poItem: any) => poItem.isChecked) // Filter only checked items
                    .every((poItem: any) => poItem.quantityInPackage); // Validate required fields
            
            // Check that last package items have outstanding as zero
            const noOutstandingQuantity = packages[packages.length - 1].purchaseOrderItems
                .filter((poItem: any) => poItem.isChecked) // Filter only checked items
                .every((poItem: any) => poItem.outstandingQuantity === 0);  
            
            if(!noOutstandingQuantity) toast.error("Some item(s) have an outstanding quantity.")
            
            // Return true if all checks pass for this package
            return allFieldsProvided && allPurchaseOrderItemsComplete && noOutstandingQuantity;
        });
    };
    
    const handleUpdateMOTInformation = (event: FormEvent) => {
        event.preventDefault()        

        packagesArray.forEach((packageA: any, index: number) => {
            // Check if all top-level fields are filled
            const allFieldsProvided = Object.keys(packageA)
                .filter(key => (key !== "error" && key !== "info")) // Exclude the "error" key
                .every(key => packageA[key]);
        
            // Check that all checked items have both harmonisedSystemCode and countryOfOrigin
            const allPurchaseOrderItemsComplete = 
                packageA.purchaseOrderItems.some((poItem: any) => poItem.isChecked) && // Check at least one item is checked
                packageA.purchaseOrderItems
                    .filter((poItem: any) => poItem.isChecked) // Filter only checked items
                    .every((poItem: any) => poItem.quantityInPackage); // Validate required fields

            // Check that last package items have outstanding as zero
            const noOutstandingQuantity = packagesArray[packagesArray.length - 1].purchaseOrderItems
                .filter((poItem: any) => poItem.isChecked) // Filter only checked items
                .every((poItem: any) => poItem.outstandingQuantity === 0);  
        
            // Update error message based on validation results
            if (!allFieldsProvided) {
                packagesArray[index]["error"] = "Kindly fill all the required fields.";
            } else if (!allPurchaseOrderItemsComplete) {
                packagesArray[index]["error"] = "Kindly check atleast one item and fill all the required fields for the checked item(s).";
            }if (!noOutstandingQuantity && index === packagesArray.length - 1) {
                packagesArray[index]["error"] = "Some item(s) have an outstanding quantity.";
            } else {
                packagesArray[index]["error"] = "";
            }
        });

        //open the first found package with error
        const packagesWithError = packagesArray.filter((packageA: any) => packageA.error !== "");
        setSelectedTab(packagesWithError[0]?.id)

        const data = {
            modeOfTransportationId: formData.modeOfTransportationId,
            estimatedCostSeaFreight: formData.estimatedCostSeaFreight,
            estimatedCostAirFreight: formData.estimatedCostAirFreight,
            freightCostCurrency: formData.freightCostCurrency,
            shippingOfficerId: user?.id,
            shippingOfficerCheck: "Approved",
    
            listOfPackages: packagesArray.map((pckArray: any) => ({
                estimatedDimension: `${pckArray.length} x ${pckArray.height} x ${pckArray.width}`,
                estimatedWeight: pckArray.estimatedWeight,
                cubicMeters: pckArray.cubicMeters,
                listOfPurchaseOrderItems: pckArray.purchaseOrderItems
                .filter((item: any) => item.isChecked)
                .map((item: any) => ({
                    purchaseOrderItemRequestId: item.id,
                    quantity: Number(item.quantityInPackage)
                }))
            }))
            
        }

        const isAirFreightGreaterThanSeaFreight = Number(data.estimatedCostAirFreight) > Number(data.estimatedCostSeaFreight)
        if(!isAirFreightGreaterThanSeaFreight) toast.error("Air Freight must be greater than Sea Freight")
      
        const areAllPackagesComplete = !!isDataCompleteForPackages(packagesArray);
        if(areAllPackagesComplete && isAirFreightGreaterThanSeaFreight) {
            setIsSubmitting(true)
            var request = {
                what: "UpdateMOTInformationWithMultiplePackages",
                data: data,
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
        }else toast.warning("Please provide information for all required fields"); setIsSubmitting(false)
    }

    const [selectedTab, setSelectedTab] = useState("")
    const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>, packageUID: string, purchaseOrderItemId: string) => {
        const { name, value } = event.target;
        const selectedItem: any = formatedPurchaseOrderItemRequests?.find((item: any) => item.id === purchaseOrderItemId)          
        
        setPackagesArray((prevItems) => prevItems.map((row: any) => {
            if (row.id === packageUID) {
                return {
                    ...row,
                    purchaseOrderItems: row.purchaseOrderItems.map((item: any) => {
                        if (item.id === purchaseOrderItemId && Number(value) <= selectedItem.quantity) {
                            return {
                                ...item,
                                [name]: value
                            }
                        }return item
                    })
                }
            }return row
        }))
    }
    
    const [packagesArray, setPackagesArray] = useState<Record<string, any>[]>([])
    const addPackageRow = () => {  
        setPackagesArray([...packagesArray, ({
            id: GUID(8),
            length: "",
            height: "",
            width: "",
            estimatedWeight: "",
            cubicMeters: "",
            purchaseOrderItems: formatedPurchaseOrderItemRequests,
            error: "",
        })])
    }

    const removePackageRow = (packageUID: string) => {
        setPackagesArray(prevFiles => prevFiles.filter(row => row.id !== packageUID));
    };     
    
    const handlePackageInputChange = (
        event: any,
        packageUID: string,
        purchaseOrderItemId: string
    ) => {
        const { name, value } = event.target;
        setPackagesArray((prevItems) =>
          prevItems.map((item: any) => {
            if (item.id === packageUID) {
              if (purchaseOrderItemId) {
                return {
                  ...item,
                  purchaseOrderItems: item.purchaseOrderItems.map(
                    (poItem: any) => {
                      if (poItem.id === purchaseOrderItemId) {
                        return {
                          ...poItem,
                          [name]: value,
                        };
                      }
                      return poItem;
                    }
                  ),
                };
              } else {
                return {
                  ...item,
                  [name]: value,
                };
              }
            }
            return item;
          })
        );
    }   

    // use useeffect to check each purchaseOrderItem in packageArray and set the outstandingQuantity for each item
   
    // Create a ref to store the previous value of packagesArray
    const prevPackagesArray = useRef(packagesArray); 
    useEffect(() => {       

        // Compute the updated packagesArray
        const updatedPackagesArray = packagesArray.map((pck: any, index: number) => {
            return {
                ...pck,
                purchaseOrderItems: pck.purchaseOrderItems.map((poItem: any, poItemIndex: number) => {
                    let outstandingQuantity;

                    if (index > 0) {
                        const previousOutstanding = packagesArray[index - 1].purchaseOrderItems[poItemIndex]?.outstandingQuantity || 0;
                        outstandingQuantity = previousOutstanding - (poItem.quantityInPackage || 0);
                    } else {
                        outstandingQuantity = poItem.quantity - (poItem.quantityInPackage || 0);
                    }

                    return {
                        ...poItem,
                        outstandingQuantity,
                    };
                }),
            };
        });

        // Only update if the new array is different from the previous one
        const isDifferent = !areArraysEqual(prevPackagesArray.current, updatedPackagesArray);
        
        if (isDifferent) {
            setPackagesArray(updatedPackagesArray);
        }

        // Update the ref to the latest value
        prevPackagesArray.current = updatedPackagesArray;

    }, [packagesArray]);

    useEffect(() => {
        if (accessToken && formatedPurchaseOrderItemRequests.length === 0) getModeOfTransportationById()
       //eslint-disable-next-line 
    }, [accessToken]);
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
                                </div> 
                                {
                                    packagesArray?.map((packageA: any, index: number) => {
                                        return (
                                            <div style={{border:"1px solid #d9d9d9", borderRadius: "6px", marginBottom: "12px"}} key={index}>
                                                <div className="d-flex" style={{fontSize: "12px", backgroundColor: "#f4f7fc", padding: "12px", borderRadius: "6px 6px 0 0", cursor: "pointer"}}
                                                    onClick={() => setSelectedTab(prevTab => (prevTab === packageA?.id ? "" : packageA?.id))}>
                                                    <div className="d-flex-2" style={{cursor: "pointer"}} >
                                                        <span className="material-symbols-rounded">{selectedTab === packageA?.id ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
                                                        <span className="fw-500">Package {index+1}</span>
                                                    </div>
                                                    {packageA?.error && <div className="text-red d-flex-2 gap-2">
                                                        <span className="material-symbols-rounded f-16">error</span>
                                                        <span>{packageA.error}</span>
                                                    </div>}
                                                </div>                                                

                                                {selectedTab === packageA?.id && <div className='table-container custom' style={{minHeight: "300px", maxHeight: "440px", borderTop: "1px solid #d9d9d9", borderRadius: "0"}}>
                                                    <table>
                                                        <thead style={{position:"sticky", top:0 }}>
                                                            <tr className="no-textwrap">
                                                                <th className="no-border" style={{width: "5%"}}></th>
                                                                <th className="no-border" >PO Number</th>
                                                                <th className="no-border" >Item No</th>
                                                                <th className="no-border" >Material No</th>
                                                                <th className="no-border" >Supplied</th>
                                                                <th className="no-border" >Quantity</th>
                                                                <th className="no-border" >Outstanding</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                                {   packageA?.purchaseOrderItems?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                                                    : packageA?.purchaseOrderItems?.map((data: any, i: number) => {
                                                                        return (
                                                                            <tr 
                                                                                className={`${data.outstandingQuantity === 0 ? "disabled" : ""}`}
                                                                                title={`${data.outstandingQuantity === 0 ? "This item has been fully packed" : ""}`}
                                                                                >
                                                                                <td>
                                                                                    <input 
                                                                                    name="isChecked"
                                                                                    type="checkbox" 
                                                                                    disabled={(data.outstandingQuantity === 0 && data.quantityInPackage === "")}
                                                                                    value={data.isChecked} 
                                                                                    onChange={(event) => handlePurchaseOrderItemCheck(event, packageA?.id, data.id)} 
                                                                                    checked={data?.isChecked} />
                                                                                </td>
                                                                                <td>{ data.purchaseOrderNumber }</td>
                                                                                <td>Item { data.purchaseOrderItemNumber }</td>
                                                                                <td>{ data.materialNumber }</td>   
                                                                                <td>{ data.quantity }</td>    
                                                                                <td>
                                                                                    <input type="text" className={"custom-input"} 
                                                                                        name="quantityInPackage"
                                                                                        required={data?.isChecked}
                                                                                        id={`input-${data.materialNumber}`}
                                                                                        style={{width: "24px"}}
                                                                                        onChange={(e) => handleQtyChange(e, packageA?.id, data.id)} 
                                                                                        value={data.quantityInPackage} 
                                                                                        disabled={!data.isChecked}
                                                                                        title={!data.isChecked ? "Check item to enable input" : ""}/>
                                                                                </td>
                                                                                <td>
                                                                                    {data?.outstandingQuantity}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })
                                                                }
                                                        </tbody>
                                                    </table>
                                                </div>}
                                                
                                                {selectedTab === packageA?.id && <div className="form-view-container for-packages" style={{borderTop: "1px solid #e4e4e4"}}>
                                                    <div className='d-grid-5'>   
                                                        <div className='form-item span-col-1'>
                                                            <label><span className="errorX ">*</span>Length (CM)</label>
                                                            <input name="length" 
                                                                value={packageA.length} 
                                                                onChange={(event) => handlePackageInputChange(event, packageA.id, "")} 
                                                                type='text' 
                                                                required />
                                                        </div>
                                                        <div className='form-item span-col-1'>
                                                            <label><span className="errorX ">*</span>Width (CM)</label>
                                                            <input name="width" 
                                                                value={packageA.width} 
                                                                onChange={(event) => handlePackageInputChange(event, packageA.id, "")} 
                                                                type='text' 
                                                                required />
                                                        </div>
                                                        <div className='form-item span-col-1'>
                                                            <label><span className="errorX ">*</span>Height (CM)</label>
                                                            <input name="height" 
                                                                value={packageA.height} 
                                                                onChange={(event) => handlePackageInputChange(event, packageA.id, "")} 
                                                                type='text' 
                                                                required />
                                                        </div>
                                                        <div className='form-item span-col-1'>
                                                            <label><span className="errorX ">*</span>Est. Weight (KG)</label>
                                                            <input name="estimatedWeight" 
                                                                value={packageA.estimatedWeight} 
                                                                onChange={(event) => handlePackageInputChange(event, packageA.id, "")} 
                                                                type='text' 
                                                                required />
                                                        </div> 
                                                        <div className='form-item span-col-1'>
                                                            <label><span className="errorX ">*</span>Cubic Meters (M<sup>3</sup>)</label>
                                                            <input name="cubicMeters" 
                                                                value={packageA.cubicMeters} 
                                                                onChange={(event) => handlePackageInputChange(event, packageA.id, "")} 
                                                                type='text' 
                                                                required />
                                                        </div> 
                                                    </div> 
                                                </div>}
                                                {index !== 0 && selectedTab === packageA?.id && <div className="d-flex-center" style={{padding: "12px 8px", borderTop: "1px solid #d9d9d9"}}>                                
                                                    <button className="actions text-red" type="button" onClick={() => removePackageRow(packageA.id)}>
                                                        <span className="material-symbols-outlined f-16" >close</span>
                                                        <span>Remove</span>
                                                    </button>
                                                </div>}
                                            </div>
                                        )
                                    }) 
                                }
                                {/* {packagesArray?.length === 1 &&<div className="alert alert-info" style={{margin: "12px 0", padding: "8px", width: "auto"}}>
                                    <span className="material-symbols-outlined mr-2" style={{color: "#004085", fontSize: "16px"}}>info</span>
                                    <p style={{margin: 0, fontSize: "11px"}}>Please ensure to complete the first package, as the HS Code and Country of Origin will apply to the other packages.</p>
                                </div>} */}
                                {/* Add Package  */}
                                <div className="d-flex-center" style={{padding: "12px 8px", borderTop: "1px solid #d9d9d9"}}>
                                    <button 
                                    // className={`actions blue-text ${isDataComplete(packagesArray[0]) ? "" : "disabled"}`} 
                                    className={`actions blue-text`} 
                                    type="button" 
                                    // disabled={!isDataComplete(packagesArray[0])} 
                                    onClick={() => addPackageRow()}>
                                        <span className="material-symbols-outlined f-16">add</span>
                                        <span>Add Package</span>
                                    </button>
                                </div> 
                                <button 
                                    disabled={isSubmitting}
                                    style={{width: "100%", marginTop: '40px'}}
                                    className='custom-button orange-outline d-flex-center' 
                                    type='submit'>{isSubmitting ? 'Saving...' : 'Save Changes'}</button> 
                            </form>
                        </div>}

                    {/* Approval of MOT by Shipping Manager */}
                    {/* {permissions?.includes("ApproveMOTCostAndDimensions") &&
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
                    </div>} */}
                </div>
                <ToastContainer />
            </div>
        </Layout>
        
    )
}

export default ModeOfTransportationDetail