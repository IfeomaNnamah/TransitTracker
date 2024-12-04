import { FormEvent, useEffect, useRef, useState } from "react";
import { makeGetRequest, makePostRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { areArraysEqual, customStyles, formatCurrency, formatDateTime, GUID, } from "helpers";
import Pagination from "components/Pagination";
import loading from "../../../../assets/images/loading.gif"
import { POLineItems, SelectedPOLineItems } from "interfaces/purchaseorder.interface";
import { useSelector } from "react-redux";
import Modal from 'react-modal'


const  CreatePackage = (props: any) => {
    const {countryOfSupply, destination, getPackages, countries, packages} = props

    const user: any = useSelector((state: any)=> state.tepngUser.value)
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const [isLoading, setIsLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [poLineItems, setPoLineItems] = useState<POLineItems[]>()
    const [selectedPoLineItems, setSelectedPoLineItems] = useState<SelectedPOLineItems[]>([])
    const [materialConfirmationModal, setMaterialConfirmationModal] = useState(false)

    const handlePackageInputChange = (
        event: any,
        packageUID: string,
        purchaseOrderItemId?: string
    ) => {
        const { name, value } = event.target;
    
        setPackagesArray((prevItems) =>
            prevItems.map((item: any) => {
                if (item.id === packageUID) {
                    // Check if we're updating a purchaseOrderItem
                    if (purchaseOrderItemId) {
                        return {
                            ...item,
                            purchaseOrderItems: item.purchaseOrderItems.map(
                                (poItem: {id: string}) => {
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
                        // Otherwise, update the main package item
                        return {
                            ...item,
                            [name]: value,
                        };
                    }
                }
                return item;
            })
        );
    };

    const updateValuesSimultaneously = (event: any, purchaseOrderItemId: string) => {
        const { name, value } = event.target;
        setPackagesArray((prevPackages) =>
            prevPackages.map((packageItem) => ({
                ...packageItem,
                purchaseOrderItems: packageItem.purchaseOrderItems.map((poItem) =>
                    poItem.id === purchaseOrderItemId
                        ? {
                            ...poItem,
                            [name]: value, // Update only the matching item
                        }
                        : poItem
                ),
            }))
        );
    };  
    

    const [selectedTab, setSelectedTab] = useState("")
    const [packagesArray, setPackagesArray] = useState([{
        id: GUID(8),
        // packageNumber: , Should be dynamic
        length: "",
        height: "",
        width: "",
        cubicMeter: "",
        grossWeight: "",        
        purchaseOrderItems: [] as SelectedPOLineItems[],
        error: "",
        info: ""
    }])

    const resetPackages = () => {
        const data = {
            id: GUID(8),
            length: "",
            height: "",
            width: "",
            cubicMeter: "",
            grossWeight: "",
            purchaseOrderItems: [],
            error: "",
            info: "" 
        }
        setPackagesArray([data])
        // To open package tab
        setSelectedTab(data.id)
    }

    const addPackageRow = () => {
        selectedPoLineItems.forEach((item: SelectedPOLineItems, index: number) => {
            if (packagesArray[0].purchaseOrderItems[index]) {
                item.harmonisedSystemCode = packagesArray[0].purchaseOrderItems[index].harmonisedSystemCode;
                item.countryOfOrigin = packagesArray[0].purchaseOrderItems[index].countryOfOrigin;
            }
        });
        
        setPackagesArray([...packagesArray, ({
            id: GUID(8),
            length: "",
            height: "",
            width: "",
            cubicMeter: "",
            grossWeight: "",
            purchaseOrderItems: selectedPoLineItems,
            error: "",
            info: ""
        })])
    }

    const removePackageRow = (packageUID: string) => {
        setPackagesArray(prevFiles => prevFiles.filter(row => row.id !== packageUID));
        // Remove item from purchaseOrderItems based on packageUID
        setPackagesArray((prevPackages) =>
            prevPackages.map((packageItem) => ({
                ...packageItem,
                purchaseOrderItems: packageItem.purchaseOrderItems.filter(
                    (poItem) => poItem.materialNumber !== packageUID
                ),
            }))
        );
    };        

    const [currentPage1, setCurrentPage1] = useState(1);
    const [itemsPerPage1, setItemsPerPage1] = useState(100);
    const [totalItems1, setTotalItems1] = useState(0);
    const totalPages1 = Math.ceil(totalItems1 / itemsPerPage1);

    const handlePrevious1 = () => {if (currentPage1 > 1) setCurrentPage1(currentPage1 - 1)}
    const handleNext1 = () => {if (currentPage1 < totalPages1) setCurrentPage1(currentPage1 + 1)}
    const getPageNumbers1 = () => {
        const pageNumbers1 = [];
        for (let i = 1; i <= totalPages1; i++) {pageNumbers1.push(i);}
        return pageNumbers1;
    };

    const newPackageForm = () => {
        // setPackageData({})
        resetPackages()
        setPoLineItems([])
        setSelectedPoLineItems([])
        setSearchValue("");
        (document.getElementById("purchaseOrderNumber") as HTMLInputElement).value = "";
    }

    const getPurchaseOrder = () => {
        setIsLoading(true)
        resetPackages()
        var request: Record<string, any> = {
            what: "getPurchaseOrder",
            id: searchValue,
            params: {
                UserId: user?.id,
                destination: destination
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data  
                if(packages){
                    const purchaseOrderNumbers = packages.map((data: any) => data.purchaseOrderItemSupplies[0].purchaseOrderItem?.purchaseOrderNumber)
                    if(purchaseOrderNumbers.includes(res.purchaseOrderNumber)) {
                        toast.warning(`Package already created with Purchase Order Number ${res.purchaseOrderNumber}`)
                        setPoLineItems([])
                    }
                    else 
                    getPurchaseOrderItems(res.id);
                    // {
                    //     // THE LOGIC TO ENSURE ALL PURCHASE ORDERS HAVE THE SAME FF OR NO FF HAS BEEN ASSIGNED YET                
                    
                    //     // It checks if its the first searched purchase order or not                        
                    //     if(packages.length === 0) getPurchaseOrderItems(res.id);
                        
                    //     // check if the freight forwarder in the newly searched purchase order is same as the existing one or a freight forwarder hasn't been assigned yet
                    //     else if(packages.filter((purchaseOrder: any) => purchaseOrder.freightForwarderId === res.data?.freightForwarderId).length > 0
                    //         || res.data?.freightForwarderId === "") {
                    //         getPurchaseOrderItems(res.id);
                    //     }  else toast.error(`The freight forwarder in purchase order ${res.data?.purchaseOrderNumber} differs from those used in previous orders.`) 
                    // }
                }
                setIsLoading(false)
            })
            .catch((error:any) => {
                toast.error(error.msg)
                setPoLineItems([])
                setIsLoading(false)
            });
    }

    useEffect(() =>{
        // Clear the selected PO line items when the PO number changes
       if(selectedPoLineItems[0]?.purchaseOrderNumber !== searchValue && selectedPoLineItems.length > 0) setSelectedPoLineItems([])
        //eslint-disable-next-line
    }, [poLineItems])

    const getPurchaseOrderItems = (itemId: String) => {
        setIsLoading(true)
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
                setIsLoading(false)
                const res = response.data
                if(res) {
                    const purchaseOrderItems = res.data
                    //check through each items freightForwarderId, and replace the id with FF{index} in the array, if any two ids are the same give them the same index number
                    const freightForwarderIds = purchaseOrderItems.map((item: any) => item.freightForwarderId)
                    const uniqueIds = Array.from(new Set(freightForwarderIds))
                    const uniqueIdsWithIndex = uniqueIds.map((id: any, index: number) => ({ id, index }))
                    const mappedPurchaseOrderItems = purchaseOrderItems.map((item: any) => {
                        //check of the item.item.freightForwarderId is empty else return item
                        if(!item.freightForwarderId) return item
                        else {
                            const index = uniqueIdsWithIndex.find((ffId: any) => ffId.id === item.freightForwarderId)?.index
                            return { ...item, freightForwarderId: `FF ${index}` }
                        }
                    })

                    setPoLineItems(mappedPurchaseOrderItems)                 
                    setTotalItems1(res.totalCount)
                }
                else setPoLineItems([])
            })
            .catch((error:any) => 
                toast.error(error)
            );
    }

    const handleSearch = (event: any) => {
        const value = event.target.value
        if(!value) setSearchValue("")
    }

    const [selectedItem, setSelectedItem] = useState<SelectedPOLineItems>({
        id: "",
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
        isChecked: false,
        requestedQuantity: "",
        modeOfTransportation: ""
    })
    const handleCheck = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target
        if(checked){
            const item: any = poLineItems?.find((item) => item.materialNumber === value)
            const selectedItem:SelectedPOLineItems = {
                id:item?.id,
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
                modeOfTransportation: item?.modeOfTransportation
            }
            setSelectedItem(selectedItem)            
            setMaterialConfirmationModal(true)
        }else {
            var remainingItems = selectedPoLineItems.filter((item:any) => item.materialNumber !== value)
            setSelectedPoLineItems(remainingItems)

            // Remove item from purchaseOrderItems based on materialNumber
            setPackagesArray((prevPackages) =>
                prevPackages.map((packageItem) => ({
                    ...packageItem,
                    purchaseOrderItems: packageItem.purchaseOrderItems.filter(
                        (poItem) => poItem.materialNumber !== value
                    ),
                }))
            );
        }
    }

    const handlePurchaseOrderItemCheck = (e:React.ChangeEvent<HTMLInputElement>, packageUID: string, purchaseOrderItemId: string) => {
        const { checked } = e.target
        setPackagesArray((prevItems) =>
            prevItems.map((item: any) => {
                if (item.id === packageUID) {
                    return {
                        ...item,
                        purchaseOrderItems: item.purchaseOrderItems.map(
                            (poItem: { id: string }) => {
                                if (poItem.id === purchaseOrderItemId) {
                                    return {
                                        ...poItem,
                                        isChecked: checked, // Set isChecked directly based on the `checked` value
                                        quantity: ""
                                    };
                                }
                                return poItem;
                            }
                        ),
                    };
                }
                return item;
            })
        );
        
    }    

    const handleMaterialCOnfirmation = (response: boolean) => { 
        if(response) {
            //check that the packagearray items modeofshipping is same as the one in the selectedItem
            // selectedItem.modeOfTransportation = packagesArray.find((item:any) => item.id === selectedItem.id)?.modeOfTransportation
            const setPurchaseOrderItems = () => {
                setSelectedPoLineItems([...selectedPoLineItems, selectedItem]); 
                setPackagesArray((prevPackages) =>
                    prevPackages.map((packageItem:any) => ({
                        ...packageItem,
                        purchaseOrderItems: [
                            ...packageItem.purchaseOrderItems,
                            selectedItem,
                        ],
                    }))
                );
            }            

            if(packagesArray.length > 0) {                
                const isModeOfTransportationSame = packagesArray[packagesArray.length - 1].purchaseOrderItems.every((item: any) => item.modeOfTransportation === selectedItem.modeOfTransportation)
                if(isModeOfTransportationSame) setPurchaseOrderItems()
                else toast.error("You cannot add items with varying shipment modes. Kindly choose another item.")
            }else{
                setPurchaseOrderItems()
            }
            setMaterialConfirmationModal(false)
        }
    }
   
    const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>, packageUID: string, purchaseOrderItemId: string) => {
        const { name, value } = event.target;
        const selectedItem: any = poLineItems?.find((item) => item.id === purchaseOrderItemId)          
        const suppliedQty = selectedItem.purchaseOrderItemSupplies.reduce((acc: number, item: any) => acc + Number(item.quantity), 0)
        
        setPackagesArray((prevItems) =>
            prevItems.map((item: any) => {
                if (item.id === packageUID) {
                    // Check if we're updating a purchaseOrderItem
                    if (purchaseOrderItemId) {
                        return {
                            ...item,
                            purchaseOrderItems: item.purchaseOrderItems.map(
                                (poItem: {id: string, oustandingQuantity: number}) => {
                                    if (poItem.id === purchaseOrderItemId && (Number(value) <= (selectedItem.quantity - suppliedQty))) { 
                                        return {
                                            ...poItem,
                                            [name]: value,
                                        };                                       
                                    }
                                    return poItem;
                                }
                            ),
                        };
                    } 

                }
                return item;
            })
        );
    };

    // const [totalUnitPrice, setTotalUnitPrice] = useState<number>(0);
    // const [sumTotal, setSumTotal] = useState<number>(0);
    // useEffect(() => {
    //     // Calculate total unit price whenever packageArray changes
    //     // check each package purchaseOrderItems if it has been checked, get the sum of only checked items
    //     const newUnitPriceTotal = packagesArray.reduce((acc, packageItem) => {
    //         const checkedItems = packageItem.purchaseOrderItems.filter((poItem) => poItem.isChecked);
    //         return acc + checkedItems.reduce((itemAcc, item) => itemAcc + parseFloat(item.unitPrice), 0);
    //     }, 0);

    //     // check each package purchaseOrderItems if it has been checked, get the sum of only checked items and update each package totalUnitPrice
        
    //     const newTotal = packagesArray.reduce((acc, packageItem) => {
    //         const checkedItems = packageItem.purchaseOrderItems.filter((poItem) => poItem.isChecked);
    //         return acc + checkedItems.reduce((itemAcc, item) => itemAcc + (parseInt(item.quantity) * parseFloat(item.unitPrice)), 0);
    //     }, 0);

    //     setTotalUnitPrice(newUnitPriceTotal);
    //     setSumTotal(newTotal);
    //     //eslint-disable-next-line
    // }, [packagesArray]);

    const getSuppliedQuantity = (item: any) => {
        return item?.reduce((acc: number, item: any) => acc + Number(item.quantity), 0)
    }

    const getStatusColor = (suppliedQty: number, requestedQty: number) => {
        if(suppliedQty === 0) return "yellow"
        if(suppliedQty < requestedQty) return "red"
        if(suppliedQty === requestedQty) return "green"
    }
    const hasMatchingMaterialNumber = (selectedMaterialNumber: string) => {
        return packagesArray.some((packageItem: any) =>
            packageItem.purchaseOrderItems.some(
                (poItem: {materialNumber: string}) => poItem.materialNumber === selectedMaterialNumber
            )
        );
    };
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
                    // checked={!!selectedPoLineItems.find(item => item.materialNumber === data.materialNumber)}/>
                    checked={hasMatchingMaterialNumber(data.materialNumber)}/>
                </td>
                <td>Item { data.purchaseOrderItemNumber }</td>
                <td>{ data.materialNumber }</td>
                <td>{ data.materialDescription }</td>
                <td>{ data.quantity }</td>
                <td>{ data.unit }</td>
                {data.modeOfTransportation==="SEA" && <td>
                    <span className="material-symbols-rounded" style={{marginRight:"8px", marginTop: "-10px", fontSize: "18px"}}>sailing</span>
                    <span>Sea</span>
                    </td>}
                {data.modeOfTransportation==="AIR" && <td>
                    <span className="material-symbols-rounded" style={{marginRight:"8px", marginTop: "-10px", fontSize: "18px"}}>travel</span>
                    <span>Air</span>
                    </td>}
                <td>{ data.freightForwarderId ?? "N/A" }</td>
                <td>{ formatCurrency(data.unitPrice) }</td>
                <td>{ formatCurrency(data.netAmount) }</td>                
                <td className="no-textwrap">{ formatDateTime(data.deliveryDate) }</td>
                <td>{ data.manufacturerPartNumber }</td>
                <td className="no-textwrap ">{ data.manufacturer }</td>
                <td style={{ position: "sticky", textAlign: "center", right: '0'}} 
                    className={`status ${getStatusColor(getSuppliedQuantity(data.purchaseOrderItemSupplies), Number(data.quantity))}`}>
                    <strong>{ getSuppliedQuantity(data.purchaseOrderItemSupplies) } / {data.quantity}</strong>
                </td>

            </tr>
        )
    })   

    const isDataComplete = (data: any) => {
        // Check that all top-level fields are provided (not empty)
        const allFieldsProvided = Object.keys(data)
                .filter(key => (key !== "error" && key !== "info")) // Exclude the "error" key
                .every(key => data[key]);
    
        // Check that all checked items have all required fields but unchecked items can have only harmonisedSystemCode and countryOfOrigin
        const allPurchaseOrderItemsComplete = 
            data.purchaseOrderItems.some((poItem: any) => poItem.isChecked) && // Check at least one item is checked
            data.purchaseOrderItems.every((poItem: any) => 
                poItem.isChecked 
                    ? (poItem.harmonisedSystemCode && poItem.countryOfOrigin && poItem.quantity) // Checked items must have all fields
                    : (poItem.harmonisedSystemCode && poItem.countryOfOrigin) // Unchecked items must have all but quantity
            );

    
        // Return true if both checks pass
        return allFieldsProvided && allPurchaseOrderItemsComplete;
    };

    const isDataCompleteForPackages = (packages: any[]) => {
        return packages.every((packageItem) => {
            // Check that all top-level fields in each package are provided (not empty)
            // const allFieldsProvided = Object.values(packageItem).every(value => value);
            const allFieldsProvided = Object.keys(packageItem)
                .filter(key => (key !== "error" && key !== "info")) // Exclude the "error" key
                .every(key => packageItem[key]);
    
            // Check that all checked items have all required fields but unchecked items can have only harmonisedSystemCode and countryOfOrigin
            const allPurchaseOrderItemsComplete = 
                packageItem.purchaseOrderItems.some((poItem: any) => poItem.isChecked) && // Check at least one item is checked
                packageItem.purchaseOrderItems.every((poItem: any) => 
                    poItem.isChecked 
                        ? (poItem.harmonisedSystemCode && poItem.countryOfOrigin && poItem.quantity) // Checked items must have all fields
                        : (poItem.harmonisedSystemCode && poItem.countryOfOrigin) // Unchecked items must have all but quantity
                );

            // const noOutstandingQuantity = packages[packages.length - 1].purchaseOrderItems
            //    .every((poItem: any) => Number(poItem.outstandingQuantity) === 0)

            // Return true if both checks pass for this package
            return allFieldsProvided && allPurchaseOrderItemsComplete 
            //&& noOutstandingQuantity;
        });
    };

    const [isOpenSubmitWithOutstandingConfirmation, setIsOpenSubmitWithOutstandingConfirmation] = useState(false)
    // formattedForValidation should be packagesArray with other infortion plus error key
    const formattedForValidation = packagesArray.map((packageA: any) => ({
        ...packageA,
        error: "",
        info: ""
    }));
    const handlePackageOutstandingCheck = (event?: FormEvent) => {
        event?.preventDefault();
        
        // Check that last package items have outstanding as zero
        const noOutstandingQuantity = packagesArray[packagesArray.length - 1].purchaseOrderItems
                                        .filter((poItem: any) => poItem.isChecked) // Filter only checked items
                                        .every((poItem: any) => poItem.outstandingQuantity === 0);  
        // formattedForValidation.forEach((index: number) => {
        //     if (!noOutstandingQuantity && index === packagesArray.length - 1) {
        //         packagesArray[index]["info"] = "Some item(s) have an outstanding quantity.";
        //     }else {
        //         packagesArray[index]["info"] = "";
        //     }
        // })
        if(noOutstandingQuantity === false && isDataCompleteForPackages(packagesArray)) {
            setIsOpenSubmitWithOutstandingConfirmation(true)
        }else HandleCreatePackage()        
    }
    const HandleCreatePackage = () => {       
        formattedForValidation.forEach((packageA: any, index: number) => {
            // Check if all top-level fields are filled
            const allFieldsProvided = Object.keys(packageA)
                .filter(key => (key !== "error" && key !== "info")) // Exclude the "error" key
                .every(key => packageA[key]);
        
            // Check that all checked items have both harmonisedSystemCode and countryOfOrigin
            const allPurchaseOrderItemsComplete = 
                packageA.purchaseOrderItems.some((poItem: any) => poItem.isChecked) && // Check at least one item is checked
                packageA.purchaseOrderItems
                    .filter((poItem: any) => poItem.isChecked) // Filter only checked items
                    .every((poItem: any) => poItem.harmonisedSystemCode && poItem.countryOfOrigin && poItem.quantity); // Validate required fields

            // Update error message based on validation results
            if (!allFieldsProvided) {
                packagesArray[index]["error"] = "Kindly fill all the required fields.";
            } else if (!allPurchaseOrderItemsComplete) {
                packagesArray[index]["error"] = "Kindly check atleast one item and fill all the required fields for the checked item(s).";
            } else {
                packagesArray[index]["error"] = "";
            }
        });

        //open the first found package with error
        const packagesWithError = packagesArray.filter((packageA: any) => packageA.error !== "");
        setSelectedTab(packagesWithError[0]?.id)

        //package data manipulation
        const newPackagesArray = packagesArray.map((packageA: any) => ({
            // packageNumber: `Package ${index + 1}`,
            length: packageA.length,
            width: packageA.width,
            height: packageA.height,
            cubicMeter: packageA.cubicMeter,
            grossWeight: packageA.grossWeight,
            purchaseOrderNumber: packageA.purchaseOrderItems[0].purchaseOrderNumber,
            purchaseOrderItems: packageA.purchaseOrderItems
                .filter((item: any) => item.isChecked)
                .map((poItem: any) => ({
                    purchaseOrderItemRequestId: poItem.id,
                    harmonisedSystemCode: poItem.harmonisedSystemCode,
                    quantity: poItem.quantity,
                    countryOfOrigin: poItem.countryOfOrigin,
                    currency: poItem.currency,                
                })),       
            totalUnitPrice: packageA.purchaseOrderItems
                            .filter((item: any) => item.isChecked)
                            .reduce((itemAcc:number, thisItem: any) => itemAcc + parseFloat(thisItem.unitPrice), 0),
            sumTotal: packageA.purchaseOrderItems
                            .filter((item: any) => item.isChecked)
                            .reduce((itemAcc:number, thisItem: any) => itemAcc + (parseInt(thisItem.quantity) * parseFloat(thisItem.unitPrice)), 0)     
        }))

        const data = {            
            userId: user?.id,
            destination: destination,
            packages: newPackagesArray
        }

        const areAllPackagesComplete = isDataCompleteForPackages(packagesArray);
        // console.log(areAllPackagesComplete, Object.values(data).every(value => value))
        // console.log(data)
        // console.log(newPackagesArray)
        
        if(Object.values(data).every(value => value) && areAllPackagesComplete){
            setIsLoading(true)
            setIsOpenSubmitWithOutstandingConfirmation(false)
            var request:Record<string, any> = {
                what: "CreateMultiplePackages",
                data: data
            }

            makePostRequest(request)
                .then((response: any) => {
                    document.getElementById("BackToTopTrigger")?.click();
                    setIsLoading(false)
                    toast.success(response.msg)
                    if (typeof getPackages === 'function') getPackages();
                    // new form
                    newPackageForm();
                }).catch((error:any) => {toast.error(error.msg)});
        }else toast.warning("Please provide information for all required fields"); setIsLoading(false)
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
                    const quantityRemaining = poItem.requestedQuantity - getSuppliedQuantity(poItem.purchaseOrderItemSupplies);
                    let outstandingQuantity;

                    if (index > 0) {
                        const previousOutstanding = packagesArray[index - 1].purchaseOrderItems[poItemIndex]?.outstandingQuantity || 0;
                        outstandingQuantity = previousOutstanding - (poItem.quantity || 0);
                    } else {
                        outstandingQuantity = quantityRemaining - (poItem.quantity || 0);
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

    // useEffect(() => {
    //     setPackagesArray((prevItems) =>
    //         prevItems.map((pck: any, index: number) => {
    //             return {
    //                 ...pck,
    //                 purchaseOrderItems: pck.purchaseOrderItems.map((poItem: any, poItemIndex: number) => {
    //                     const quantityRemaining = poItem.requestedQuantity - getSuppliedQuantity(poItem.purchaseOrderItemSupplies);
        
    //                     let outstandingQuantity;
        
    //                     if (index > 0) {
    //                         // For packages after the first, subtract quantity from the previous package's outstandingQuantity
    //                         const previousOutstanding = prevItems[index - 1].purchaseOrderItems[poItemIndex]?.outstandingQuantity || 0;
    //                         outstandingQuantity = previousOutstanding - (poItem.quantity || 0);
    //                     } else {
    //                         // For the first package, calculate based on quantityRemaining
    //                         outstandingQuantity = quantityRemaining - (poItem.quantity || 0);
    //                     }
        
    //                     return {
    //                         ...poItem,
    //                         outstandingQuantity,
    //                     };
    //                 }),
    //             };
    //         })
    //     );
    // }, [packagesArray])
    
    useEffect(() => {
        if(accessToken && searchValue) getPurchaseOrder() 
        
        //eslint-disable-next-line
    }, [accessToken, searchValue, currentPage1, itemsPerPage1])

    useEffect(() => {
        //Always start from the top of the page
        document.getElementById("BackToTopTrigger")?.click();
    }, [])

    return (
        <div>
            <form onSubmit={handlePackageOutstandingCheck}>                
                <div className="main-inner">                 
                    <div className="main-inner-top d-flex-center">
                        <div className="d-flex">
                            <div className="search-container">
                                <span className="material-symbols-rounded">search</span>
                                <input id="purchaseOrderNumber" placeholder="Search Purchase Order Number" style={{width: "200px"}} onKeyUp={handleSearch} />
                            </div>
                            <button type="button" className="custom-button orange left-item ml-2" style={{height: "35px"}}
                                onClick={() => setSearchValue((document.getElementById("purchaseOrderNumber") as HTMLInputElement)?.value)}
                                >Search</button>
                        </div>
                    </div>

                    <div className='table-container custom' style={{height: "calc(100vh - 160px)"}}>
                        <table>
                            <thead>
                                <tr className="no-textwrap">
                                    <th></th>
                                    <th>Item No</th>
                                    <th>Material No</th>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Shipment Mode</th>
                                    <th>Freight Forwarder</th>
                                    {/* get curency of the first line item which is same as all the items in that po */}
                                    <th>Unit Price {!!poLineItems ? `(${poLineItems[0]?.currency})` : ""}</th>
                                    <th>Net Amount {!!poLineItems ? `(${poLineItems[0]?.currency})` : ""}</th>
                                    
                                    <th>Delivery Date</th>
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
                        {isLoading ? <div className="loader">
                                    <img src={loading} alt="loading" />
                                    <p>Loading data...</p>
                                </div> : null}  
                                                                  
                    </div>
                    <div style={{height:"4px"}}></div> 
                    {false && <div className="pagination-container">
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

                <div className="form-view-container main-inner mt-1" style={{padding: "16px", margin: 0, boxSizing: "border-box"}}>
                    <p style={{padding: "16px 0 0 16px", margin: 0, fontSize: "12px", fontWeight: "500"}}>
                        Package Management
                    </p>
                {
                    packagesArray?.map((packageA: any, index: number) => {
                        return (
                            <div style={{margin: "16px", border:"1px solid #d9d9d9", borderRadius: "6px"}} key={index}>
                                <div className="d-flex" style={{fontSize: "12px", backgroundColor: "#f4f7fc", padding: "12px", borderRadius: "6px 6px 0 0", cursor: "pointer"}}
                                    onClick={() => setSelectedTab(prevTab => (prevTab === packageA?.id ? "" : packageA?.id))}>
                                    <div className="d-flex-2" style={{cursor: "pointer"}} >
                                        <span className="material-symbols-rounded">{selectedTab === packageA?.id ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
                                        <span className="fw-500">Package {index+1}</span>
                                    </div>
                                    {(packageA?.error || packageA?.info) && <div className={`${packageA?.error ? "text-red" : "text-blue"} d-flex-2 gap-2`}>
                                        <span className="material-symbols-rounded f-16">{packageA?.error ? "error" : "info"}</span>
                                        <span>{packageA.error ? packageA.error : packageA.info}</span>
                                    </div>}
                                </div>
                                {selectedTab === packageA?.id && <div className='table-container custom' style={{minHeight: "300px", maxHeight: "440px", borderTop: "1px solid #d9d9d9", borderRadius: "0"}}>
                                    <table>
                                        <thead style={{position:"sticky", top:0 }}>
                                            <tr className="no-textwrap">
                                                <th className="no-border" style={{width: "5%", paddingLeft: "16px"}}>#</th>
                                                <th className="no-border" >Item No</th>
                                                <th className="no-border" >Material No</th>
                                                <th className="no-border" >HS Code <small className="text-blue">(Must be 10-digits)</small></th>
                                                {index===0 && <th className="no-border" >Supplied</th>}                                            
                                                <th className="no-border" >Quantity</th>
                                                <th className="no-border" >Outstanding</th>
                                                <th className="no-border" >Manufacturer's Country of Origin</th>
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
                                                                    disabled={(data.outstandingQuantity === 0 && data.quantity === "")}
                                                                    value={data.isChecked} 
                                                                    onChange={(event) => handlePurchaseOrderItemCheck(event, packageA?.id, data.id)} 
                                                                    checked={data?.isChecked} />
                                                                </td>
                                                                <td>Item { data.purchaseOrderItemNumber }</td>
                                                                <td>{ data.materialNumber }</td>                                                                
                                                                <td>
                                                                    <input type="text" className={`custom-input ${data?.harmonisedSystemCode?.length === 10 ? "text-green" : "text-red"}`} 
                                                                        name="harmonisedSystemCode"
                                                                        required
                                                                        maxLength={10} 
                                                                        style={{width: "110px"}}
                                                                        // onChange={(event) => handlePackageInputChange(event, packageA?.id, data.id)} 
                                                                        onChange={(event) => updateValuesSimultaneously(event, data.id)}
                                                                        disabled={index>0}
                                                                        value={data.harmonisedSystemCode} />
                                                                </td>
                                                                {index===0 &&<td>{getSuppliedQuantity(data.purchaseOrderItemSupplies)}/{data?.requestedQuantity}</td>}                                                                
                                                                <td>
                                                                    <input type="text" className={"custom-input"} 
                                                                        name="quantity"
                                                                        required={data?.isChecked}
                                                                        id={`input-${data.materialNumber}`}
                                                                        style={{width: "16px"}}
                                                                        onChange={(e) => handleQtyChange(e, packageA?.id, data.id)} 
                                                                        value={data.quantity} 
                                                                        disabled={!data.isChecked}
                                                                        title={!data.isChecked ? "Check item to enable input" : ""}
                                                                        />
                                                                </td>
                                                                <td>
                                                                    {data?.outstandingQuantity}
                                                                </td>
                                                                <td>
                                                                    <select name="countryOfOrigin" value={data.countryOfOrigin} required style={{width: "250px"}}
                                                                        // onChange={(event) => handlePackageInputChange(event, packageA?.id, data.id)}
                                                                        onChange={(event) => updateValuesSimultaneously(event, data.id)}
                                                                        disabled={index>0}
                                                                        >
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
                                                            </tr>
                                                        )
                                                    })
                                                }
                                        </tbody>
                                    </table>
                                </div>}
                                {/* {selectedTab === packageA?.id && <span className="text-blue d-flex-center" style={{fontSize: "10px", margin: "8px 0", marginBottom: "32px"}}><sup>*</sup>You cannot enter a quantity greater than the requested quantity.</span>} */}
                               
                                {selectedTab === packageA?.id && <div className="form-view-container for-packages" style={{borderTop: "1px solid #e4e4e4"}}>
                                    <div className='d-grid-5'>   
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX ?.lengthmr-2">*</span>Length (CM)</label>
                                            <input name="length" 
                                                value={packageA.length} 
                                                onChange={(event) => handlePackageInputChange(event, packageA.id)} 
                                                type='text' 
                                                required />
                                        </div>
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX ?.lengthmr-2">*</span>Width (CM)</label>
                                            <input name="width" 
                                                value={packageA.width} 
                                                onChange={(event) => handlePackageInputChange(event, packageA.id)} 
                                                type='text' 
                                                required />
                                        </div>
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX ?.lengthmr-2">*</span>Height (CM)</label>
                                            <input name="height" 
                                                value={packageA.height} 
                                                onChange={(event) => handlePackageInputChange(event, packageA.id)} 
                                                type='text' 
                                                required />
                                        </div>
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX ?.lengthmr-2">*</span>Cubic Meter (M<sup>3</sup>)</label>
                                            <input name="cubicMeter" 
                                                value={packageA.cubicMeter} 
                                                onChange={(event) => handlePackageInputChange(event, packageA.id)}
                                                type='text' 
                                                required />
                                        </div> 
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX ?.lengthmr-2">*</span>Gross Weight (KG)</label>
                                            <input name="grossWeight" 
                                                value={packageA.grossWeight} 
                                                onChange={(event) => handlePackageInputChange(event, packageA.id)} 
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
                {packagesArray?.length === 1 &&<div className="alert alert-info" style={{margin: "12px 16px", padding: "8px", width: "auto"}}>
                    <span className="material-symbols-outlined mr-2" style={{color: "#004085", fontSize: "16px"}}>info</span>
                    <p style={{margin: 0, fontSize: "11px"}}>Please ensure to complete the first package, as the HS Code and Country of Origin will apply to the other packages.</p>
                </div>}
                {/* Add Package  */}
                <div className="d-flex-center" style={{padding: "12px 8px", borderTop: "1px solid #d9d9d9"}}>
                    <button className={`actions blue-text ${isDataComplete(packagesArray[0]) ? "" : "disabled"}`} type="button" disabled={!isDataComplete(packagesArray[0])} onClick={() => addPackageRow()}>
                        <span className="material-symbols-outlined f-16">add</span>
                        <span>Add Package</span>
                    </button>
                </div>
                </div> 

                <div className="main-inner d-flex-center mt-1" style={{padding: "16px 0"}}>
                    <div className="gap-2 d-flex">
                        <button type="button" className="custom-button grey-outline" onClick={() => newPackageForm()}>Cancel</button>                 
                        <button type="submit" className="custom-button orange" style={{height: "35px"}} disabled={isLoading}>
                        Submit Package(s) For PO {poLineItems ? poLineItems[0]?.purchaseOrderNumber: null}
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
                    <p style={{lineHeight: "1.5em"}}>You are confirming that <strong>Item {selectedItem.purchaseOrderItemNumber} with Material Number {selectedItem.materialNumber}</strong> can be picked up from <strong>{countryOfSupply}.</strong></p>
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => setMaterialConfirmationModal(false)}>Cancel</button>
                    <button type="submit" className="custom-button orange"
                        onClick={() => handleMaterialCOnfirmation(true)}>Yes</button>
                </div>
            </Modal>

            <Modal isOpen={isOpenSubmitWithOutstandingConfirmation} style={customStyles} className="modal modal-4" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Are you sure you want to submit the package(s) with some items that have an outstanding quantity?</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => setIsOpenSubmitWithOutstandingConfirmation(false)}>close</span>
                </div>
                <div className="modal-footer">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => setIsOpenSubmitWithOutstandingConfirmation(false)}>Cancel</button>
                    <button type="submit" className="custom-button orange"
                        onClick={() => HandleCreatePackage()}>Yes</button>
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

export default CreatePackage