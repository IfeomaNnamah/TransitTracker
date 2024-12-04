import { FormEvent, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loading from "../../../assets/images/loading.gif"
// import { SelectedPOLineItems } from "../../../interfaces/purchaseorder.interface";
import { makeGetRequest, makePostRequest } from "../../../request";
import { useSelector } from "react-redux";
import { customStyles, destinations, formatCurrency, getCurrencySymbol } from "../../../helpers";
import Modal from "react-modal"
import Layout from "../../Layout";

const CreateConsolidatedDocument =  () => {
    const navigate = useNavigate()
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const [selectedPoLineItems, setSelectedPoLineItems] = useState<Record <string, any>[]>([])    
    const [formData, setFormData] = useState<Record<string, any>>({
        countryOfSupply: "",
        countryOfOrigin: "",
        modeOfShipping: "SEA",
        destination: "",
        soldTo: "",
        shipTo: "",
        supplier: "",
        formM: "",
        baNumber: "",
        freightForwarderId: "",
        totalUnitPrice: 0,
        sumTotal: 0,
        purchaseOrderItemSupplies: [],
        currency: ""
    })
    const [errorData, setErrorData] = useState<Record<string, string>>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formattedPurchaseOrderItems, setFormattedPurchaseOrderItems] = useState([])
    const [isPurchaseOrderItemsPresentForSea, setIsPurchaseOrderItemsPresentForSea] = useState<boolean>()
    const [isPurchaseOrderItemsPresentForAir, setIsPurchaseOrderItemsPresentForAir] = useState<boolean>()
    const [packagesForSea, setPackagesForSea] = useState<Record<string, any>>()
    const [packagesForAir, setPackagesForAir] = useState<Record<string, any>>()    

    const getPurchaseOrderItemsFromPackages = () => {
        setIsLoading(true)
        var request: Record<string, any> = {
            what: "getPurchaseOrderItemsFromPackages",
            params: {
                FreightForwarderId: user.id,
                Destination: formData.destination
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                const res = response.data.data // returns packing list
                if(!res.length) toast.warning("No records found for consolidation!")

                const PackinglistForSea = res.filter((packinglist: any) => 
                    packinglist.packages[0].purchaseOrderItemSupplies
                        .map((item: any) => !Object.values(item).every((item: any) => 
                            item.modeOfTransportation === "SEA"))
                    );
                // get packing list for those pos with initial mode of transportation as AIR
                const PackinglistForAir = res.filter((packinglist: any) => 
                    packinglist.packages[0].purchaseOrderItemSupplies.some((item: any) => 
                      item.modeOfTransportation === "AIR" && item.modeOfTransportationChangeStatus === null
                    )
                );
                // get packing list for pos with APPROVED mode of transportation change request
                const PackinglistForModeOfChangeRequestAir = res.filter((packinglist: any) => 
                    packinglist.packages[0].purchaseOrderItemSupplies.some((item: any) => 
                      item.modeOfTransportationChangeStatus === "Approved"
                    )
                );

                const BothPackingListForAir = PackinglistForAir.concat(PackinglistForModeOfChangeRequestAir)
                // console.log("BothPackingListForAir", BothPackingListForAir)

                // Initiate all values to be collected.
                let soldToValues: any[] = [];
                let shipToValues: any[] = [];
                let supplierValues: any[] = [];
                let countryOfSupplyValues: any[] = [];
                
                if(formData.modeOfShipping === "SEA") {
                    // Lopp through data to retrieve distinct values from each mrd.
                    PackinglistForSea.forEach((item: any) => {
                        if (!soldToValues.includes(item.soldTo)) soldToValues.push(item.soldTo);
                        if (!shipToValues.includes(item.shipTo)) shipToValues.push(item.shipTo);
                        if (!supplierValues.includes(item.supplier)) supplierValues.push(item.supplier);
                        if (!countryOfSupplyValues.includes(item.countryOfSupply)) countryOfSupplyValues.push(item.countryOfSupply);
                    });
                }else if(formData.modeOfShipping === "AIR"){
                    BothPackingListForAir.forEach((item: any) => {
                        if (!soldToValues.includes(item.soldTo)) soldToValues.push(item.soldTo);
                        if (!shipToValues.includes(item.shipTo)) shipToValues.push(item.shipTo);
                        if (!supplierValues.includes(item.supplier)) supplierValues.push(item.supplier);
                        if (!countryOfSupplyValues.includes(item.countryOfSupply)) countryOfSupplyValues.push(item.countryOfSupply);
                    });
                }

                const packages = res.map((item:any) => item.packages)                
                const purchaseOrderItemSupplies = packages.flat().map((data:any) => data.purchaseOrderItemSupplies)

                // Get all the packages where all or some of purchaseOrderItemSupplies have their modeOfTransportation as SEA.
                setPackagesForSea(packages.flat().filter((pack: any) => Object.values(pack.purchaseOrderItemSupplies).every((item: any) => item.modeOfTransportation === "SEA")))
                const formattedItems = purchaseOrderItemSupplies.flat().map((item:any) => ({
                    id: item.id,
                    harmonisedSystemCode: item.harmonisedSystemCode,
                    // modeOfTranportationChangeRequestData: item.modeOfTranportationChangeRequestData, // to be included in the request
                    modeOfTransportationChangeId: item.modeOfTransportationChangeId,
                    purchaseOrderNumber: item.purchaseOrderItem.purchaseOrderNumber,
                    purchaseOrderItemNumber: item.purchaseOrderItem.purchaseOrderItemNumber,
                    purchaseOrderItemId: item.purchaseOrderItem.id,
                    materialNumber: item.purchaseOrderItem.materialNumber,
                    materialDescription: item.purchaseOrderItem.materialDescription,
                    unitPrice: item.purchaseOrderItem.unitPrice,
                    quantity: item.quantity,
                    modeOfTransportation: item.modeOfTransportation,
                    modeOfTransportationChange: item.purchaseOrderItem.modeOfTransportationChange,
                    countryOfOrigin: item.countryOfOrigin,
                    currency: item.currency
                }))
                setFormattedPurchaseOrderItems(formattedItems)

                const PurchaseOrderItemsForSea = formattedItems.filter((item:any) => item.modeOfTransportation === "SEA")
                const PurchaseOrderItemsForAir = formattedItems.filter((item:any) => item.modeOfTransportation === "AIR")
                setIsPurchaseOrderItemsPresentForSea(!!formattedItems.filter((item:any) => item.modeOfTransportation === "SEA").length)
                setIsPurchaseOrderItemsPresentForAir(!!formattedItems.filter((item:any) => item.modeOfTransportation === "AIR").length)
                
                // Set items to display for either SEA or AIR
                if(formData.modeOfShipping === "SEA") setSelectedPoLineItems(PurchaseOrderItemsForSea)
                if(formData.modeOfShipping === "AIR") setSelectedPoLineItems(PurchaseOrderItemsForAir)

                setFormData({...formData,
                    soldTo: soldToValues.join(";"),
                    shipTo: shipToValues.join(";"),
                    supplier: supplierValues.join(";"),
                    currency: formattedItems[0]?.currency,
                    modeOfShipping: BothPackingListForAir.length ? "AIR" : "SEA",
                    // countryOfOrigin: purchaseOrderItemSupplies.flat().map((item:any) => item.countryOfOrigin),
                    countryOfOrigin: formData.modeOfShipping === "SEA" ? PurchaseOrderItemsForSea.map((item:any) => item.countryOfOrigin).join(", ") 
                        : formData.modeOfShipping === "AIR" ? PurchaseOrderItemsForAir.map((item:any) => item.countryOfOrigin).join(", ") : "",
                    countryOfSupply: countryOfSupplyValues.join(", "),
                    purchaseOrderItemSupplies: formData.modeOfShipping === "SEA" ? PurchaseOrderItemsForSea.map((item:any) => item.id) : PurchaseOrderItemsForAir.map((item:any) => item.id)
                })
                
                // Getting the values for AIR packages to create the corresponding packages
                // For the items that have their default modeOfTransportation as AIR, get the package info from the MRD package                
                // For the items that mode of transportation has been changed, get the package info from the MOT package                
                if(formData.modeOfShipping === "AIR"){  
                    const packagesForDefaultAir = PackinglistForAir.flatMap((packinglist: { packages: any; }) => packinglist.packages)
                                                    ?.map((data: any) => ({
                                                        length: data?.length,    
                                                        width: data?.width,
                                                        height: data?.height,
                                                        grossWeight: data?.grossWeight,
                                                        purchaseOrderItems: data?.purchaseOrderItemSupplies,
                                                        cubicMeter: data?.cubicMeter,
                                                        id: data?.id, //package id
                                                    }))

                    // the packages have to be gotten from the motchange package details
                    const packagesForMOTChangeAir = PackinglistForModeOfChangeRequestAir
                                                        ?.flatMap((packinglist: { packages: any; }) => packinglist.packages)
                                                        ?.flatMap((itemSupplies: { purchaseOrderItemSupplies: any; }) => itemSupplies?.purchaseOrderItemSupplies)
                                                        ?.flatMap((poItem: { purchaseOrderItem: any; }) => poItem?.purchaseOrderItem?.modeOfTransportationChange?.modeOfTransportationPackageDetails)
                                                        ?.map((data: any) => ({
                                                            length: data?.estimatedDimension?.split("x")[0].trim(),    
                                                            width: data?.estimatedDimension?.split("x")[1].trim(),
                                                            height: data?.estimatedDimension?.split("x")[2].trim(),
                                                            grossWeight: data?.estimatedWeight,
                                                            purchaseOrderItems: data?.packageItemForModeOfTransportation,
                                                            cubicMeter: data?.cubicMeters, 
                                                            id: data?.modeOfTransportationId, //motId
                                                        }))

                    // console.log("Default", packagesForDefaultAir) // default Air - get package details
                    // console.log("MOT ",packagesForMOTChangeAir) // default Air - get package details

                    const BothPackagesForAir = packagesForDefaultAir.concat(packagesForMOTChangeAir)
                    setPackagesForAir(BothPackagesForAir)

                    // const MOTs = PurchaseOrderItemsForAir?.map((item: any) => ({
                    //     modeOfTransportation: item.modeOfTransportationChange,
                    //     purchaseOrderItemId: item.purchaseOrderItemId,
                    // }))                                     

                    // // Group the MOTs by modeOfTransportationId
                    // const groupedData = PurchaseOrderItemsForAir.reduce((acc: any, obj: any) => {
                    //     const key = obj.id;
                    //     if (!acc[key]) {
                    //         acc[key] = [];
                    //     }
                    //     acc[key].push(obj);
                    //     return acc;
                    // }, {});

                    // Format the MOTs to imitate packages
                    // const formattedMots: any = [];
                    // const seenIds = new Set();
                    // MOTs.forEach((res: any) => {
                        
                    //     const modeOfTransportationChange = res.modeOfTransportation
                    //     if (seenIds.has(modeOfTransportationChange.id)) return;
                    //     seenIds.add(modeOfTransportationChange.id);                        
                    //     const dimensions = modeOfTransportationChange.estimatedDimensions ? modeOfTransportationChange.estimatedDimensions.split("x") : [] // length x width x height
                    //     const isDimensionsAvailable = dimensions.length > 0
                    //     formattedMots.push({
                    //         length: isDimensionsAvailable ? dimensions[0].trim() : 0,
                    //         width: isDimensionsAvailable ? dimensions[1].trim() : 0,
                    //         height: isDimensionsAvailable ? dimensions[2].trim() : 0,
                    //         grossWeight: modeOfTransportationChange.estimatedWeight,
                    //         purchaseOrderItemIds: groupedData[modeOfTransportationChange.id].map((item: any) => item.purchaseOrderItemId),
                    //         // packingListId: modeOfTransportation.packingListId,
                    //         cubicMeter: 0, // change this
                    //         id: modeOfTransportationChange.id,
                    //     });
                        
                    // });
                    // setPackagesForAir(formattedMots)
                }
            })
            .catch((error:any) => 
                toast.error(error)
            );
    }

    const handleInputChange = (e: any) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value})
    }

    const [packagesWithoutConsolidatedDocumentId, setPackagesWithoutConsolidatedDocumentId] = useState<Record<string, any>>([])
    const [newPackagesIdForAir, setNewPackagesIdForAir] = useState([])
    const getPackages = () => {
        var request: Record<string, any> = {
            what: "getPackageForFreightForwader",
            id: user.id
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                const purchaseOrderItemIdsFromNewPackages: any = []

                res.forEach((item: any) => {
                    purchaseOrderItemIdsFromNewPackages.push(item.purchaseOrderItemSupplies.map((data: any) => data.purchaseOrderItemId))            
                })
                setPackagesWithoutConsolidatedDocumentId(purchaseOrderItemIdsFromNewPackages)
                setNewPackagesIdForAir(res.map((item: any) => item.id))
            })
            .catch((error:any) => 
                toast.error(error)
            );
    }

    const HandleCreatePackage = (event: any, packageData: any) => {
        event.target.disabled = true   
        setIsLoading(true)
        // const PurchaseOrderItemsForAir = formattedPurchaseOrderItems.filter((item:any) => item.modeOfTransportation === "AIR")
        // const itemsInPackage = PurchaseOrderItemsForAir.filter((itemForAir: any) => itemForAir.modeOfTransportationChangeId === packageData.id)

        // const formattedItemsInPackage = itemsInPackage.map((item: any) => ({
        //     id: item.id,
        //     harmonisedSystemCode: item.harmonisedSystemCode,
        // }))
        const data = {
            // purchaseOrderItems: formattedItemsInPackage.map((item) => ({
            //     id: item.id, //requestId
            //     harmonisedSystemCode: item.harmonisedSystemCode,
            // })),
            purchaseOrderItems: packageData?.purchaseOrderItems.map((item: {id: string, harmonisedSystemCode: string}) => ({
                    id: item.id,
                    harmonisedSystemCode: item.harmonisedSystemCode,
                })),
            length: packageData.length,
            width: packageData.width,
            height: packageData.height,
            packageNumber: "1",
            grossWeight: packageData.grossWeight,
            cubicMeter: packageData.cubicMeter,
            userId: user.id,
            destination: formData.destination
        };

        var request:Record<string, any> = {
            what: "CreatePackageForAirConsolidation",
            data: data
        }
        makePostRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                event.target.disabled = false 
                toast.success(response.msg)
                getPackages()

            }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }
    
    const HandleCreateConsolidatedDocument = (e: FormEvent) => {
        e.preventDefault()
        if(!formData.formM || formData.baNumber!) setFormData({...formData, modeOfShipping: "AIR"})
        const PurchaseOrderItemsForSea = formattedPurchaseOrderItems.filter((item:any) => item.modeOfTransportation === "SEA")
        const PurchaseOrderItemsForAir = formattedPurchaseOrderItems.filter((item:any) => item.modeOfTransportation === "AIR")
        const data: any = {
            countryOfSupply: formData.countryOfSupply,
            countryOfOrigin: formData.countryOfOrigin,
            destination: formData.destination,
            soldTo: formData.soldTo,
            shipTo: formData.shipTo,
            supplier: formData.supplier,
            seaMode: {
                packageIds: packagesForSea?.map((data:any) => data.id),
                purchaseOrderItemSupplies: PurchaseOrderItemsForSea.map((item:any) => item.id),
                totalUnitPrice: PurchaseOrderItemsForSea?.reduce((acc:number, item:any) => acc + parseFloat(item.unitPrice), 0).toFixed(2),
                sumTotal: PurchaseOrderItemsForSea?.reduce((acc:number, item:any) => acc +  (Number(item.quantity) * Number(item.unitPrice)), 0).toFixed(2),
            },
            freightForwarderId: user.id,          
        }          
        
        if(isPurchaseOrderItemsPresentForAir){
            data.airMode = {
                formM: formData.formM,
                baNumber: formData.baNumber,
                packageIds: newPackagesIdForAir,
                purchaseOrderItemSupplies: PurchaseOrderItemsForAir.map((item:any) => item.id),
                totalUnitPrice: PurchaseOrderItemsForAir?.reduce((acc:number, item:any) => acc + parseFloat(item.unitPrice), 0).toFixed(2),
                sumTotal: PurchaseOrderItemsForAir?.reduce((acc:number, item:any) => acc +  (Number(item.quantity) * Number(item.unitPrice)), 0).toFixed(2),
            }
        }

        if (Object.values(data).every(value => value) ){
            setIsSubmitting(true)
            var request:Record<string, any> = {
                what: "CreateConsolidatedDocuments",
                data: data
            };      

            makePostRequest(request)
                .then(() => {   
                    navigate("/freightforwarder/consolidateddocuments")                    
                })
                .catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});          
        }else toast.warning("Please provide information for all required fields")
    }

    useEffect(() => {
        if(accessToken && formData.destination) getPurchaseOrderItemsFromPackages() //eslint-disable-next-line
    }, [accessToken, formData.modeOfShipping, formData.destination])

    useEffect(() => {
        if(accessToken) getPackages() //eslint-disable-next-line
    }, [accessToken, formData.modeOfShipping === "AIR"])

    useEffect(() => {
        // Calculate total unit price whenever POLineItems changes
        const newUnitPriceTotal = selectedPoLineItems?.reduce((acc:number, item:any) => acc + parseFloat(item.unitPrice), 0);
        const newTotal = selectedPoLineItems?.reduce((acc:number, item:any) => acc +  (Number(item.quantity) * Number(item.unitPrice)), 0);
        setFormData({...formData, 
            totalUnitPrice: newUnitPriceTotal.toFixed(2), 
            sumTotal: newTotal});
        //eslint-disable-next-line
    }, [selectedPoLineItems]);

    const page = "Consolidated Documents"

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>     
                    
                    <div className="main-inner">                  
                        <div className="detail-top-section">
                            <div onClick={() => navigate("/freightforwarder/consolidateddocuments")} style={{width:"fit-content"}}>
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Consolidated Documents</p>
                            </div>
                              
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">receipt_long</span>
                                    <p>Create Consolidated Documents</p>
                                </div>
                            </div>                      
                        </div>                         
                    </div>
                    <div className="main-inner mt-1">   
                    <div className="form-view-container custom" style={{padding: "16px 4px"}}>
                        <div className="layout">
                            <div className="label">Select Destination</div>
                            <div className="body d-grid custom">  
                                <div className='form-item span-col-4'>
                                    <label>Destination <small className="text-red">(Required)</small></label>
                                    <select name="destination" value={formData.destination} onChange={handleInputChange} required>
                                        <option value="" disabled></option>
                                        {
                                            destinations.map((address: string, index: number) => {
                                                return (
                                                    <option key={index} value={address}>{ address }</option>
                                                )
                                            })
                                        }
                                    </select>
                                    <p className="error">{ errorData?.destination }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    <form onSubmit={HandleCreateConsolidatedDocument}> 
                        <div className="main-inner mt-1">
                            <div className="d-flex" style={{padding: "8px", fontWeight: "500", gap: "8px", borderBottom: "1px solid #d9d9d9"}}>
                                <button type="button" 
                                    onClick={() => setFormData({...formData, modeOfShipping: "SEA"})} 
                                    // Check if any items for SEA else disable sea tab
                                    disabled={!isPurchaseOrderItemsPresentForSea} 
                                    className={formData.modeOfShipping === "SEA" ? "two-column-tab active" : "two-column-tab"}>
                                        <span className="material-symbols-rounded">sailing</span> Preview Consolidation For Sea</button>
                                <button type="button" 
                                    onClick={() => setFormData({...formData, modeOfShipping: "AIR"})} 
                                    // Check if any items for AIR else disable air tab
                                    disabled={!isPurchaseOrderItemsPresentForAir} 
                                    className={formData.modeOfShipping === "AIR" ? "two-column-tab active" : "two-column-tab"}>
                                        <span className="material-symbols-rounded">travel</span> Preview Consolidation For Air</button>
                            </div>
                            {isPurchaseOrderItemsPresentForAir && 
                                <div className="alert alert-info" style={{margin: "8px", width: "auto",padding:"8px"}}>
                                    <span className="material-symbols-outlined mr-2">info</span>
                                    <p style={{margin: 0}}>Navigate to the "Preview Consolidation For AIR" tab, fill in the required fields and create all the necessary packages.</p>
                                </div>} 

                            <div className="form-view-container custom" style={{padding: "16px 4px"}}>
                                <div className="layout">
                                    <div className="label">Invoice Summary</div>
                                    <div className="body d-grid custom">  
                                        {formData.modeOfShipping === "AIR" && <>
                                            <div className='form-item span-col-2'>
                                                <label>Form M <small className="text-red">(Required)</small></label>
                                                <input required name="formM" value={formData?.formM} onChange={handleInputChange} type='text'
                                                    onKeyUp={() => {formData.formM.length < 1 && formData.modeOfShipping === "AIR" ? setErrorData({ ...errorData, formM: 'This field is required' }) : 
                                                    setErrorData({ ...errorData, formM: '' })}} />
                                                <p className="error">{ errorData?.formM }</p>
                                            </div> 

                                            <div className='form-item span-col-2'>
                                                <label>BA Number <small className="text-red">(Required)</small></label>
                                                <input required name="baNumber" value={formData?.baNumber} onChange={handleInputChange} type='text'
                                                    onKeyUp={() => {formData.baNumber.length < 1 && formData.modeOfShipping === "AIR" ? setErrorData({ ...errorData, baNumber: 'This field is required' }) : 
                                                    setErrorData({ ...errorData, baNumber: '' })}} />
                                                <p className="error">{ errorData?.baNumber }</p>
                                            </div> 
                                        </>}  
                                        <div className='form-item span-col-4'>
                                            <label>Sold To</label>
                                            <textarea className="mt-1 custom-input" rows={3} disabled value={formData.soldTo}></textarea>
                                            <p className="error">{ errorData?.soldTo }</p>
                                        </div>
                                        <div className='form-item span-col-4'>
                                            <label>Ship To</label>
                                            <textarea className="mt-1 custom-input" rows={3} disabled value={formData.shipTo}></textarea>
                                            <p className="error">{ errorData?.shipTo }</p>
                                        </div>
                                        <div className='form-item span-col-4'>
                                            <label>Suppliers</label>
                                            <textarea className="mt-1 custom-input" rows={3} disabled value={formData.supplier}></textarea>
                                            <p className="error">{ errorData?.supplier }</p>
                                        </div>

                                        <div className='form-item span-col-4'>
                                            <label>Country of Origin</label>
                                            <textarea className="mt-1 custom-input" rows={3} disabled value={formData.countryOfOrigin}></textarea>
                                            <p className="error">{ errorData?.countryOfOrigin }</p>
                                        </div>   
                                        <div className='form-item span-col-4'>
                                            <label>Country of Supply</label>
                                            <input type="text" disabled value={formData.countryOfSupply} />
                                            <p className="error">{ errorData?.countryOfSupply }</p>
                                        </div>                                      
                                    </div>                                          
                                </div>
                            </div>      

                            {(formData.modeOfShipping === "AIR" ? packagesForAir?.length > 0 : packagesForSea?.length > 0) && <div style={{borderTop: "1px solid #d9d9d9", borderBottom: "1px solid #d9d9d9"}}>  
                                <p style={{padding: "16px 0 0 12px", marginTop: "8px", fontSize: "12px", fontWeight: "500"}}>Packages</p>         
                                <div className='table-container custom' style={{minHeight: "350px"}}>
                                    <table>
                                        <thead>
                                            <tr className="no-textwrap">
                                                <th>Package</th>
                                                <th>Length (CM)</th>
                                                <th>Width (CM)</th>
                                                <th>Height (CM)</th>
                                                <th>Cubic Meter (M<sup>3</sup>)</th>
                                                <th>Gross Weight (KG)</th>
                                                {formData.modeOfShipping === "AIR" && <th>Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                (formData.modeOfShipping === "AIR" ? packagesForAir : packagesForSea)?.map((data:any, i:number) => {
                                                    return (
                                                        <tr key={i} >
                                                            <td>Package {i+1}</td>
                                                            <td>{data.length}</td>
                                                            <td>{data.width}</td>
                                                            <td>{data.height}</td>
                                                            <td>{data.cubicMeter}</td>                                                        
                                                            <td>{data.grossWeight}</td>
                                                            {formData.modeOfShipping === "AIR" && <td>
                                                                {/* Show button if the package hasn't already been created */}
                                                                {!data.purchaseOrderItemIds?.every((item: any) => (packagesWithoutConsolidatedDocumentId).some((subArr: any) => subArr.includes(item))) 
                                                                && <button type="button" className="custom-button blue-outline" onClick={(event) => HandleCreatePackage(event, data)}>Create Package</button>}
                                                            </td>}
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div> }

                            {selectedPoLineItems.length > 0 && <div>                 
                                <p style={{padding: "16px 0 0 12px", marginTop: "8px", fontSize: "12px", fontWeight: "500"}}>Purchase Order Items</p>
                                <div className='table-container custom' style={{minHeight: "350px"}}>
                                    <table>
                                        <thead>
                                            <tr className="no-textwrap">
                                                <th>SN</th>
                                                <th>Purchase Order Number</th>
                                                <th>Material Number</th>
                                                <th>Item Number</th>
                                                <th>Material Description</th>
                                                <th>HS Code</th>
                                                <th>Quantity</th>                                            
                                                <th>Unit Price</th>
                                                <th>Total <small className="info">*Calculated</small></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                selectedPoLineItems.sort((a, b) => a.purchaseOrderItemNumber - b.purchaseOrderItemNumber)?.map((data, i) => {
                                                    return (
                                                        <tr key={i} >
                                                            <td>{i+1}</td>
                                                            <td>{data.purchaseOrderNumber}</td>
                                                            <td>{data.materialNumber}</td>
                                                            <td>Item {data.purchaseOrderItemNumber}</td>                                                            
                                                            <td>{data.materialDescription}</td>
                                                            <td>{data.harmonisedSystemCode}</td>
                                                            <td>{data.quantity}</td>
                                                            <td>{getCurrencySymbol(data.currency)}{formatCurrency(data.unitPrice)}</td>
                                                            <td>{getCurrencySymbol(data.currency)}{formatCurrency(Number(data.unitPrice) * Number(data.quantity))}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                        <tbody>
                                            <tr style={{background: "transparent"}}>
                                                <td colSpan={6}></td>
                                                <td><strong>Total:</strong></td>
                                                <td><strong>{getCurrencySymbol(formData.currency)}{formatCurrency(formData?.totalUnitPrice)}</strong></td>
                                                <td><strong>{getCurrencySymbol(formData.currency)}{formatCurrency(formData?.sumTotal)}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>}    
                        </div>    

                        <div className="main-inner mt-1" style={{padding: "16px", boxSizing: "border-box"}}>
                            <button type="submit" className="custom-button orange"
                                disabled={(
                                    !formData.formM && !formData.baNumber && packagesForAir?.length) 
                                    || isSubmitting 
                                    || (packagesWithoutConsolidatedDocumentId.length < packagesForAir?.length
                                    || !packagesForSea?.length
                                    )}
                                style={{margin: "0 auto"}}>
                                <span className="material-symbols-rounded">web_traffic</span> {isSubmitting ? "Loading..." : "Create Consolidated Documents"}
                            </button>
                        </div>      
                </form>        
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

export default CreateConsolidatedDocument