import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import loading from "../../assets/images/loading.gif"
import status from "../../assets/images/total-icon.png"
import number from "../../assets/images/number-icon.png"
import date from "../../assets/images/date-icon.png"
import person from "../../assets/images/user-icon.png"
import {POLineItems, PurchaseOrderInfo } from "../../interfaces/purchaseorder.interface";
import { useDispatch, useSelector } from "react-redux";
import { makeGetRequest } from "../../request";
import { customStyles, formatCurrency, formatDateTime, getCurrencySymbol } from "../../helpers";
import Modal from "react-modal"
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Layout from "../Layout";
import { MRDInfo } from "../../interfaces/materialreadinessdocument.interface";
import { setPageContext } from "../../store/pageContext";

const PurchaseOrder =  () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const param = useParams()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const pageContext: any = useSelector((state: any)=> state.pageContext.value)
    const [purchaseOrder, setRecords] = useState<PurchaseOrderInfo| null>()
    const [poLineItems, setPoLineItems] = useState<POLineItems[]>()
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = () => {if (currentPage > 1) setCurrentPage(currentPage - 1)}
    const handleNext = () => {if (currentPage < totalPages) setCurrentPage(currentPage + 1)}
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {pageNumbers.push(i);}
        return pageNumbers;
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

    const [isLoading, setIsLoading] = useState(false)
    const [mainTab, setMainTab] = useState<string | null>("")
    const [subTab, setSubTab] = useState("invoice")
    const [mrdId, setMrdId] = useState("")
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

                if(res){
                    setRecords(res)
                    setPurchaseOrderId(res.id)
                    getMRDocuments(res.id)
                    setMrdId(res.id)
                    getPurchaseOrderItems(res.id)

                    dispatch(setPageContext({...pageContext, POFinalShippingAddress: res.finalShippingAddress}))

                }else setRecords(null); setPoLineItems([]); setTotalItems1(0); 
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    const [searchItem, setSearchItem] = useState("")
    const [filterMaterialNumber, setFilterMaterialNumber] = useState("")
    const getPurchaseOrderItems = (id: string) => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrderItems",
            id: purchaseOrderNumber,
            params: {
                Page: currentPage1,
                PageSize: itemsPerPage1,     
                PurchaseOrderId: id,  
            }
        };
        if(searchItem) {
            if(!currentPage1) setCurrentPage1(1)
            request.params.SearchString = searchItem
        }
        if(filterMaterialNumber) request.params.MaterialNumber = filterMaterialNumber
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                setPoLineItems(res.data)
                setTotalItems1(res.totalCount)
                setMainTab("items")
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    useEffect(() => {
        if(accessToken && purchaseOrderNumber) getPurchaseOrderItems(purchaseOrderId) // eslint-disable-next-line
    }, [searchItem, filterMaterialNumber, itemsPerPage1, currentPage1])

    const handleItemSearch = () => {
        const materialNumber = (document.getElementById("materialnumber") as HTMLInputElement)?.value
        const search = (document.getElementById("searchitem") as HTMLInputElement)?.value
        
        if(search) setSearchItem(search)
        if(materialNumber) setFilterMaterialNumber(materialNumber)
    }

    const [mrDocuments, setMrDocuments] = useState<MRDInfo[]>()
    const getMRDocuments = (id: string) => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getMRDForSupplier",
            params: {
                Page: currentPage,
                PageSize: itemsPerPage,
                PurchaseOrderId: id,
                SupplierId: user.id,
                OrderBy: 2                
            }
        };
        if(searchValue) request.params.SeachString = searchValue
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data
                setMrDocuments(res.data)
                toast.success(res.msg)
                setTotalItems(res.totalCount)
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setIsLoading(false)
            });
    }

    const [searchValue, setSearchValue] = useState("")
    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }
    useEffect(() => {
        if(searchValue) getMRDocuments(mrdId) // eslint-disable-next-line
    }, [searchValue])

    useEffect(() => {
        if(accessToken && purchaseOrderNumber) {
            getPurchaseOrder()
            navigate("/supplier/purchaseorders/"+purchaseOrderNumber)
        } // eslint-disable-next-line
    }, [purchaseOrderNumber, accessToken, currentPage1, itemsPerPage1])    

    const queryParams = new URLSearchParams(window.location.search); 
    useEffect(() => {
        if(queryParams.get("tab")) setMainTab(queryParams.get("tab"))
        else {
            if(!pageContext || pageContext.tab === undefined) setMainTab("items")
            else setMainTab(pageContext.tab)
        }

        if(param.id) setPurchaseOrderNumber(param.id ? param.id : ""); // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(param.id) {
            const element = (document.getElementById("purchaseOrderNumber") as HTMLInputElement)
            if(element) (document.getElementById("purchaseOrderNumber") as HTMLInputElement).value = param.id
        } // eslint-disable-next-line
    }, [mainTab, document.getElementById("purchaseOrderNumber")])

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

    // const sortedItems = poLineItems?.sort((a, b) => {
    //     const fieldA: any = a[sortOrder.field as keyof POLineItems];
    //     const fieldB: any = b[sortOrder.field as keyof POLineItems];
    //     const compareResult = sortOrder.ascending
    //         ? fieldA - fieldB
    //         : fieldB - fieldA

    //     return compareResult || 0;
    // });

    const [openFeedbackModal, setOpenFeedbackModal] = useState(false)
    const [feedback, setFeedback] = useState("")
    const [openClaimModal, setOpenClaimModal] = useState(false)
    const [claim, setClaim] = useState("")

    const getSuppliedQuantity = (item: any) => {
        return item.reduce((acc: number, item: any) => acc + Number(item.quantity), 0)
    }

    const getStatusColor = (suppliedQty: number, requestedQty: number) => {
        if(suppliedQty === 0) return "yellow"
        if(suppliedQty < requestedQty) return "red"
        if(suppliedQty === requestedQty) return "green"
    }

    const getPOCStatus = (createdDate: string, supplierApproval: (string | null)) => {
        if(createdDate) {
            switch(supplierApproval){
                case "PENDING":
                    return {statusClass: "status yellow", status: "Pending"}
                
                case "ACKNOWLEDGED":
                    return {statusClass: "status green", status: "Acknowledged"}

                default:
                    return {statusClass: "status yellow", status: "Pending"}
            }
        }
        else return {statusClass: "", status: "N/A"}
    }

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
                                        onClick={() => {setPurchaseOrderNumber((document.getElementById("purchaseOrderNumber") as HTMLInputElement)?.value); setCurrentPage1(1)}}
                                        >Search</button>
                                </div>}                                
                            </div>

                            {mainTab === "preview" && 
                                <div className="actions" onClick={() => setMainTab("mrd")}>
                                    <p><span className="material-symbols-rounded">arrow_back</span> Back to Material Readiness Documents</p>
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
                                    {/* <div className={mainTab === "mrd" ? "tab-item active" : "tab-item"}
                                        onClick={() => setMainTab("mrd")}>
                                        <span className="material-symbols-rounded">upload_file</span>
                                        <p>Material Readiness Document</p>
                                    </div> */}
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
                        <p style={{fontSize: "12px", padding: "24px", color: "#929292"}}>
                            {purchaseOrderNumber && !isLoading ? `No Records Found with Purchase Order Number ${purchaseOrderNumber}` : "Search Purchase Order Number to Filter Items"}
                        </p>
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
                                            <label>Incoterms</label>
                                            <input type='text' disabled value="" />
                                        </div>
                                        {/* <div className='form-item'>
                                            <label>Buyer Name</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerName} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Buyer Email</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerEmail} />
                                        </div>
                                        <div className='form-item'>
                                            <label>Buyer Reference</label>
                                            <input type='text' disabled value={purchaseOrder?.buyerReference} />
                                        </div> */}
                                        <div className='form-item'>
                                            <label>Supplier Reference</label>
                                            <input type='text' disabled value={purchaseOrder?.supplierReference} />
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
                        {mainTab === "items" && <div style={{minHeight: "400px"}}>
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
                                    <img src={status} alt="" width="40px" height="40px" />
                                    <div>
                                        <p>Total Order Amount</p>
                                        <span>{getCurrencySymbol(purchaseOrder?.purchaseOrderItems[0]?.currency)}{formatCurrency(purchaseOrder?.totalAmountOfOrder)}</span>
                                    </div>
                                </div> 
                                <div className="card">
                                    <img src={person} alt="" width="36px" height="36px" />
                                    <div>
                                        <p>Final Shipping Address</p>
                                        <span>{purchaseOrder?.finalShippingAddress}</span>
                                    </div>
                                </div>                                   
                            </div>
                            <div className='table-container custom mt-2' style={{minHeight: "750px"}}>
                                <div className="filter-container">
                                    <div className="search-container">
                                        <span className="material-symbols-rounded" style={{fontSize: "16px"}}>search</span>
                                        <input id="searchitem" placeholder="Search" onChange={(e) => {if(e.target.value.length < 1) setSearchItem("")}}/>
                                    </div>
                                    {/* <select id="itemstatus">
                                        {
                                            POItemSupplyStatus().map((status: StatusProp, index: number) => (
                                                <option key={index} value={status.value}>
                                                  {status.name}
                                                </option>
                                            ))
                                        }
                                    </select> */}
                                    <div className="custom-button orange" style={{height: "18px"}} onClick={() => handleItemSearch()}>Search</div>
                                    {/* <div className={(!searchItem && !filterMaterialNumber) ? "actions blue disabled" : "actions blue"} onClick={() => clearFilters()}>
                                        <span className="material-symbols-rounded">filter_alt_off</span>
                                        Clear Filters</div> */}
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
                                            <th>Unit Price ({purchaseOrder?.purchaseOrderItems[0]?.currency})</th>
                                            <th>Net Amount ({purchaseOrder?.purchaseOrderItems[0]?.currency})</th>
                                            <th>Shipment Mode</th>
                                            <th>Manufacturer Part No</th>
                                            <th>Manufacturer</th>
                                            <th style={{ position: "sticky", right: '0', zIndex: '1'}}>Supplied Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            poLineItems?.map((data, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td style={{paddingLeft: "40px"}}>Item { data.purchaseOrderItemNumber }</td>
                                                        <td>
                                                            <span title="Copy Material Number"
                                                                onClick={() => handleCopy(data.materialNumber)} 
                                                                className="material-symbols-outlined mr-2" 
                                                                style={{fontSize: "16px", cursor: "pointer"}}>content_copy
                                                            </span>{ data.materialNumber }
                                                        </td>
                                                        <td>{ data.materialDescription }</td>
                                                        <td className="no-textwrap">{  formatDateTime(data.deliveryDate) }</td>
                                                        <td>{ data.quantity }</td>
                                                        <td>{ data.unit }</td>                                                    
                                                        <td>{ formatCurrency(data.unitPrice) }</td>
                                                        <td>{ formatCurrency(data.netAmount) }</td>
                                                        {data.modeOfTransportation==="SEA" && <td>
                                                            <span className="material-symbols-rounded" style={{marginRight:"8px", marginTop: "-10px", fontSize: "18px"}}>sailing</span>
                                                            <span>Sea</span>
                                                            </td>}
                                                        {data.modeOfTransportation==="AIR" && <td>
                                                            <span className="material-symbols-rounded" style={{marginRight:"8px", marginTop: "-10px", fontSize: "18px"}}>flight</span>
                                                            <span>Air</span>
                                                            </td>}
                                                        <td>{ data.manufacturerPartNumber }</td>
                                                        <td className="no-textwrap ">{ data.manufacturer }</td>
                                                        {/* <td className="status pending">{getStatus(data.status)}</td> */}
                                                        <td style={{ position: "sticky", textAlign: "center", right: '0'}} 
                                                            className={`status ${getStatusColor(getSuppliedQuantity(data.purchaseOrderItemSupplies), Number(data.quantity))}`}>
                                                            <strong>{ getSuppliedQuantity(data.purchaseOrderItemSupplies) } / {data.quantity}</strong>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>                          
                            </div>
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
                        </div> }
                        {mainTab === "mrd" && <div className="main-inner">   
                            <div className="d-flex" style={{ padding: "12px", boxSizing: "border-box"}}>
                                <div className="d-flex">
                                    <div className="search-container">
                                        <span className="material-symbols-rounded">search</span>
                                        <input id="mrdNumber" placeholder="Search MRD Number" onKeyUp={handleSearch} />
                                    </div>
                                    <button className="custom-button orange left-item ml-2"
                                        onClick={() => setSearchValue((document.getElementById("mrdNumber") as HTMLInputElement)?.value)}
                                        >Search</button>
                                </div>

                                <div className="custom-button orange" onClick={() => navigate("/supplier/create/materialreadinessdocument/"+purchaseOrder.id)} style={{height: "20px"}}>
                                    <span className="material-symbols-rounded fw-600">add</span>Create Material Readiness Document
                                </div>
                            </div> 
                            <div className='table-container' style={{minHeight: "360px"}}>
                                <table>
                                    <thead>
                                        <tr className="no-textwrap">
                                            <th>SN</th>
                                            <th>MRD Number</th>
                                            <th>Issuance Date</th>
                                            <th>Destination</th>
                                            <th>Proof of Collection Status</th>
                                            <th>Feedback</th>
                                            <th>Discrepancy</th>
                                            <th style={{width: "150px"}}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mrDocuments?.map((data, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{ currentPage === 1 ? currentPage + index : (((itemsPerPage*currentPage)-itemsPerPage)+1) + index }</td>
                                                        <td>{ data?.mrdNumber }</td>
                                                        <td>{ formatDateTime(data?.createdDate) }</td>
                                                        <td>{ data.commercialInvoice.destination }</td>
                                                        <td><span className={getPOCStatus(data.proofOfCollection.createdDate, data.proofOfCollection.supplierApproval)?.statusClass}>
                                                            {getPOCStatus(data.proofOfCollection.createdDate, data.proofOfCollection.supplierApproval)?.status}</span></td>
                                                                                                                                                                       
                                                        {data.comment && <td><span className="custom-button blue-outline" onClick={() => {setOpenFeedbackModal(true); setFeedback(data.comment)}}>View</span></td>}
                                                        {!data.comment && <td>N/A</td>}
                                                        {data.claim && <td><span className="custom-button blue-outline" onClick={() => {setOpenClaimModal(true); setClaim(data.claim)}}>View</span></td>}
                                                        {!data.claim && <td>N/A</td>}

                                                        <td>
                                                            <div className="dropdown">
                                                                <button className="dropbtn-2"><span className="material-symbols-outlined" style={{fontSize: "24px"}}>more_horiz</span></button>
                                                                <div className="dropdown-content">
                                                                    <button
                                                                    onClick={() => navigate("/supplier/view/materialreadinessdocument/"+data.id)}
                                                                    >View Documents</button>
                                                                    <button
                                                                    disabled={data.comment || data.claim ? false : true}
                                                                    onClick={() => navigate(`/supplier/update/materialreadinessdocument/${data.id}`)}
                                                                    >Update MRD</button>
                                                                    <button
                                                                    disabled={data.proofOfCollection.createdDate === null}
                                                                    onClick={() => {navigate(`/supplier/approval/${data.purchaseOrderNumber}/proofofcollection/${data.proofOfCollection.id}`) }}
                                                                    >View Proof of Collection</button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination-container">
                                <Pagination
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                totalPages={totalPages}
                                handlePrevious={handlePrevious}
                                handleNext={handleNext}
                                setCurrentPage={setCurrentPage}
                                getPageNumbers={getPageNumbers}
                                setItemsPerPage={setItemsPerPage} />
                            </div>
                        </div> }
                    </div> }                                     
                </div>
                <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p>Loading data...</p>
                    </div>
                </Modal> 

                <Modal isOpen={openFeedbackModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3>Feedback</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => setOpenFeedbackModal(false)}>close</span>
                    </div>
                    <div className="modal-body" style={{height: "120px", overflowY: "auto"}}>
                        <p style={{margin: 0}}>{feedback}</p>
                    </div>
                </Modal>

                <Modal isOpen={openClaimModal} style={customStyles} className="modal modal-3" ariaHideApp={false}>
                    <div className="modal-header">
                        <h3 style={{display: "flex", alignItems: "center", gap: "6px"}}>Discrepancy</h3>
                        <span className="material-symbols-rounded close"
                            onClick={() => setOpenClaimModal(false)}>close</span>
                    </div>
                    <div className="modal-body" style={{minHeight: "120px", fontSize: "12px"}}>
                        {claim}
                    </div>
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    )
}

export default PurchaseOrder