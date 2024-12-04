import { GUID, customStyles } from "helpers";
import { FormEvent, useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makePostRequest } from "request";
import Modal from 'react-modal'
import loading from "../../../../assets/images/loading.gif"
// import { useSelector } from "react-redux";

const UpdateOtherAttachments = (props: any) => {
    const { packageDetails, getMaterialReadinessDocumentById, handleDownloadClick } = props
    const [isLoading, setIsLoading] = useState(false)
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
        const {name, files} = event.target
        let selectedFile = files[0]

        if(name && files) {
            let file = selectedFile?.name.split(".");
            const fileFormat = file ? file[file.length - 1] : ''
            if (fileFormat === "zip" || fileFormat === "pdf") {
                setFiles(prevFiles => prevFiles.map(file => 
                    file.id === id ? { ...file, [name]: selectedFile } : file
                ));
            }
            else {
                if(fileFormat) toast.error("Attempted to upload an invalid file format. Please re-upload the correct file formats.")
                const element = event.target as HTMLInputElement
                element.value = ""
            }      
        }         
    }

    const handleAttachmentSubmission = (event: FormEvent) => {
        event.preventDefault()        
        const formData = new FormData()
        formData.append("PackageGroupKey", packageDetails?.packageGroupingKey)
        files?.forEach((data: any, index: number) => {
            formData.append(`Attachments[${index}].DocumentName`, data.type);
            formData.append(`Attachments[${index}].Document`, data.file);
        });

        setIsLoading(true)
        var request:Record<string, any> = {
            what: "UpdatePackageAttachment",
            data: formData
        }
        makePostRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                // refresh data
                getMaterialReadinessDocumentById()
                setFiles([{type: "", file: "", id: GUID(4)}])
                toast.success(response.msg)
            }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }

    const knownFileTypes = [
        "Commercial Invoice",
        "Export Commercial Invoice",
        "Packing List",
        "SEI4 C Packing",
    ]

    useEffect(() => {
        if(packageDetails.packageAttachments) {
            // get attachment for this pacticular package
            const files = packageDetails.packageAttachments
            // const files = attachments.filter((file: any) => file.packageId === packageDetails.packageId)
            const formattedFiles = files.map((file: any, index: number) => ({
                id: file.id,
                type: file.documentName,
                file: file.documentBlobStorageName,
                packageId: file.packageId,
                status: file.status
            })).filter((file: any) => file.status === false)

            if(formattedFiles.length > 0) {
                setFiles(formattedFiles);
                setPrevFiles(formattedFiles)
            }
            else setFiles([{type: "", file: "", id: GUID(4)}])
        } // eslint-disable-next-line
    }, [packageDetails.packageAttachments])

    return (
        <form onSubmit={handleAttachmentSubmission}>           

            <div className="form-view-container custom" style={{padding: "16px", backgroundColor: "white", margin:0, borderRadius: "6px", minHeight: "100vh"}}>
                 
                <div className="layout">
                    <div className="label">
                        Attachments
                        <br /><small className="text-blue mb-2 f-10">*Allowed file size: 10MB</small> 
                    </div> 

                    {!files.length && <p className="small-text m-0">No Files Require Update</p>   }                
                    
                    <div className="d-grid-2"> 
                        {
                            // do not show if attchment status is true
                            files.map((data: any, index: number) => {
                                const isKnownFileTypesOrBlank = knownFileTypes.includes(data.type) || data.type === "";
                                return (
                                    <>
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span> File Type</label>
                                            {isKnownFileTypesOrBlank && !(prevFiles.map((file) => file.type)).includes(data.type) && (
                                                <select
                                                    // id={`fileSelectionType-${data.id}`}
                                                    id="fileNameSelect"
                                                    name="type"
                                                    
                                                    onChange={(event) => handleChange(event, data.id)}
                                                    required={data.type !== "Others"}
                                                >
                                                    <option value="">--Select--</option>
                                                    {
                                                        knownFileTypes.map((type: string) => {
                                                            return (
                                                                <option disabled={(prevFiles.map((file) => file.type)).includes(type)} value={type}>{type}</option>
                                                            )
                                                        })
                                                    }
                                                    <option value="Others">Others</option>

                                                </select>
                                            )}
                                            {!isKnownFileTypesOrBlank && !(prevFiles.map((file) => file.type)).includes(data.type) && (
                                                <input
                                                    id="fileNameInput"
                                                    type="text"
                                                    name="type"
                                                    disabled={data.type.includes(knownFileTypes)}
                                                    onChange={(event) => handleChange(event, data.id)}
                                                    required={data.type === "Others"}
                                                />
                                            )}

                                            {(prevFiles.map((file) => file.type)).includes(data.type) && <input value={data.type.replaceAll("_", " ")} disabled />}
                                        </div> 
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span>File (zip, pdf)</label>
                                            <input id="file" name="file" type="file" accept=".pdf, .zip" required onChange={(event) => handleFileChange(event, data.id)} />
                                        </div>
                                        
                                        {data.file && <div className='form-item span-col-1'>
                                            <button type="button" className="actions blue" onClick={() => handleDownloadClick(data.packageId, data.file, data.type)}>
                                                <span className="material-symbols-rounded">download</span>
                                                <span>Download Previous File</span>
                                            </button>
                                        </div>}
                                        
                                        {!(prevFiles.map((file) => file.type)).includes(data.type) && <button type="button" className="actions red" onClick={() => removeFile(data.id)} >
                                            <span className="material-symbols-rounded">remove</span>
                                            <span>Remove Row</span>
                                        </button>}

                                        {index === files.length - 1 && <button type="button" className="actions blue" style={{justifyContent: "end"}} onClick={() => addFile()}>
                                            <span className="material-symbols-rounded">add</span>
                                            <span>Add Row</span>
                                        </button>}
                                       
                                        <p className='span-col-2' style={{borderTop: "1px solid #d9d9d9"}}></p>
                                    </>
                                )
                            })
                        }
                    </div>                                 
                </div>
            </div>   

            <div className="main-inner mt-1" style={{padding: "16px", boxSizing: "border-box", minHeight: "calc(100vh - 600px)"}}>
                <div className="d-flex-center gap-2 mt-2">                    
                    <button type="button" className="custom-button grey-outline"                         
                        disabled>Cancel</button>              
                    <button type="submit" className="custom-button orange" disabled={!files.length}>Update</button>
                </div>
            </div>

            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal>
            <ToastContainer /> 
        </form>
    )
}

export default UpdateOtherAttachments