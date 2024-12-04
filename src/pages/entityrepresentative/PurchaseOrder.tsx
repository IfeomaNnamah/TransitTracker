import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import loading from "../../assets/images/loading.gif"
import status from "../../assets/images/total-icon.png"
import number from "../../assets/images/number-icon.png"
import date from "../../assets/images/date-icon.png"
import person from "../../assets/images/user-icon.png"
import { StatusProp, POLineItems, PurchaseOrderInfo } from "../../interfaces/purchaseorder.interface";
import { useSelector } from "react-redux";
import { makeGetRequest } from "../../request";
import { POItemSupplyStatus, POItemStatus, formatCurrency, formatDateTime, getCurrencySymbol, getPurchaseOrderItemStatus, customStyles, getPOItemSupplyStatusIndex } from "../../helpers";
import Modal from "react-modal"
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Layout from "../Layout";

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const PurchaseOrder =  () => {
    const navigate = useNavigate()
    const param = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [purchaseOrder, setRecords] = useState<PurchaseOrderInfo | null>()
    const [poLineItems, setPoLineItems] = useState<POLineItems[]>()

    // For Purchase Order Items
    const [currentPage1, setCurrentPage1] = useState(1);
    const [itemsPerPage1, setItemsPerPage1] = useState(25);
    const [totalItems1, setTotalItems1] = useState(0);
    const totalPages1 = Math.ceil(totalItems1 / itemsPerPage1);

    const handlePrevious1 = () => {if (currentPage1 > 1) setCurrentPage1(currentPage1 - 1)}
    const handleNext1 = () => {if (currentPage1 < totalPages1) setCurrentPage1(currentPage1 + 1)}
    const getPageNumbers1 = () => {
        const pageNumbers1 = [];
        for (let i = 1; i <= totalPages1; i++) {pageNumbers1.push(i);}
        return pageNumbers1;
    };

    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("items")
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
    const [purchaseOrderId, setPurchaseOrderId] = useState("")
    const getPurchaseOrder = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrder",
            id: purchaseOrderNumber
            // params: {}
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                if(res){
                    setRecords(res)
                    setPurchaseOrderId(res.id)
                    getPurchaseOrderItems(res.id)
                }else setRecords(null); setPoLineItems([]); setTotalItems1(0); 
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    const [searchItem, setSearchItem] = useState("")
    const [itemStatus, setItemStatus] = useState("")
    const [filterMaterialNumber, setFilterMaterialNumber] = useState("")
    const getPurchaseOrderItems = (id: string) => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrderItems",
            id: purchaseOrderNumber,
            params: {
                Page: currentPage1,
                PageSize: itemsPerPage1,  
                PurchaseOrderId: id           
            }
        };
        if(searchItem) {
            if(!currentPage1) setCurrentPage1(1)
            setItemStatus("");
            (document.getElementById("itemstatus") as HTMLSelectElement).value = "";
            request.params.SearchString = searchItem
        }
        if(filterMaterialNumber) request.params.MaterialNumber = filterMaterialNumber
        if(itemStatus) request.params.Status = itemStatus
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                if(res) setPoLineItems(res.data); setTotalItems1(res.totalCount)
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    useEffect(() => {
        if(accessToken && purchaseOrderNumber) getPurchaseOrderItems(purchaseOrderId) // eslint-disable-next-line
    }, [searchItem, filterMaterialNumber, itemStatus, itemsPerPage1, currentPage1])

    const handleItemSearch = () => {
        const status = (document.getElementById("itemstatus") as HTMLInputElement)?.value
        const materialNumber = (document.getElementById("materialnumber") as HTMLInputElement)?.value
        const search = (document.getElementById("searchitem") as HTMLInputElement)?.value
        
        if(search) setSearchItem(search)
        if(status !== null) setItemStatus(status)
        if(materialNumber) setFilterMaterialNumber(materialNumber)
    }

    const clearFilters = () => {
        if(searchItem) setSearchItem("")
        if(itemStatus) setItemStatus("")
        if(filterMaterialNumber) setFilterMaterialNumber("");
        (document.getElementById("itemstatus") as HTMLSelectElement).value = "";
        (document.getElementById("searchitem") as HTMLInputElement).value = "";
    }    

    useEffect(() => {
        if(accessToken && purchaseOrderNumber) {
            getPurchaseOrder()
            navigate("/entityrepresentative/purchaseorders/"+purchaseOrderNumber)
        } // eslint-disable-next-line
    }, [purchaseOrderNumber, accessToken, currentPage1, itemsPerPage1])    

    useEffect(() => {
        if(param.id) {
            const element = (document.getElementById("purchaseOrderNumber") as HTMLInputElement)
            if(element) {
                (document.getElementById("purchaseOrderNumber") as HTMLInputElement).value = param.id
                setPurchaseOrderNumber(param.id)
            }
        } // eslint-disable-next-line
    }, [document.getElementById("purchaseOrderNumber")])

    const [sortOrder, setSortOrder] = useState<{
        field: string | null;
        ascending: boolean;
    }>({
        field: "purchaseOrderItemNumber",
        ascending: true,
    });

    const handleSort = (field: string) => {        
        if (sortOrder.field === field) setSortOrder({ ...sortOrder, ascending: !sortOrder.ascending });
        else setSortOrder({ field, ascending: true });        
    };

    const handleCopy = (materialNumber: string) => {
    // Implement the copy logic here
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = materialNumber;

    // Make the textarea non-editable to avoid focus and activation
    tempTextArea.setAttribute("readonly", "");
    tempTextArea.style.position = "absolute";
    tempTextArea.style.left = "-9999px";

    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    try {
        // Copy the text to the clipboard
        document.execCommand("copy");
        toast.info(`Copied! - ${materialNumber}`)
    } catch (err) {
        toast.error("Unable to copy selected item: " + err);
    } finally {
        document.body.removeChild(tempTextArea);
    }
    };
    
    const [selectedRow, setSelectedRow] = useState("")
    const [toggleExpand, setToggleExpand] = useState(false)

    const page = "Purchase Orders"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>   
                    <div className="main-inner">  
                        <div className="detail-top-section">
                            <div className="d-flex-center">
                                <div style={{display: "flex", padding: "16px"}}>
                                    <div className="search-container">
                                        <span className="material-symbols-rounded">search</span>
                                        <input id="purchaseOrderNumber" placeholder="Search Purchase Orders" />
                                    </div>
                                    <button className="custom-button orange left-item ml-2"
                                        onClick={() => {setPurchaseOrderNumber((document.getElementById("purchaseOrderNumber") as HTMLInputElement)?.value); setCurrentPage1(1)}}
                                        >Search</button>
                                </div>
                            </div>
                                
                            <div className="tab">                                
                                <div className={activeTab === "items" ? "tab-item active" : "tab-item"}
                                    onClick={() => setActiveTab("items")}>
                                    <span className="material-symbols-rounded">format_list_numbered</span>
                                    <p>Purchase Order Items</p>
                                </div>
                                <div className={activeTab === "summary" ? "tab-item active" : "tab-item"}
                                    onClick={() => setActiveTab("summary")}>
                                    <span className="material-symbols-rounded">contract</span>
                                    <p>Purchase Order Summary</p>
                                </div>                              
                            </div>                          
                        </div> 
                    </div> 

                    {!purchaseOrder && <div className="main-inner" style={{minHeight: "calc(100vh - 160px)"}}>
                        <p style={{fontSize: "12px", padding: "24px", color: "#929292"}}>
                            {purchaseOrderNumber && !isLoading ? `No Records Found with Purchase Order Number ${purchaseOrderNumber}` : "Search Purchase Order Number to Filter Items"}
                        </p>
                    </div>}

                    {purchaseOrder && <div className="main-inner mt-1" style={{minHeight: "calc(100vh - 160px)"}}>                  
                        {activeTab === "summary" && <div className="form-view-container">
                                <div className='d-grid' style={{gap: "18px"}}>                                    
                                        <div className='form-item'>
                                            <label>Purchase Order Number</label>
                                            <input type='text' disabled value={purchaseOrder?.purchaseOrderNumber} />
                                        </div>   
                                        <div className='form-item'>
                                            <label>Date</label>
                                            <input type='text' disabled value={formatDateTime(purchaseOrder ? purchaseOrder?.createdDate : "")} />
                                        </div> 
                                        <div className='form-item span-col-2'>
                                            <label>Supplier Address</label>
                                            <input type='text' disabled value={purchaseOrder?.supplierAddress} />
                                        </div>  
                                        <div className='form-item'>
                                            <label>Supplier Phone Number</label>
                                            <input type='text' disabled value={purchaseOrder?.supplierPhoneNumber} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Supplier</label>
                                            <input type='text' disabled value={purchaseOrder?.supplierName} />
                                        </div>
                                        <div className='form-item span-col-2'>
                                            <label>Final Shipping Address</label>
                                            <input type='text' disabled value={purchaseOrder?.finalShippingAddress}/>
                                        </div>
                                        <div className='form-item'>
                                            <label>Supplier Reference</label>
                                            <input type='text' disabled value={purchaseOrder?.supplierReference} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Buyer Name</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerName} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Buyer Email</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerEmail} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Freight Forwarder Name</label>
                                            <input type='text' disabled value={`${purchaseOrder?.freightForwarder?.firstName??""} ${purchaseOrder?.freightForwarder?.lastName??""}`} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Freight Forwarder Company</label>
                                            <input type='text' disabled value={purchaseOrder?.freightForwarder?.companyName} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Freight Forwarder Assignment Date</label>
                                            <input type='text' disabled value={formatDateTime(purchaseOrder?.freightForwarderAssignmentDate)} />
                                        </div>                                
                                        <div className='form-item'>
                                            <label>Incoterms</label>
                                            <input type='text' disabled value="" />
                                        </div>                                   
                                        <div className='form-item'>
                                            <label>Total amount w/o taxes</label>
                                            <input type='text' disabled value={`${getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)}${formatCurrency(purchaseOrder?.totalAmountTaxes)}`} />
                                        </div>  
                                        <div className='form-item'>
                                            <label>Total Net Amount of Order</label>
                                            <input type='text' disabled value={`${getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)}${formatCurrency(purchaseOrder?.totalNetAmountOfOrder)}`} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Total Amount of Order</label>
                                            <input type='text' disabled value={`${getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)}${formatCurrency(purchaseOrder?.totalAmountOfOrder)}`} />
                                        </div>                   
                                    </div>
                        </div>} 
                        {activeTab === "items" && <div style={{minHeight: "calc(100vh - 160px)"}}>
                            <div className="inside d-flex">
                                <div className="card">
                                    <img src={number} alt="" width="36px" height="36px" />
                                    <div>
                                        <p>Purchase Order Number</p>
                                        <span>{purchaseOrder?.purchaseOrderNumber}</span>
                                    </div>
                                </div>                                
                                <div className="card">
                                    <img src={date} alt="" width="36px" height="36px" />
                                    <div>
                                        <p>Date</p>
                                        <span>{formatDateTime(purchaseOrder ? purchaseOrder?.createdDate : "")}</span>
                                    </div>
                                </div> 
                                <div className="card">
                                    <img src={status} alt="" width="36px" height="36px" />
                                    <div>
                                        <p>Total Order Amount</p>
                                        <span>{getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)}{formatCurrency(purchaseOrder?.totalAmountOfOrder)}</span>
                                    </div>
                                </div>  
                                <div className="card">
                                    <img src={person} alt="" width="36px" height="36px" />
                                    <div>
                                        <p>Supplier</p>
                                        <span>{purchaseOrder?.supplierName??"N/A"}</span>
                                        {/* <span>{getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)}{formatCurrency(purchaseOrder?.totalAmountOfOrder)}</span> */}
                                    </div>
                                </div>                              
                            </div>
                            <div className='table-container custom' style={{marginTop: "16px"}}>
                                <div className="filter-container">
                                    <div className="search-container">
                                        <span className="material-symbols-rounded" style={{fontSize: "16px"}}>search</span>
                                        <input id="searchitem" placeholder="Search" onChange={(e) => {if(e.target.value.length < 1) setSearchItem("")}}/>
                                    </div>
                                    <select id="itemstatus">
                                        {
                                            POItemStatus().map((status: StatusProp, index: number) => (
                                                <option key={index} value={status.value}>
                                                  {status.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <div className="custom-button orange" style={{height: "18px"}} onClick={() => handleItemSearch()}>Search</div>
                                    <div className={(!searchItem && !filterMaterialNumber && !itemStatus) ? "actions blue disabled" : "actions blue"} onClick={() => clearFilters()}>
                                        <span className="material-symbols-rounded">filter_alt_off</span>
                                        Clear Filters</div>
                                </div>
                                <table>
                                    <thead>
                                        <tr className="no-textwrap">
                                            <th>
                                                <div className="sort" onClick={() => handleSort('purchaseOrderItemNumber')}>
                                                <span className="material-symbols-rounded">unfold_more</span>
                                                    Item No
                                                </div>
                                            </th>
                                            <th>
                                                <div className="sort" onClick={() => handleSort('materialNumber')}>
                                                    <span className="material-symbols-rounded">unfold_more</span>
                                                    Material Number
                                                </div>
                                            </th>
                                            <th>Material Description</th>
                                            <th>Delivery Date</th>
                                            <th>Quantity</th>
                                            <th>Unit</th>
                                            <th>Unit Price ({getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)})</th>
                                            <th>Net Amount ({getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)})</th>
                                            <th>Shipment Mode</th>
                                            <th>Manufacturer Part No</th>
                                            <th>Manufacturer</th>
                                            <th style={{ position: "sticky", right: '0', zIndex: '1'}}>Item Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            poLineItems?.map((data, i) => {
                                                return (
                                                    <>
                                                    <tr key={i}>
                                                        <td 
                                                            onClick={() => {setSelectedRow(data.id); setToggleExpand(!toggleExpand)}} style={{paddingLeft: "24px", cursor: "pointer", }} 
                                                            className="fw-600 text-blue">
                                                                <div className="d-flex" style={{alignItems: "center", textWrap: "nowrap"}}>
                                                                    {(selectedRow !== data.id || !toggleExpand) && <span className="material-symbols-rounded">expand_more</span>}
                                                                    {selectedRow === data.id && toggleExpand && <span className="material-symbols-rounded">expand_less</span>}
                                                                    Item { data.purchaseOrderItemNumber }
                                                                </div>
                                                        </td>
                                                        <td>
                                                            <span onClick={() => handleCopy(data.materialNumber)} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>{ data.materialNumber }</td>
                                                        <td>{ data.materialDescription }</td>
                                                        <td className="no-textwrap">{  formatDateTime(data.deliveryDate) }</td>
                                                        <td>{ data.quantity }</td>
                                                        <td>{ data.unit }</td>                                                    
                                                        <td>{ formatCurrency(data.unitPrice) }</td>
                                                        <td>{ formatCurrency(data.netAmount) }</td>
                                                        {data.modeOfTransportation==="SEA" && <td>
                                                            <span className="material-symbols-rounded" style={{marginRight:"8px", marginTop: "-10px"}}>sailing</span>
                                                            <span>Sea</span>
                                                            </td>}
                                                        {data.modeOfTransportation==="AIR" && <td>
                                                            <span className="material-symbols-rounded" style={{marginRight:"8px", marginTop: "-10px"}}>flight</span>
                                                            <span>Air</span>
                                                            </td>}
                                                        <td>{ data.manufacturerPartNumber }</td>
                                                        <td className="no-textwrap ">{ data.manufacturer } </td>
                                                        <td style={{ position: "sticky", right: '0'}}
                                                            className={"status "+ getPurchaseOrderItemStatus(data.status)?.color}>{getPurchaseOrderItemStatus(data.status)?.value}</td>
                                                    </tr>
                                                    {selectedRow === data.id && toggleExpand && 
                                                        <>
                                                            {data.purchaseOrderItemSupplies.length > 0 && <tr style={{backgroundColor:"white"}}>
                                                                <th style={{paddingLeft: "36px", textWrap: "nowrap"}}>Quantity</th>
                                                                <th style={{paddingLeft: "36px"}} colSpan={10}>Timeline</th>
                                                            </tr>}
                                                            {data.purchaseOrderItemSupplies.length === 0 && <p style={{marginLeft: "28px", textWrap:"nowrap"}}>No Record Found</p>}
                                                            {data.purchaseOrderItemSupplies.map((item: any, index: number) => {
                                                                return (
                                                                    <tr style={{backgroundColor:"white"}}>
                                                                        <td style={{paddingLeft: "36px"}}>{item.quantity}</td>
                                                                        <td colSpan={10} style={{paddingLeft: "0"}}>
                                                                        <Box sx={{ width: '95%' }}>
                                                                            <Stepper activeStep={getPOItemSupplyStatusIndex(item.status)} alternativeLabel>
                                                                                {POItemSupplyStatus().map((label: any, index: number) => (
                                                                                    index > 0 ? (
                                                                                        <Step key={label.value}>
                                                                                            <StepLabel>{label.name}</StepLabel>
                                                                                        </Step>
                                                                                    ) : null
                                                                                ))}
                                                                            </Stepper>
                                                                        </Box>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })

                                                            }                                                            
                                                        </>
                                                    }
                                                    </>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
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
                            </div>}
                        </div>}
                    </div> }                                  
                </div>
                <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p>Loading data...</p>
                    </div>
                </Modal> 
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default PurchaseOrder