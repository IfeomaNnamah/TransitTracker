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
import { POItemSupplyStatus, formatCurrency, formatDateTime, getCurrencySymbol, getPurchaseOrderItemStatus, truncateText } from "../../helpers";
import Modal from "react-modal"
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Layout from "../Layout";

const PurchaseOrder =  () => {
    const navigate = useNavigate()
    const param = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const [purchaseOrder, setRecords] = useState<PurchaseOrderInfo>()
    const [poLineItems, setPoLineItems] = useState<POLineItems[]>()
    
    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        }
    };  

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

    const [isLoading, setIsLoading] = useState(false)
    const [mainTab, setMainTab] = useState("items")
    const [subTab, setSubTab] = useState("invoice")
    // const [mrdId, setMrdId] = useState("")
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
    const [purchaseOrderId, setPurchaseOrderId] = useState("")
    const getPurchaseOrder = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrder",
            id: purchaseOrderNumber,
            params: {
                UserId: user?.id
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data
                setRecords(res)
                getPurchaseOrderItems(res.id)
                setPurchaseOrderId(res.id)
                // getMRDocuments(res.id)                
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
        if(searchItem) request.params.SearchString = searchItem
        if(filterMaterialNumber) request.params.MaterialNumber = filterMaterialNumber
        if(itemStatus) request.params.Status = itemStatus
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                setPoLineItems(res.data)
                setTotalItems1(res.totalCount)
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    useEffect(() => {
        if(accessToken) getPurchaseOrderItems(purchaseOrderId) // eslint-disable-next-line
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
        if(filterMaterialNumber) setFilterMaterialNumber("")
    }    

    useEffect(() => {
        if(accessToken && purchaseOrderNumber) {
            getPurchaseOrder()
            navigate("/freightforwarder/purchaseorders/"+purchaseOrderNumber)
        } // eslint-disable-next-line
    }, [purchaseOrderNumber, accessToken])    

    useEffect(() => {
        if(param.id) setPurchaseOrderNumber(param.id); // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(param.id) {
            const element = (document.getElementById("purchaseOrderNumber") as HTMLInputElement)
            if(element) (document.getElementById("purchaseOrderNumber") as HTMLInputElement).value = param.id
        } // eslint-disable-next-line
    }, [mainTab])

    const page = "Purchase Orders"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>   
                    <div className="main-inner">  
                        <div className="detail-top-section">
                            <div className="d-flex-center">
                                {mainTab !== "preview" &&<div style={{display: "flex", padding: "16px"}}>
                                    <div className="search-container">
                                        <span className="material-symbols-rounded">search</span>
                                        <input id="purchaseOrderNumber" placeholder="Search Purchase Orders"/>
                                    </div>
                                    <button className="custom-button orange left-item ml-2"
                                        onClick={() => setPurchaseOrderNumber((document.getElementById("purchaseOrderNumber") as HTMLInputElement)?.value)}
                                        >Search</button>
                                </div>}                                
                            </div>

                            {mainTab === "preview" && 
                            <div className="actions" >
                                <p onClick={() => setMainTab("mrd")}><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
                            </div>}
                                
                            <div className="tab">                                
                                {mainTab !== "preview" && <>
                                    <div className={mainTab === "items" ? "tab-item active" : "tab-item"}
                                        onClick={() => setMainTab("items")}>
                                        <span className="material-symbols-rounded">format_list_numbered</span>
                                        <p>Purchase Order Items</p>
                                    </div>
                                    <div className={mainTab === "summary" ? "tab-item active" : "tab-item"}
                                        onClick={() => setMainTab("summary")}>
                                        <span className="material-symbols-rounded">contract</span>
                                        <p>Purchase Order Summary</p>
                                    </div> 
                                </> }   
                                
                                {mainTab === "preview" && <>
                                    <div className={subTab === "invoice" ? "tab-item active" : "tab-item"} onClick={() => setSubTab("invoice")}>
                                        <span className="material-symbols-rounded">receipt_long</span>
                                        <p>Preview Commercial Invoice</p>
                                    </div>
                                    <div className={subTab === "packinglist" ? "tab-item active" : "tab-item"} onClick={() => setSubTab("packinglist")}>
                                        <span className="material-symbols-rounded">list_alt</span>
                                        <p>Preview Packing List</p>
                                    </div>
                                </> }                                                          
                            </div>                          
                        </div> 
                    </div> 

                    {!purchaseOrder && <div className="main-inner" style={{minHeight: "calc(100vh - 160px)"}}>
                        <p style={{fontSize: "12px", padding: "24px", color: "3e3e3e"}}>Search Purchase Order Number to Filter Items</p>
                    </div>}

                    {purchaseOrder && <div className="main-inner mt-1" style={{minHeight: "calc(100vh - 160px)"}}>                  
                        {mainTab === "summary" && <div className="form-view-container">
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
                                        <div className='form-item span-col-2'>
                                            <label>Buyer Email</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerEmail} />
                                        </div>
                                        {/* <div className='form-item'>
                                            <label>Buyer Reference</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerReference} />
                                        </div> */}
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
                        {mainTab === "items" && <div style={{minHeight: "calc(100vh - 160px)"}}>
                            <div className="inside d-flex">
                                <div className="card">
                                    <img src={number} alt="" width="40px" height="40px" />
                                    <div>
                                        <p>Purchase Order Number</p>
                                        <span>{purchaseOrder?.purchaseOrderNumber}</span>
                                    </div>
                                </div>                                
                                <div className="card">
                                    <img src={date} alt="" width="40px" height="40px" />
                                    <div>
                                        <p>Date</p>
                                        <span>{formatDateTime(purchaseOrder ? purchaseOrder?.createdDate : "")}</span>
                                    </div>
                                </div> 
                                <div className="card">
                                    <img src={person} alt="" width="40px" height="40px" />
                                    <div>
                                        <p>Buyer Name</p>
                                        <span>{truncateText(purchaseOrder?.buyerName, 24)}</span>
                                    </div>
                                </div>
                                <div className="card">
                                    <img src={status} alt="" width="40px" height="40px" />
                                    <div>
                                        <p>Total Order Amount</p>
                                        <span>{formatCurrency(purchaseOrder?.totalAmountOfOrder)}</span>
                                    </div>
                                </div>                               
                            </div>
                            <div className='table-container custom mt-2'>
                                <div className="filter-container">
                                    <div className="search-container">
                                        <span className="material-symbols-rounded" style={{fontSize: "16px"}}>search</span>
                                        <input id="searchitem" placeholder="Search" onChange={(e) => {if(e.target.value.length < 1) setSearchItem("")}}/>
                                    </div>
                                    <select id="itemstatus">
                                        {
                                            POItemSupplyStatus().map((status: StatusProp, index: number) => (
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
                                            <th>Item No</th>
                                            <th>Material No</th>
                                            <th>Material Description</th>
                                            <th>Delivery Date</th>
                                            <th>Quantity</th>
                                            <th>Unit</th>
                                            <th>Unit Price {!!poLineItems ? `(${getCurrencySymbol(poLineItems[0]?.currency)})` : ""}</th>
                                            <th>Net Amount {!!poLineItems ? `(${getCurrencySymbol(poLineItems[0]?.currency)})` : ""}</th>
                                            <th>Manufacturer Part No</th>
                                            <th>Manufacturer</th>
                                            <th style={{ position: "sticky"}}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            poLineItems?.map((data, i) => {
                                                return (
                                                    <tr>
                                                        <td>{ data.purchaseOrderItemNumber }</td>
                                                        <td><span onClick={() => handleCopy(data.materialNumber)} className="material-symbols-outlined mr-2" style={{fontSize: "16px", cursor: "pointer"}}>content_copy</span>{ data.materialNumber }</td>
                                                        <td>{ data.materialDescription }</td>
                                                        <td className="no-textwrap">{  formatDateTime(data.deliveryDate) }</td>
                                                        <td>{ data.quantity }</td>
                                                        <td>{ data.unit }</td>                                                    
                                                        <td>{ formatCurrency(data.unitPrice) }</td>
                                                        <td>{ formatCurrency(data.netAmount) }</td>
                                                        <td>{ data.manufacturerPartNumber }</td>
                                                        <td className="no-textwrap ">{ data.manufacturer }</td>
                                                        <td className={"status "+ getPurchaseOrderItemStatus(data.status)?.color}>{getPurchaseOrderItemStatus(data.status)?.value}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            {false ? <div className="loader">
                                        <img src={loading} alt="loading" />
                                        <p>Loading data...</p>
                                    </div> : null}

                            <div className="pagination-container">
                                <Pagination
                                currentPage={currentPage1}
                                itemsPerPage={itemsPerPage1}
                                totalPages={totalPages1}
                                handlePrevious={handlePrevious1}
                                handleNext={handleNext1}
                                setCurrentPage={setCurrentPage1}
                                getPageNumbers={getPageNumbers1}
                                setItemsPerPage={setItemsPerPage1} />
                            </div>
                        </div>}
                    </div>}                                 
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