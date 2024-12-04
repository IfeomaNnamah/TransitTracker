import { FormEvent, useEffect, useState } from "react";
import { makeGetRequest, makePatchRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customStyles, formatCurrency, formatDateTime } from "helpers";
import Pagination from "components/Pagination";
import loading from "../../../../assets/images/loading.gif"
import { POLineItems, SelectedPOLineItems } from "interfaces/purchaseorder.interface";
import { useSelector } from "react-redux";
import Modal from 'react-modal'


const  UpdatePackage = (props: any) => {
    const {handleToggle, countryOfSupply, packageDetails, countries} = props

    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [isLoading, setIsLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [packageData, setPackageData] = useState<Record<string, any>>({})
    const [errorData, setErrorData] = useState<Record<string, any>>({})
    const [poLineItems, setPoLineItems] = useState<POLineItems[]>()
    const [selectedPoLineItems, setSelectedPoLineItems] = useState<SelectedPOLineItems[]>([])
    const [materialConfirmationModal, setMaterialConfirmationModal] = useState(false)

    const handlePackageInputChange = (e: any) => {
        const {name, value} = e.target
        setPackageData({...packageData, [name]: value})
    }

    const [currentPage1, setCurrentPage1] = useState(1);
    const [itemsPerPage1, setItemsPerPage1] = useState(10);
    const [totalItems1, setTotalItems1] = useState(0);
    const totalPages1 = Math.ceil(totalItems1 / itemsPerPage1);

    const handlePrevious1 = () => {if (currentPage1 > 1) setCurrentPage1(currentPage1 - 1)}
    const handleNext1 = () => {if (currentPage1 < totalPages1) setCurrentPage1(currentPage1 + 1)}
    const getPageNumbers1 = () => {
        const pageNumbers1 = [];
        for (let i = 1; i <= totalPages1; i++) {pageNumbers1.push(i);}
        return pageNumbers1;
    };

    const getPurchaseOrder = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrder",
            id: searchValue ? searchValue : packageDetails.purchaseOrderNumber,
            params: {
                UserId: user?.id
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                if(searchValue) setSelectedPoLineItems([])
                const res = response.data.data 
                if(res) getPurchaseOrderItems(res.id)
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    const getPurchaseOrderItems = (itemId: String) => {
        var request: Record<string, any> = {
            what: "getPurchaseOrderItems",
            params: {
                Page: currentPage1,
                PageSize: itemsPerPage1,
                purchaseOrderId: itemId
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data
                if(res) {
                    setIsLoading(false)
                    setPoLineItems(res.data.slice().sort((a: any, b: any) => {
                        return a.purchaseOrderItemNumber - b.purchaseOrderItemNumber;
                      }))                 
                    setTotalItems1(res.totalCount)
                }
                else setPoLineItems([])
            })
            .catch((error:any) => 
                {toast.error(error); setIsLoading(false)}
            );
    }

    const getPackage = () => {
        var request: Record<string, any> = {
            what: "getPackage",
            id: packageDetails.packageId,
            params: {
                userId: user?.id,
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                               
                setPackageData({
                    length: res.length,
                    height: res.height,
                    width: res.width,
                    cubicMeter: res.cubicMeter,
                    grossWeight: res.grossWeight,
                })
                
                setSelectedPoLineItems(res.purchaseOrderItemSupplies.map((item:any) => ({
                    id:item.purchaseOrderItem?.id, //po request item id
                    itemSupplyId:item.id, //po supply item id
                    purchaseOrderItemNumber: item.purchaseOrderItem?.purchaseOrderItemNumber,
                    purchaseOrderId: item.purchaseOrderItem?.purchaseOrderId,
                    purchaseOrderNumber: item.purchaseOrderItem?.purchaseOrderNumber,
                    materialNumber: item.purchaseOrderItem?.materialNumber,
                    materialDescription: item.purchaseOrderItem?.materialDescription,
                    harmonisedSystemCode: item?.harmonisedSystemCode,
                    purchaseOrderItemSupplies: res?.purchaseOrderItemSupplies,
                    quantity: item?.quantity, //supplied quantity
                    unitPrice: item.purchaseOrderItem?.unitPrice,
                    countryOfOrigin: item?.countryOfOrigin,
                    total: String(parseFloat(item?.quantity) * parseFloat(item?.unitPrice)), // total = quantity * unit_price
                    currency: item?.currency
                })));

                (document.getElementById("purchaseOrderNumber") as HTMLInputElement).value = packageDetails.purchaseOrderNumber;
            })
            .catch((error:any) => 
                {toast.error(error);}
            );
    }

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const [selectedItem, setSelectedItem] = useState<SelectedPOLineItems>({
        id: "",
        // itemSupplyId: "",
        purchaseOrderItemNumber: 0,
        purchaseOrderId: "",
        purchaseOrderNumber: "",
        materialNumber: "",
        materialDescription: "",
        harmonisedSystemCode: "",
        purchaseOrderItemSupplies: "",
        quantity: "",
        unitPrice: "",
        countryOfOrigin: "",
        total: "",
        currency: "",
        requestedQuantity: "",
        isChecked: false,
        modeOfTransportation: ""
    })
    const handleCheck = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target
        if(checked){
            const item: any = poLineItems?.find((item) => item.materialNumber === value)
            const selectedItem:SelectedPOLineItems = {
                id:item?.id,
                // itemSupplyId: item?.itemSupplyId,
                purchaseOrderItemNumber: item?.purchaseOrderItemNumber,
                purchaseOrderId: item?.purchaseOrderId,
                purchaseOrderNumber: item?.purchaseOrderNumber,
                materialNumber: item?.materialNumber,
                materialDescription: item?.materialDescription,
                harmonisedSystemCode: item?.harmonisedSystemCode,
                purchaseOrderItemSupplies: item?.purchaseOrderItemSupplies,
                quantity: "",
                requestedQuantity: item?.quantity,
                unitPrice: item?.unitPrice,
                countryOfOrigin: "",
                total: String(parseFloat(item?.quantity) * parseFloat(item?.unitPrice)), // total = quantity * unit_price
                currency: item?.currency,
                isChecked: false,
                modeOfTransportation: ""
            }
            setSelectedItem(selectedItem)
            setMaterialConfirmationModal(true)
        }else {
            var remainingItems = selectedPoLineItems.filter((item:any) => item.materialNumber !== value)
            setSelectedPoLineItems(remainingItems)
        }
    }

    const handleMaterialCOnfirmation = (response: boolean) => { 
        if(response) {setSelectedPoLineItems([...selectedPoLineItems, selectedItem]); setMaterialConfirmationModal(false)}
    }

    const handleChange = (event: any, materialNumber: string) => {
        const { name, value } = event.target;

        setSelectedPoLineItems(prevItems => {
            return prevItems.map(item => {
                if (item.materialNumber === materialNumber) {
                    return {
                        ...item,
                        [name]: value,
                    };
                }
                return item;
            });
        });
    };

    const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>, materialNumber: string, quantity: string) => {
        const { name, value } = event.target;
        const selectedItem: any = poLineItems?.find((item) => item.materialNumber === materialNumber)       
        const suppliedQty = selectedItem.purchaseOrderItemSupplies.reduce((acc: number, item: any) => acc + Number(item.quantity), 0)
        
        setSelectedPoLineItems(prevItems => {            
            return prevItems.map(item => {
                if (item.materialNumber === materialNumber && Number(value) <= (selectedItem.quantity - suppliedQty)) { 
                    return {
                        ...item,
                        [name]: value,
                    };
                }
                return item;
            });
        });        
    };

    const [totalUnitPrice, setTotalUnitPrice] = useState<number>(0);
    const [sumTotal, setSumTotal] = useState<number>(0);
    useEffect(() => {
        // Calculate total unit price whenever POLineItems changes
        const newUnitPriceTotal = selectedPoLineItems.reduce((acc, item) => acc + parseFloat(item.unitPrice), 0);
        const newTotal = selectedPoLineItems.reduce((acc, item) => acc +  (parseInt(item.quantity) * parseFloat(item.unitPrice)), 0);
        setTotalUnitPrice(newUnitPriceTotal);
        setSumTotal(newTotal);
    }, [selectedPoLineItems]);

    const getSuppliedQuantity = (item: any) => {
        return item.reduce((acc: number, item: any) => acc + Number(item?.quantity), 0)
    }

    const getStatusColor = (suppliedQty: number, requestedQty: number) => {
        if(suppliedQty === 0) return "yellow"
        if(suppliedQty < requestedQty) return "red"
        if(suppliedQty === requestedQty) return "green"
    }
  
    const row = poLineItems?.sort((a: any, b: any) => a.purchaseOrderItemNumber - b.purchaseOrderItemNumber)?.map((data, i) => {
        return (
            <tr key={i} 
            className={getSuppliedQuantity(data.purchaseOrderItemSupplies) === data.quantity ? "disabled" : ""}
            title={getSuppliedQuantity(data.purchaseOrderItemSupplies) === data.quantity ? "The requested quantity for this items has been provided" : ""}
            >
                <td>
                    <input type="checkbox" value={data.materialNumber} 
                    disabled={getSuppliedQuantity(data.purchaseOrderItemSupplies) === data.quantity ? true : false}
                    onChange={handleCheck}                         
                    checked={!!selectedPoLineItems.find(item => item.materialNumber === data.materialNumber)}/>
                </td>
                <td>{ data.purchaseOrderItemNumber }</td>
                <td>{ data.materialNumber }</td>
                <td>{ data.materialDescription }</td>
                <td className="no-textwrap">{ formatDateTime(data.deliveryDate) }</td>
                <td>{ data.quantity }</td>
                <td>{ data.unit }</td>
                <td>{ formatCurrency(data.unitPrice) }</td>
                <td>{ formatCurrency(data.netAmount) }</td>
                <td>{ data.manufacturerPartNumber }</td>
                <td className="no-textwrap ">{ data.manufacturer }</td>
                <td style={{ position: "sticky", textAlign: "center", right: '0'}}
                    className={`status ${getStatusColor(getSuppliedQuantity(data.purchaseOrderItemSupplies), Number(data.quantity))}`}>
                    <strong>{ getSuppliedQuantity(data.purchaseOrderItemSupplies) } / {data.quantity}</strong>
                </td>

            </tr>
        )
    })   

    const HandleUpdatePackage = (event: FormEvent) => {
        event.preventDefault();
        
        const purchaseOrderItems = selectedPoLineItems.map(item => {
            return {
                PurchaseOrderItemRequestId: item.id, 
                // PurchaseOrderItemSupplyId: item.itemSupplyId,
                harmonisedSystemCode: item.harmonisedSystemCode, 
                quantity: item.quantity,
                countryOfOrigin: item.countryOfOrigin,
                currency: item.currency
            }
        })       

        var isHsCodesValid, isQuantitiesValid, isCountryOfOriginValid;

        isHsCodesValid = selectedPoLineItems.every(item => item.harmonisedSystemCode?.length === 10);
        if(!isHsCodesValid) toast.error("Ensure all selected PO Items have a valid HS Code")

        isQuantitiesValid = selectedPoLineItems.every(item => Number(item.quantity) > 0);
        if(!isQuantitiesValid) toast.error("Ensure all selected PO Items have the supplied quantity")

        isCountryOfOriginValid = selectedPoLineItems.every(item => item.countryOfOrigin);
        if(!isCountryOfOriginValid) toast.error("Ensure all selected PO Items have a country of origin")
        const data = {
            packageId: packageDetails.packageId,
            length: packageData.length,
            height: packageData.height,
            width: packageData.width,
            cubicMeter: packageData.cubicMeter,
            grossWeight: packageData.grossWeight,
            purchaseOrderItems: purchaseOrderItems,
            totalUnitPrice: totalUnitPrice,
            sumTotal: sumTotal,
            ...(packageDetails.commercialInvoiceId !== "00000000-0000-0000-0000-000000000000" && { commercialInvoiceId: packageDetails.commercialInvoiceId })
        }
        
   
        if (Object.values(packageData).every(value => value) && selectedPoLineItems.length !== 0 && isHsCodesValid && isQuantitiesValid && isCountryOfOriginValid){            
            setIsLoading(true)
            var request:Record<string, any> = {
                what: "UpdatePackage",
                data: data
            }

            makePatchRequest(request)
                .then((response: any) => {
                    document.getElementById("BackToTopTrigger")?.click();
                    toast.success(response.msg)
                    getPurchaseOrder()
                    
                }).catch((error:any) => {toast.error(error.msg)});
        }else toast.warning("Please provide information for all required fields"); setIsLoading(false)
    }   

    useEffect(() => {
        if(accessToken && (searchValue || packageDetails)) {getPurchaseOrder(); getPackage()} //eslint-disable-next-line
    }, [searchValue, packageDetails])

    
    // useEffect(() => {
    //     if(accessToken) {} //eslint-disable-next-line
    // }, [])

    return (
        <div>
            <form onSubmit={HandleUpdatePackage}>
                <div className="main-inner"> 
                    <div className="main-inner-top d-flex-center">
                        <div className="d-flex">
                            <div className="search-container">
                                <span className="material-symbols-rounded">search</span>
                                <input id="purchaseOrderNumber" disabled placeholder="Search Purchase Order Number" style={{width: "200px"}} onKeyUp={handleSearch} />
                            </div>
                            <button type="button" disabled className="custom-button orange left-item ml-2" style={{height: "35px"}}
                                onClick={() => setSearchValue((document.getElementById("purchaseOrderNumber") as HTMLInputElement)?.value)}
                                >Search</button>
                        </div>
                    </div>

                    <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                        <table>
                            <thead>
                                <tr className="no-textwrap">
                                    <th></th>
                                    <th>Item No</th>
                                    <th>Material No</th>
                                    <th>Material Description</th>
                                    <th>Delivery Date</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Unit Price {!!poLineItems ? `(${poLineItems[0]?.currency})` : ""}</th>
                                    <th>Net Amount {!!poLineItems ? `(${poLineItems[0]?.currency})` : ""}</th>
                                    <th>Manufacturer Part No</th>
                                    <th>Manufacturer</th>
                                    <th style={{ position: "sticky", right: '0', zIndex: '1'}}>Supplied Qty</th>

                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? null : (
                                        poLineItems?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                        : row
                                    )
                                }
                            </tbody>
                        </table>
                        {false ? <div className="loader">
                                    <img src={loading} alt="loading" />
                                    <p>Loading data...</p>
                                </div> : null}                                     
                    </div>
                    {poLineItems && <div className="pagination-container">
                        <Pagination
                        currentPage={currentPage1}
                        itemsPerPage={itemsPerPage1}
                        totalPages={totalPages1}
                        handlePrevious={handlePrevious1}
                        handleNext={handleNext1}
                        setCurrentPage={setCurrentPage1}
                        getPageNumbers={getPageNumbers1}
                        setItemsPerPage={setItemsPerPage1} />
                        </div> }
                </div>  

                <div className="main-inner">                 
                    <p style={{padding: "16px 0 0 12px", marginTop: "8px", fontSize: "12px"}}><span className="errorX mr-2">*</span>Selected Purchase Order Items</p>
                    <div className="alert alert-info" style={{margin: "12px", padding: "8px", width: "auto"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                        <p style={{margin: 0}}>You cannot enter a quantity greater than the requested quantity.</p></div>
                        
                    <div className='table-container custom' style={{minHeight: "calc(100vh - 160px)"}}>
                        <table>
                            <thead>
                                <tr className="no-textwrap">
                                    <th></th>
                                    <th>Item No</th>
                                    <th>Material No</th>
                                    <th style={{width: "100px"}}>HS Code <small className="text-blue">(Must be 10-digits)</small></th>
                                    <th style={{width: "24px"}}>Quantity</th>
                                    <th>Country of Origin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    selectedPoLineItems?.map((data, i) => {
                                        return (
                                            <tr 
                                            key={i}
                                            >
                                                <td><input type="checkbox" value={data.materialNumber} 
                                                    onChange={handleCheck} 
                                                    checked={!!selectedPoLineItems.find(item => item.materialNumber === data.materialNumber)} />
                                                </td>
                                                <td>{data.purchaseOrderItemNumber}</td>
                                                <td>{data.materialNumber}</td>
                                                <td><input type="text" className="custom-input" 
                                                    name="harmonisedSystemCode"
                                                    required
                                                    maxLength={10} 
                                                    onChange={(e) => handleChange(e, data.materialNumber)} 
                                                    value={data.harmonisedSystemCode} /></td>
                                                <td>
                                                    <input type="text" className={"custom-input"} 
                                                        name="quantity"
                                                        required
                                                        id={`input-${data.materialNumber}`}
                                                        style={{width: "24px"}}
                                                        onChange={(e) => handleQtyChange(e, data.materialNumber, data.quantity)} 
                                                        value={data.quantity} />
                                                </td>
                                                <td>
                                                    <select name="countryOfOrigin" value={data.countryOfOrigin} required
                                                        onChange={(e) => handleChange(e, data.materialNumber)}>
                                                        <option value="" disabled>Select...</option>
                                                        {
                                                            countries?.map((country: string, index: number) => {
                                                                return (
                                                                    <option key={index} value={country}>{ country }</option>
                                                                )
                                                            })
                                                        }
                                                    </select>
                                                </td>
                                                {/* <td>{formatCurrency(data.unitPrice)}</td>
                                                <td>{formatCurrency(parseFloat(data.unitPrice) * parseInt(data.quantity))}</td> */}
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="form-view-container main-inner custom mt-1" style={{padding: "16px", margin: 0, boxSizing: "border-box"}}>
                    <div className="layout">
                        <div className="label">Package Dimensions</div>
                        
                        <div className="body d-grid-6"> 
                            <div className='form-item'>
                                <label><span className="errorX ?.lengthmr-2">*</span>Length</label>
                                <input name="length" value={packageData?.length} onChange={handlePackageInputChange} type='text' required
                                    onKeyUp={() => {packageData.length?.length < 1 ? setErrorData({ ...errorData, length: 'This field is required' }) : 
                                    setErrorData({ ...errorData, length: '' })}} />
                                <p className="error">{ errorData?.length }</p>
                            </div>
                            <div className='form-item'>
                                <label><span className="errorX mr-2">*</span>Width</label>
                                <input name="width" value={packageData?.width} onChange={handlePackageInputChange} type='text' required
                                    onKeyUp={() => {packageData.width?.length < 1 ? setErrorData({ ...errorData, width: 'This field is required' }) : 
                                    setErrorData({ ...errorData, width: '' })}} />
                                <p className="error">{ errorData?.width }</p>
                            </div>
                            <div className='form-item'>
                                <label><span className="errorX mr-2">*</span>Height</label>
                                <input name="height" value={packageData?.height} onChange={handlePackageInputChange} type='text' required
                                    onKeyUp={() => {packageData.height?.length < 1 ? setErrorData({ ...errorData, height: 'This field is required' }) : 
                                    setErrorData({ ...errorData, height: '' })}} />
                                <p className="error">{ errorData?.height }</p>
                            </div> 
                            <div className='form-item'>
                                <label><span className="errorX mr-2">*</span>Cubic Meter</label>
                                <input name="cubicMeter" value={packageData?.cubicMeter} onChange={handlePackageInputChange} type='text' required
                                    onKeyUp={() => {packageData.cubicMeter?.length < 1 ? setErrorData({ ...errorData, cubicMeter: 'This field is required' }) : 
                                    setErrorData({ ...errorData, cubicMeter: '' })}} />
                                <p className="error">{ errorData?.cubicMeter }</p>
                            </div>             
                            <div className='form-item'>
                                <label><span className="errorX mr-2">*</span>Gross Weight</label>
                                <input name="grossWeight" value={packageData?.grossWeight} onChange={handlePackageInputChange} type='text' required
                                    onKeyUp={() => {packageData.grossWeight?.length < 1 ? setErrorData({ ...errorData, grossWeight: 'This field is required' }) : 
                                    setErrorData({ ...errorData, grossWeight: '' })}} />
                                <p className="error">{ errorData?.grossWeight }</p>
                            </div>  
                        </div>
                    </div>
                    </div> 

                <div className="main-inner d-flex-center mt-1" style={{padding: "16px 0"}}>
                    <div className="gap-2 d-flex">
                        <button type="button" className="custom-button grey-outline" onClick={() => handleToggle(1)}>Cancel</button>                 
                        <button type="submit" className="custom-button orange" style={{height: "35px"}}>
                            Update Package
                        </button>
                    </div>
                    <a href="#top" id="BackToTopTrigger" className="back-to-top" hidden>Back to Top</a>
                </div>
            </form>

            <Modal isOpen={materialConfirmationModal} style={customStyles} className="modal modal-4" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Item Confirmation Modal</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => setMaterialConfirmationModal(false)}>close</span>
                </div>
                <div className="modal-body">
                    <p style={{lineHeight: "1.5em"}}>You are confirming that <strong>Item {selectedItem.purchaseOrderItemNumber} with Material Number {selectedItem.materialNumber}</strong> can be picked up from the provided location at <strong>{countryOfSupply}.</strong></p>
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => setMaterialConfirmationModal(false)}>Cancel</button>
                    <button type="submit" className="custom-button orange"
                        onClick={() => handleMaterialCOnfirmation(true)}>Yes</button>
                </div>
            </Modal>
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
            <ToastContainer/>
        </div>
    )
}

export default UpdatePackage