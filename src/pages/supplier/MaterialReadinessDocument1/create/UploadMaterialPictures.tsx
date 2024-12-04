import { FormEvent, useEffect, useState } from "react";
import { makeDeleteRequest, makeGetRequest, makePostRequest } from "request";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loading from "../../../../assets/images/loading.gif";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import { GUID, customStyles, formatDateTime, handleDownloadForPOItemSupplyAttachment, handlePreviewForPoItemSupply } from "helpers";

const MaterialPictures = (props: any) => {
  const { packageDetails, getPackages } = props;

  const user: any = useSelector((state: any) => state.tepngUser.value);
  const accessToken: any = useSelector((state: any) => state.accessToken.value);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [viewUploadsModal, setViewUploadsModal] = useState(false);
  const [purchaseOrderItemSuppliesId, setPurchaseOrderItemSuppliesId] =
    useState("");
  const [poLineItems, setPoLineItems] = useState<Record<string, any>>([]);
  const [selectedItemMaterialPictures, setSelectedItemMaterialPictures] =
    useState<Record<string, any>>([]);
  const [files, setFiles] = useState([
    {
      id: GUID(4),
      type: "",
      file: "",
    },
  ]);

  const addFile = () => {
    setFiles([
      ...files,
      {
        id: GUID(4),
        type: "",
        file: "",
      },
    ]);
  };

  const removeFile = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const handleChange = (event: any, id: string) => {
    const { name, value } = event.target; //get data form each input on change
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, [name]: value } : file
      )
    );
  };

  const handleFileChange = (event: any, id: string) => {
    const { name, files } = event.target;
    let selectedFile = files[0];

    let file = selectedFile.name.split(".");
    const fileFormat = file ? file[file.length - 1] : "";
    if (
      fileFormat === "zip" ||
      fileFormat === "png" ||
      fileFormat === "jpeg" ||
      fileFormat === "pdf" ||
      fileFormat === "jpg"
    ) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id ? { ...file, [name]: selectedFile } : file
        )
      );
    } else {
      if (fileFormat)
        toast.error(
          "Attempted to upload an invalid file format. Please re-upload the correct file formats."
        );
      const element = event.target as HTMLInputElement;
      element.value = "";
    }
  };

  const getPackage = () => {
    setIsLoading(true);
    var request: Record<string, any> = {
      what: "getPackage",
      id: packageDetails.packageId,
      params: {
        userId: user?.id,
      },
    };

    makeGetRequest(request)
      .then((response: any) => {
        setIsLoading(false);
        const res = response.data.data;
        setPoLineItems(
          res.purchaseOrderItemSupplies.map((data: any) => ({
            id: data.id,
            purchaseOrderItemNumber:
              data.purchaseOrderItem.purchaseOrderItemNumber,
            materialNumber: data.purchaseOrderItem.materialNumber,
            materialDescription: data.purchaseOrderItem.materialDescription,
            quantity: data.quantity,
            purchaseOrderItemSupplyAttachments:
              data.purchaseOrderItemSupplyAttachments,
          }))
        );
      })
      .catch((error: any) => {
        toast.error(error);
        setIsLoading(false);
      });
  };

  const handleDownloadClick = async (documentBlobStorageName: any, documentName: string, purchaseOrderItemSuppliesId: string) => {
    // Set isLoading to true when the download process starts
    setIsLoading(true);

    // Call the function to handle the document download
    const result = await handleDownloadForPOItemSupplyAttachment(
      documentBlobStorageName,
      documentName,
      purchaseOrderItemSuppliesId
    )

    // Set isLoading to false based on the result of the download operation
    setIsLoading(result);
  };

  const handlePreviewClick = async (documentName: string) => {
    // Set isLoading to true when the download process starts
    setIsLoading(true);

    // Call the function to handle the document download
    const result = await handlePreviewForPoItemSupply(
        documentName,
        purchaseOrderItemSuppliesId
    )

    // Set isLoading to false based on the result of the download operation
    setIsLoading(result);
  };

  const row = poLineItems?.map((data: any, i: number) => {
    return (
      <tr key={i}>
        <td>{i + 1}</td>
        <td>Item {data.purchaseOrderItemNumber}</td>
        <td>{data.materialNumber}</td>
        <td>{data.materialDescription}</td>
        <td>{data.quantity}</td>
        <td>
          {!!data.purchaseOrderItemSupplyAttachments.length && (
            <button
              className="actions blue"
              onClick={() => {
                setViewUploadsModal(true);
                setSelectedItemMaterialPictures(
                  data.purchaseOrderItemSupplyAttachments
                );
                setPurchaseOrderItemSuppliesId(data.id);
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: "18px" }}
              >
                visibility
              </span>
              <span>
                {data.purchaseOrderItemSupplyAttachments.length} File
                {data.purchaseOrderItemSupplyAttachments.length > 1 ? "s" : ""}
              </span>
            </button>
          )}

          {data.purchaseOrderItemSupplyAttachments.length === 0 && (
            <span>N/A</span>
          )}
        </td>
        <td>
          {data.purchaseOrderItemSupplyAttachments.length === 0 && (
            <button
              className="actions blue"
              onClick={() => {
                setUploadModal(true);
                setPurchaseOrderItemSuppliesId(data.id);
              }}
            >
              <span className="material-symbols-rounded">upload</span>
              <span>Upload</span>
            </button>
          )}

          {data.purchaseOrderItemSupplyAttachments.length > 0 && (
            <button
              className="actions red"
              onClick={() => clearPurchaseOrderItemAttachment(data.id)}
            >
              <span className="material-symbols-rounded">close</span>
              <span>Clear Upload</span>
            </button>
          )}
        </td>
      </tr>
    );
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleUpload = (event: FormEvent) => {
    event.preventDefault();
    const data = {
      PurchaseOrderItemId: purchaseOrderItemSuppliesId, //supplies id
      Attachments: files,
    };
    const formData = new FormData();
    formData.append("PurchaseOrderItemSupplyId", data.PurchaseOrderItemId);
    data.Attachments.forEach((attachment: any, index: number) => {
      formData.append(
        `Attachments[${index}].DocumentName`,
        attachment.type.replaceAll(" ", "_")
      );
      formData.append(`Attachments[${index}].Document`, attachment.file);
    });

    const arrayOfFileTypes = files.map((file: any) => file.type);
    const isMadatoryFilesAttached = !!arrayOfFileTypes.find(
      (type) => type === "Pictures"
    );

    if (isMadatoryFilesAttached) {
      setIsSubmitting(true);
      var request: Record<string, any> = {
        what: "UploadMaterialPictures",
        data: formData,
      };
      makePostRequest(request)
        .then((response: any) => {
          setIsSubmitting(false);
          setUploadModal(false);
          getPackages();
          getPackage();
          toast.success(response.msg);
          setFiles([{ type: "", file: "", id: GUID(4) }]);
        })
        .catch((error: any) => {
          toast.error(error.msg);
          setIsSubmitting(false);
        });
    } else
      toast.error(
        "The material picture is missing from the files to be uploaded."
      );
  };

  const clearPurchaseOrderItemAttachment = (itemId: string) => {
    setIsLoading(false);
    var request: Record<string, any> = {
      what: "ClearPurchaseOrderItemSupplyAttachment",
      id: itemId,
    };
    makeDeleteRequest(request)
      .then((response: any) => {
        setIsLoading(false);
        getPackages();
        getPackage();
        toast.success(response.msg);
      })
      .catch((error: any) => {
        toast.error(error.msg);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (accessToken) getPackage();
    // eslint-disable-next-line
  }, [accessToken, packageDetails]);

  return (
    <div>
      <div className="main-inner">
        <div className="main-inner-top" style={{ fontSize: "12px" }}>
          Purchase Order Items
        </div>
        <div className="table-container custom" style={{ minHeight: "100vh" }}>
          <table>
            <thead>
              <tr className="no-textwrap">
                <th>SN</th>
                <th>Item No</th>
                <th>Material No</th>
                <th>Material Description</th>
                <th>Quantity</th>
                <th>Attached Files</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? null : poLineItems?.length === 0 ? (
                <td className="no-records" colSpan={6}>
                  No Records Found
                </td>
              ) : (
                row
              )}
            </tbody>
          </table>
          {isLoading ? (
            <div className="loader">
              <img src={loading} alt="loading" />
              <p>Loading data...</p>
            </div>
          ) : null}
        </div>
      </div>
      <Modal
        isOpen={uploadModal}
        style={customStyles}
        className="modal modal-4"
        ariaHideApp={false}
      >
        <div className="modal-header">
          <h3>Upload Material Pictures</h3>
          <span
            className="material-symbols-rounded close"
            onClick={() => {
              setUploadModal(false);
              setFiles([{ type: "", file: "", id: GUID(4) }]);
              setIsSubmitting(false);
            }}
          >
            close
          </span>
        </div>
        <form onSubmit={handleUpload}>
          <div
            className="modal-body form-view-container"
            style={{
              padding: "0",
              margin: "12px 0",
              height: "320px",
              overflowY: "auto",
            }}
          >
            <div className="d-grid-2">
              {files.map((data: any, index: number) => {
                const isMaterialPicturesOrBlank =
                  data.type === "Pictures" || data.type === "";
                return (
                  <>
                    <div className="form-item span-col-1">
                      <label>
                        <span className="errorX mr-2">*</span> File Type
                      </label>

                      {isMaterialPicturesOrBlank && (
                        <select
                          id={`fileSelectionType-${data.id}`}
                          name="type"
                          onChange={(event) => handleChange(event, data.id)}
                          // value={data.type}
                          required={data.type !== "Others"}
                        >
                          <option value="">--Select--</option>
                          <option value="Pictures">Material Pictures</option>
                          <option value="Others">Others</option>
                        </select>
                      )}
                      {!isMaterialPicturesOrBlank && (
                        <input
                          type="text"
                          name="type"
                          onChange={(event) => handleChange(event, data.id)}
                          // value={data.type}
                          required={data.type === "Others"}
                        />
                      )}
                    </div>
                    <div className="form-item span-col-1">
                      <label>
                        <span className="errorX mr-2">*</span> File (jpg, png,
                        jpeg, zip, pdf)
                      </label>
                      <input
                        name="file"
                        type="file"
                        accept=".jpg, .png, .pdf, .jpeg, .zip"
                        required
                        onChange={(event) => handleFileChange(event, data.id)}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={index === 0}
                      className="actions red"
                      onClick={() => removeFile(data.id)}
                    >
                      <span className="material-symbols-rounded">remove</span>
                      <span>Remove Row</span>
                    </button>

                    {index === files.length - 1 && (
                      <button
                        type="button"
                        className="actions blue"
                        style={{ justifyContent: "end" }}
                        onClick={() => addFile()}
                      >
                        <span className="material-symbols-rounded">add</span>
                        <span>Add Row</span>
                      </button>
                    )}
                    <p
                      className="span-col-2"
                      style={{ borderTop: "1px solid #d9d9d9" }}
                    ></p>
                  </>
                );
              })}
            </div>
          </div>
          <div className="modal-footer bt-1">
            <button
              type="button"
              className="custom-button grey-outline"
              onClick={() => {
                setUploadModal(false);
                setFiles([{ type: "", file: "", id: GUID(4) }]);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="custom-button orange"
            >
              {isSubmitting ? "Loading..." : "Upload"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={viewUploadsModal}
        style={customStyles}
        className="modal modal-7"
        ariaHideApp={false}
      >
        <div className="modal-header">
          <h3>Attached Files</h3>
          <span
            className="material-symbols-rounded close"
            onClick={() => setViewUploadsModal(false)}
          >
            close
          </span>
        </div>
        <div
          className="modal-body table-container custom"
          style={{ minHeight: "320px" }}
        >
          <table>
            <thead>
              <tr className="no-textwrap">
                <th style={{ borderTop: "none" }}>SN</th>
                <th style={{ borderTop: "none" }}>File Type</th>
                <th style={{ borderTop: "none" }}>Date Uploaded</th>
                <th style={{ borderTop: "none" }}>Status</th>
                <th style={{ borderTop: "none" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedItemMaterialPictures.map(
                (attachment: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{attachment.documentName}</td>
                      <td>{formatDateTime(attachment.createdDate)}</td>
                      <td></td>
                      <td className="d-flex">
                        <button
                          className="actions blue"
                          onClick={() =>
                            handleDownloadClick(
                              attachment.documentBlobStorageName,
                              attachment.documentName,
                              purchaseOrderItemSuppliesId
                            )
                          }
                        >
                          <span className="material-symbols-rounded">
                            download
                          </span>
                          <span>Download</span>
                        </button>
                        {attachment.documentBlobStorageName.split(".")[1] ===
                          "pdf" && (
                          <button
                            className="actions blue mr-1"
                            onClick={() =>
                              handlePreviewClick(attachment.documentName)
                            }
                          >
                            <span className="material-symbols-rounded">
                              preview
                            </span>
                            <span>Preview</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default MaterialPictures;
