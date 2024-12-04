import { GUID, customStyles } from "helpers";
import { FormEvent, useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeDeleteRequest, makePostRequest } from "request";
import Modal from 'react-modal'
import loading from "../../../../assets/images/loading.gif"
// import { useSelector } from "react-redux";

const OtherAttachments = (props: any) => {
    const { packageDetails, getPackages } = props
    const [isLoading, setIsLoading] = useState(false)
    const [isCompletedUpload, setIsCompletedUpload] = useState(false)
    // const accessToken:any = useSelector((state: any) => state.accessToken.value);

    const [files, setFiles] = useState([{
        id: GUID(4),
        type: "",
        file: ""
    }])

    const clearForm = () => {
        setFiles([{
            id: GUID(4),
            type: "",
            file: ""
        }]);
        
        (document.getElementById("file") as HTMLInputElement).value = "";
        (document.getElementById("fileNameSelect") as HTMLInputElement).value = "";
        if(document.getElementById("fileNameInput")) (document.getElementById("fileNameInput") as HTMLInputElement).value = "";
    }

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
        const data = {
            packageId: packageDetails.packageId,
            materialAttachments: files
        }
        
        const formData = new FormData()
        formData.append("PackageId", data.packageId)
        data.materialAttachments.forEach((data: any, index: number) => {
            formData.append(`Attachments[${index}].DocumentName`, data.type.replaceAll(" ", "_"));
            formData.append(`Attachments[${index}].Document`, data.file);
        });

        const arrayOfFileTypes = files.map((file: any) => file.type)
        const isMadatoryFilesAttached = !!arrayOfFileTypes.find(type => type === "Commercial Invoice") && !!arrayOfFileTypes.find(type => type === "Packing List")
        
        if(isMadatoryFilesAttached){
            setIsLoading(true)
            var request:Record<string, any> = {
                what: "UploadPackageAttachments",
                data: formData
            }
            makePostRequest(request)
                .then((response: any) => {
                    setIsLoading(false)
                    clearForm()
                    getPackages()
                    setIsCompletedUpload(true)
                    toast.success(response.msg)
                }).catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
        }else toast.warning("The commercial invoice or/and packing list is missing from the attachments.")
    }

    const knownFileTypes = [
        "Commercial Invoice",
        "Export Commercial Invoice",
        "Packing List",
        "SEI4 C Packing",
    ]

    const clearPackageAttachment = () => {
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "ClearPackageAttachments",
            id: packageDetails.packageId
        }
        makeDeleteRequest(request)
            .then((response: any) => {
                setIsLoading(false)
                getPackages()
                setIsCompletedUpload(false)
                toast.success(response.msg)
            }).catch((error:any) => {toast.error(error.msg);setIsLoading(false)});
    }

    useEffect(() => {
        if(packageDetails.packageAttachments) {
            // get attachment for this pacticular package
            const attachments = packageDetails.packageAttachments
            const files = attachments.filter((file: any) => file.packageId === packageDetails.packageId)
            
            if(!!files.length) setIsCompletedUpload(true)
            else setIsCompletedUpload(false)

        } // eslint-disable-next-line
    }, [packageDetails.packageAttachments])

    return (
        <form onSubmit={handleAttachmentSubmission}>           

            <div className="form-view-container custom" style={{padding: "16px", backgroundColor: "white", margin:0, borderRadius: "6px", minHeight: "100vh"}}>
                {isCompletedUpload && 
                <div style={{textAlign:"center"}}>
                    <div className="alert alert-info" style={{margin: "0", marginBottom: "16px", padding: "8px", width: "100%"}}>
                        <span className="material-symbols-outlined mr-2" style={{color: "#004085"}}>info</span>
                        <p style={{margin: 0}}>You have already uploaded the required attachments</p>
                    </div>
                    <span style={{fontSize: "12px"}}>Click <span  className="link-text" onClick={() => clearPackageAttachment()}>here</span> to clear attachments</span>
                </div>
                }
                
                {!isCompletedUpload && <div className="layout">
                    <div className="label">Attachments</div>                   
                    
                    <div className="d-grid-2"> 
                        {
                            files.map((data: any, index: number) => {
                                const isKnownFileTypesOrBlank = knownFileTypes.includes(data.type) || data.type === "";
                                return (
                                    <>
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span> File Type</label>
                                            {isKnownFileTypesOrBlank && (
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
                                                                <option value={type}>{type}</option>
                                                            )
                                                        })
                                                    }
                                                    <option value="Others">Others</option>

                                                </select>
                                            )}
                                            {!isKnownFileTypesOrBlank && (
                                                <input
                                                    id="fileNameInput"
                                                    type="text"
                                                    name="type"
                                                    onChange={(event) => handleChange(event, data.id)}
                                                    required={data.type === "Others"}
                                                />
                                            )}
                                        </div> 
                                        <div className='form-item span-col-1'>
                                            <label><span className="errorX mr-2">*</span> File (zip, pdf)</label>
                                            <input id="file" name="file" type="file" accept=".pdf, .zip" required onChange={(event) => handleFileChange(event, data.id)} />
                                            
                                        </div>
                                        <button type="button" disabled={index === 0} className="actions red" onClick={() => removeFile(data.id)} >
                                            <span className="material-symbols-rounded">remove</span>
                                            <span>Remove Row</span>
                                        </button>

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
                </div>}
            </div>   

            {!isCompletedUpload && <div className="main-inner mt-1" style={{padding: "16px", boxSizing: "border-box", minHeight: "calc(100vh - 600px)"}}>
                <div className="d-flex-center gap-2 mt-2">                    
                    <button type="button" className="custom-button grey-outline"                         
                        onClick={() => clearForm()}>Clear Form</button>              
                    <button type="submit" className="custom-button orange">Submit</button>
                </div>
            </div>}

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

export default OtherAttachments