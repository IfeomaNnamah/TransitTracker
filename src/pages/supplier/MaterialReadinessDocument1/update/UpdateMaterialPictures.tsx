import { FormEvent, useEffect, useState } from "react";
import { makePostRequest } from "request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import loading from "../../../../assets/images/loading.gif"
import Modal from 'react-modal'
import { useSelector } from "react-redux";
import { GUID, customStyles } from "helpers";


const UpdateMaterialPictures = (props: any) => {
    const { packageDetails, handleDownloadClick, getMaterialReadinessDocumentById } = props

    // const user: any = useSelector((state: any)=> state.tepngUser.value)
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    // const [isLoading, setIsLoading] = useState(false)
    const [uploadModal, setUploadModal] = useState(false)
    const [purchaseOrderItemSupplyId, setPurchaseOrderItemSupplyId] = useState("")
    const [poLineItems, setPoLineItems] = useState<Record <string, any>>([])
    const [files, setFiles] = useState<{ id: string; type: string; file: string }[]>([]);
    const [prevFiles, setPrevFiles] = useState<{ id: string; type: string; file: string }[]>([]);

    const addFile = () => {
        setFiles([...files, ({
            id: GUID(4),
            type: "",
            file: ""
        })])
    }

    const removeFile = (id: string) => {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    };

    const handleChange = (event: any, id: string) => {        
        const { name, value } = event.target //get data form each input on change
        setFiles(prevFiles => prevFiles.map(file => 
            file.id === id ? { ...file, [name]: value } : file
        ));
    }

    const handleFileChange = (event: any, id: string) => {
        const { name, files } = event.target;
        let selectedFile = files[0];
    
        let file = selectedFile.name.split(".");
        const fileFormat = file ? file[file.length - 1] : "";
        
        // Define allowed formats
        const allowedFormats = ["zip", "png", "jpeg", "pdf", "jpg"];
        const maxFileSize = 10 * 1024 * 1024; // 10 MB in bytes
        
        if (allowedFormats.includes(fileFormat)) {
            if (selectedFile.size <= maxFileSize) {
                // File is within size limit
                setFiles((prevFiles) =>
                    prevFiles.map((file) =>
                        file.id === id ? { ...file, [name]: selectedFile } : file
                    )
                );
            } else {
                // File exceeds size limit
                toast.error("File size exceeds 10 MB. Please upload a smaller file.");
                const element = event.target as HTMLInputElement;
                element.value = ""; // Clear the file input
            }
        } else {
            // Invalid file format
            if (fileFormat) {
                toast.error(
                    "Attempted to upload an invalid file format. Please re-upload with a valid format (zip, png, jpeg, pdf, jpg)."
                );
            }
            const element = event.target as HTMLInputElement;
            element.value = ""; // Clear the file input
        }
    };
    
    // const getPackage = () => {
    //     setIsLoading(true)
    //     var request: Record<string, any> = {
    //         what: "getPackage",
    //         id: packageDetails.packageId,
    //         params: {
    //             userId: user?.id,
    //         }
    //     };
        
    //     makeGetRequest(request)
    //         .then((response: any) => {
    //             setIsLoading(false)
    //             const res = response.data.data
    //             setPoLineItems(res.purchaseOrderItemSupplies.map((data: any) => ({
    //                 id: data.id,
    //                 purchaseOrderItemNumber: data.purchaseOrderItem.purchaseOrderItemNumber,
    //                 materialNumber: data.purchaseOrderItem.materialNumber,
    //                 materialDescription: data.purchaseOrderItem.materialDescription,
    //                 quantity: data.quantity,
    //                 purchaseOrderItemSupplyAttachments: data.purchaseOrderItemSupplyAttachments
    //             })))

    //         })
    //         .catch((error:any) => 
    //             {toast.error(error); setIsLoading(false)}
    //         );
    // }

    const row = poLineItems?.map((data: any, i: number) => {
        return (
            <tr key={i}>
                <td>{ i+1 }</td>
                <td>Item { data.purchaseOrderItemNumber }</td>
                <td>{ data.materialNumber }</td>
                <td>{ data.materialDescription }</td>
                <td>{ data.quantity }</td>
                <td>
                    {/* show if the attachment status is false */}
                    <button className="actions blue" 
                    onClick={() => {
                            const formattedFiles = data.purchaseOrderItemSupplyAttachments.map((file: any) => ({
                                id: file.id,
                                type: file.documentName,
                                file: file.documentBlobStorageName,
                                packageId: file.packageId,
                                purchaseOrderItemSupplyId: file.purchaseOrderItemSupplyId,
                                status: file.status
                            })).filter((file: any) => file.status === false)
                            setUploadModal(true); 
                            setPurchaseOrderItemSupplyId(data.id);
                            if(formattedFiles.length > 0) {
                                setFiles(formattedFiles);
                                setPrevFiles(formattedFiles)
                            }
                            else setFiles([{type: "", file: "", id: GUID(4)}]); }}>
                        <span className="material-symbols-rounded">upload</span>
                        <span>Reupload</span>
                    </button>
                </td>
            </tr>
        )
    })

    const [isSubmitting, setIsSubmitting] =useState(false)
    const handleUpdateUpload = (event: FormEvent) => {
        event.preventDefault()
        
        const formData = new FormData()
        formData.append("PurchaseOrderItemSupplyId", purchaseOrderItemSupplyId)
        files.forEach((attachment: any, index: number) => {
            formData.append(`Attachments[${index}].DocumentName`, attachment.type);
            formData.append(`Attachments[${index}].Document`, attachment.file);
        });

        setIsSubmitting(true)
        var request:Record<string, any> = {
            what: "UpdateMaterialPictures",
            data: formData
        }
        makePostRequest(request)
            .then((response: any) => {
                setIsSubmitting(false)
                setUploadModal(false)
                getMaterialReadinessDocumentById()
                toast.success(response.msg)
                setFiles([{type: "", file: "", id: GUID(4)}])
            }).catch((error:any) => {toast.error(error.msg); setIsSubmitting(false)});
    }

    useEffect(() => {
        // if(accessToken) getPackage() 
        if(accessToken && packageDetails) setPoLineItems(packageDetails.purchaseOrderItems?.map((data: any) => ({
                            id: data.id,
                            purchaseOrderItemNumber: data.purchaseOrderItemNumber,
                            materialNumber: data.materialNumber,
                            materialDescription: data.materialDescription,
                            quantity: data.quantity,
                            purchaseOrderItemSupplyAttachments: data.purchaseOrderItemSupplyAttachments
                        })))
        // eslint-disable-next-line
    }, [accessToken, packageDetails])

    return (
        <div>
            <div className="main-inner">                 
                <div className="main-inner-top" style={{fontSize: "12px"}}>
                    Purchase Order Items
                </div>
                <div className='table-container custom' style={{minHeight: "100vh"}}>
                    <table>
                        <thead>
                            <tr className="no-textwrap">
                                <th>SN</th>
                                <th>Item No</th>
                                <th>Material No</th>
                                <th>Material Description</th>
                                <th>Quantity</th>
                                {/* <th>Attached Files</th> */}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                poLineItems?.length === 0 ? <td className='no-records' colSpan={6}>No Records Found</td>
                                : row
                            }
                        </tbody>
                    </table>
                    {/* {isLoading ? <div className="loader">
                                <img src={loading} alt="loading" />
                                <p>Loading data...</p>
                            </div> : null} */}
                </div>
            </div>
            <Modal isOpen={uploadModal} style={customStyles} className="modal modal-4" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Reupload Material Pictures</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setUploadModal(false); setFiles([{type: "", file: "", id: GUID(4)}]); setIsSubmitting(false)}}>close</span>
                </div>
                <small className="text-blue mb-2 f-10">*Allowed file size: 10MB</small>
                {!files.length && <p className="small-text">No Files Require Update</p>   }                

                <form onSubmit={handleUpdateUpload}>
                <div className="modal-body form-view-container" style={{padding: "0", margin: "12px 0", height: "320px", overflowY: 'auto'}}>
                    <div className="d-grid-2"> 
                        {
                            files.map((data: any, index: number) => {
                                const isMaterialPicturesOrBlank = data.type === "Pictures" || data.type === "";
                                return (
                                    <>
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span> File Type</label>
                                        
                                            {isMaterialPicturesOrBlank && !(prevFiles.map((file) => file.type)).includes(data.type) && (
                                                <select
                                                    id={`fileSelectionType-${data.id}`}
                                                    name="type"
                                                    onChange={(event) => handleChange(event, data.id)}
                                                    // value={data.type}
                                                    required={data.type !== "Others"}
                                                >
                                                    <option value="">--Select--</option>
                                                    <option value="Pictures" disabled={!(prevFiles.map((file) => file.type)).includes(data.type)}>Material Pictures</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            )}
                                            {!isMaterialPicturesOrBlank && !(prevFiles.map((file) => file.type)).includes(data.type) && (
                                                <input
                                                    type="text"
                                                    name="type"
                                                    onChange={(event) => handleChange(event, data.id)}
                                                    // value={data.type}
                                                    required={data.type === "Others"}
                                                />
                                            )}

                                            {(prevFiles.map((file) => file.type)).includes(data.type) && <input value={data.type.replaceAll("_", " ")} disabled />}
                                        </div> 
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span> File (jpg, png, jpeg, zip, pdf)</label>
                                            <input name="file" type="file" accept=".jpg, .png, .pdf, .jpeg, .zip" required onChange={(event) => handleFileChange(event, data.id)} />                                            
                                        </div>

                                        {data?.file && <div className='form-item span-col-1'>
                                            <button type="button" 
                                                className="actions blue"
                                                onClick={() => handleDownloadClick(data.file, data.type, data.purchaseOrderItemSupplyId)}>
                                                <span className="material-symbols-rounded">download</span>
                                                <span>Download Previous File</span>
                                            </button>
                                        </div>}

                                        {!(prevFiles.map((file) => file.type)).includes(data.type) && <button type="button" disabled={index === 0} className="actions red" onClick={() => removeFile(data.id)} >
                                            <span className="material-symbols-rounded">remove</span>
                                            <span>Remove Row</span>
                                        </button>}

                                        {index === files.length - 1 && 
                                        <div className='form-item span-col-2'>
                                            <button type="button" className="actions blue" style={{justifyContent: "center"}} onClick={() => addFile()}>
                                                <span className="material-symbols-rounded">add</span>
                                                <span>Add Row</span>
                                            </button>
                                        </div>}
                                        <p className='span-col-2' style={{borderTop: "1px solid #d9d9d9"}}></p>
                                    </>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="modal-footer bt-1">
                    <button type="button" className="custom-button grey-outline"
                        onClick={() => {setUploadModal(false); setFiles([{type: "", file: "", id: GUID(4)}])}}>Cancel</button>
                    <button type="submit" disabled={isSubmitting || files.length === 0} className="custom-button orange">{isSubmitting ? "Loading..." : "Update"}</button>
                </div>
                </form>
            </Modal>
            <ToastContainer /> 
        </div>
    )
}

export default UpdateMaterialPictures