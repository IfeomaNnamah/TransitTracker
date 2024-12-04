import loading from "../../assets/images/loading.gif";
import { useState, useEffect, FormEvent } from "react";
import Pagination from "../../components/Pagination";
import { useSelector } from "react-redux";
import { makeGetRequest, makePatchRequest } from "../../request";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../Layout";
import Modal from "react-modal";
import {
  customStyles,
  formatDateTime,
  getStatusAndColorForMRDUploads,
  handleDownloadForPOItemSupplyAttachment,
  handlePreviewForPoItemSupply,
} from "helpers";

const ReviewPurchaseOrderItems = () => {
  const accessToken: any = useSelector((state: any) => state.accessToken.value);
  const user: any = useSelector((state: any) => state.tepngUser.value);
  const roles: any = useSelector((state: any) => state.roles.value);
  const [attachment, setAttachment] = useState({
    id: "",
    documentName: "",
  });
  const [packageId, setPackageId] = useState("");
  const [materialReadinessDocument, setMaterialReadinessDocument] = useState<
    Record<string, any>
  >({});

  const [purchaseOrderItems, setPurchaseOrderItems] = useState<
    Record<string, any>
  >([]);
  const [chatData, setChatData] = useState({
    receiver: "",
    comment: "",
  });
  const clearChatData = () => {
    setChatData({
      receiver: "",
      comment: "",
    });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("1");
  const [viewAttachmentModal, setViewAttachmentModal] = useState(false);
  const [selectedItemMaterialPictures, setSelectedItemMaterialPictures] =
    useState<Record<string, any>>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Record<string, any>>(
    {}
  );
  const [purchaseOrderItemSuppliesId, setPurchaseOrderItemSuppliesId] =
    useState("");
  const [openChatHistory, setOpenChatHistory] = useState(false);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (event: any) => {
    const value = event.target.value;
    if (!value) setSearchValue("");
  };

  // const handleDownloadClick = async (
  //   documentBlobStorageName: string,
  //   documentName: string
  // ) => {
  //   // id = purchaseOrderItemSupplyId
  //   try {
  //     setIsLoading2(true);
  //     // Fetch the file from the API
  //     const baseUrl = process.env.REACT_APP_SERVER_URL;
  //     const requestUrl = `PurchaseOrderItem/DownloadPurchaseOrderItemSupplyAttachment/${purchaseOrderItemSuppliesId}/${documentName}`;
  //     const response = await fetch(baseUrl + requestUrl, {
  //       method: "GET",
  //       headers: {
  //         Authorization: "Bearer " + accessToken.token,
  //       },
  //     });
  //     const blob = await response.blob();

  //     // Create a Blob URL
  //     const blobUrl = URL.createObjectURL(blob);

  //     // Create an anchor element
  //     const a = document.createElement("a");
  //     a.href = blobUrl;
  //     const currentDatetime = new Date(
  //       new Date().getTime() + 1 * 60 * 60 * 1000
  //     ).toISOString();
  //     const fileFormat = documentBlobStorageName.split(".")[1];

  //     a.download = `${documentName}_${currentDatetime.slice(
  //       0,
  //       -5
  //     )}.${fileFormat}`; // Set the desired file name

  //     // Trigger the click event to initiate the download
  //     a.click();

  //     // Cleanup: Revoke the Blob URL
  //     URL.revokeObjectURL(blobUrl);
  //     setIsLoading2(false);
  //   } catch (error) {
  //     console.log("Error downloading file:", error);
  //     setIsLoading2(false);
  //   }
  // };

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

  const getPurchaseOrderItems = () => {
    setIsLoading(true);
    var request: Record<string, any> = {
      what: "getPurchaseOrderItemSupply",
      params: {
        page: currentPage,
        pageSize: itemsPerPage,
        OrderBy: 2,
        EntityRepresentativeId: user?.id,
      },
    };
    if (searchValue) request.params.SearchString = searchValue;
    if (status) request.params.Status = status;

    makeGetRequest(request)
      .then((response: any) => {
        setIsLoading(false);
        const res = response.data;
        setPurchaseOrderItems(res.data);
        setTotalItems(res.totalCount);

        if (packageId) getPackage();
      })
      .catch((error: any) => {
        toast.error(error);
        setIsLoading(false);
      });
  };

  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formattedComment =
      chatData.comment +
      `|Document Name: ${attachment.documentName.replaceAll("_", " ")}.` +
      `|Material Number: ${selectedMaterial?.materialNumber}.` +
      `|Purchase Order Number: ${selectedMaterial?.purchaseOrderNumber}.`;
    var request: Record<string, any> = {
      what: "AddCommentForMaterialReadinessDocument",
      data: {
        materialReadinessDocumentId: materialReadinessDocument.id,
        comment: formattedComment,
        sender: "ExpeditingTeam",
        senderCompany: user?.companyName,
        senderRole: roles?.join(", "),
        receiver: materialReadinessDocument.supplierId, // enter supplier id for the mrd
      },
    };

    makePatchRequest(request)
      .then((response: any) => {
        setIsSubmitting(false);
        clearChatData();
        // toast.success("Chat Sent Successfully!")
        setOpenChatModal(false);
        handleMaterialAttachmentApproval(attachment.id, false);
      })
      .catch((error: any) => {
        toast.error(error);
        setIsSubmitting(false);
      });
  };
  // To reload the attachments and display the new status
  const getPackage = () => {
    // setIsLoading(true)
    var request: Record<string, any> = {
      what: "getPackage",
      id: packageId,
    };

    makeGetRequest(request)
      .then((response: any) => {
        setIsLoading2(false);
        const res = response.data.data;
        const selectedAttachments = res.purchaseOrderItemSupplies.find(
          (data: any) => data.id === purchaseOrderItemSuppliesId
        ).purchaseOrderItemSupplyAttachments;
        setSelectedItemMaterialPictures(selectedAttachments);

        // Check if all the attachments have either approve or reject
        const attachmentStatus = Object.values(selectedAttachments).some(
          (value: any) => value.status === null
        );

        if (attachmentStatus === false)
          setViewAttachmentModal(false); // close modal
        else setViewAttachmentModal(true); // Keep modal open for more approvals
      })
      .catch((error: any) => {
        toast.error(error);
      });
  };

  const handleMaterialAttachmentApproval = (
    attachmentId: string,
    status: boolean
  ) => {
    setIsLoading2(true);
    var request: Record<string, any> = {
      what: "EntityRepresentativeReviewItemAttachment",
      data: {
        purchaseOrderItemSupplyId: purchaseOrderItemSuppliesId,
        purchaseOrderItemSupplyAttachmentId: attachmentId,
        status: status,
      },
    };
    makePatchRequest(request)
      .then((response: any) => {
        // setIsLoading2(false)
        toast.success(response.msg);
        getPurchaseOrderItems(); // reload data.
      })
      .catch((error: any) => {
        toast.error(error.msg);
        setIsLoading2(false);
      });
  };

  const [chats, setChats] = useState<Record<string, any>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const getShippingChatHistory = (
    materialReadinessDocumentId: string,
    supplierId: string
  ) => {
    setIsChatLoading(true);
    var request: Record<string, any> = {
      what: "getMaterialReadinessDocumentChatHistory",
      id: materialReadinessDocumentId,
      params: {
        sender: "ExpeditingTeam",
        receiver: supplierId, // put supplier id
        orderBy: 1,
      },
    };

    makeGetRequest(request)
      .then((response: any) => {
        setIsChatLoading(false);
        const res = response.data.data;
        setChats(
          res.sort(
            (a: any, b: any) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime()
          )
        );
      })
      .catch((error: any) => {
        toast.error(error.msg);
        setIsChatLoading(false);
      });
  };

  const clearSetData = () => {
    setViewAttachmentModal(false);
    setSelectedItemMaterialPictures([]);
    setPurchaseOrderItemSuppliesId("");
    setPackageId("");
    setSelectedMaterial({});
    setAttachment({
      id: "",
      documentName: "",
    });
  };

  const row = purchaseOrderItems.map((data: any, index: number) => {
    return (
      <tr key={index}>
        <td>
          {currentPage === 1
            ? currentPage + index
            : itemsPerPage * currentPage - itemsPerPage + 1 + index}
        </td>
        <td>{data.purchaseOrderItem.materialNumber}</td>
        <td>Item {data.purchaseOrderItem.purchaseOrderItemNumber}</td>
        <td>{data.purchaseOrderItem.materialDescription}</td>
        <td>{data.purchaseOrderItem.purchaseOrderNumber}</td>
        <td className="actions">
          <div className="dropdown">
            <button className="dropbtn-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px" }}
              >
                more_horiz
              </span>
            </button>
            <div className="dropdown-content">
              <button
                onClick={() => {
                  setViewAttachmentModal(true);
                  setSelectedMaterial({
                    materialNumber: data.purchaseOrderItem.materialNumber,
                    purchaseOrderNumber:
                      data.purchaseOrderItem.purchaseOrderNumber,
                    materialDescription:
                      data.purchaseOrderItem.materialDescription,
                  });
                  setSelectedItemMaterialPictures(
                    data.purchaseOrderItemSupplyAttachments
                  );
                  setPurchaseOrderItemSuppliesId(data.id);
                  setPackageId(data.packageId);
                  setMaterialReadinessDocument({
                    id: data?.commercialInvoice?.materialReadinessDocument.id,
                    supplierId:
                      data?.commercialInvoice?.materialReadinessDocument
                        .supplierId,
                  });
                }}
              >
                View Attachments
              </button>
              <button
                onClick={() => {
                  setOpenChatHistory(true);
                  getShippingChatHistory(
                    data.commercialInvoice.materialReadinessDocumentId,
                    ""
                  );
                }}
              >
                Chat History
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  });

  useEffect(() => {
    if (accessToken) getPurchaseOrderItems(); // eslint-disable-next-line
  }, [currentPage, itemsPerPage, searchValue, accessToken, status]);

  const page = "Review Material Attachments";

  return (
    <Layout title={page}>
      <div className="container">
        <div className="main">
          <h3 className="page_title">{}</h3>
          <div className="main-inner">
            <div className="main-inner-top">
              <div className="d-flex">
                <div className="search-container left-item">
                  <span className="material-symbols-rounded">search</span>
                  <input
                    id="search"
                    placeholder="Search Material Number"
                    onKeyUp={handleSearch}
                  />
                </div>
                <button
                  className="custom-button orange left-item ml-2"
                  onClick={() =>
                    setSearchValue(
                      (document.getElementById("search") as HTMLInputElement)
                        ?.value
                    )
                  }
                >
                  Search
                </button>
              </div>

              <div className="d-flex page-filter">
                <span
                  style={{
                    fontSize: "12px",
                    color: "#3e3e3e",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  Filter By{" "}
                </span>
                <div
                  className={status === "1" ? "orange active" : "orange"}
                  onClick={() => setStatus("1")}
                >
                  {status === "1" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      style={{ width: "10px", marginRight: "4px" }}
                    >
                      <path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z" />
                    </svg>
                  )}
                  Open
                </div>

                <div
                  className={status === "2" ? "green active" : "green"}
                  onClick={() => setStatus("2")}
                >
                  {status === "2" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      style={{ width: "10px", marginRight: "4px" }}
                    >
                      <path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z" />
                    </svg>
                  )}
                  Closed
                </div>
              </div>
            </div>

            <div className="table-container custom">
              <table>
                <thead>
                  <tr className="no-textwrap">
                    <th>SN</th>
                    <th>Material Number</th>
                    <th>Item Number</th>
                    <th>Material Descrition</th>
                    <th>Purchase Order Number</th>
                    <th style={{ width: "124px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? null : purchaseOrderItems?.length === 0 ? (
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
            <div className="pagination-container">
              <Pagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                setCurrentPage={setCurrentPage}
                getPageNumbers={getPageNumbers}
                setItemsPerPage={setItemsPerPage}
              />
            </div>
          </div>
        </div>
        <Modal
          isOpen={viewAttachmentModal}
          style={customStyles}
          className="modal modal-8"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h3>Attached Files</h3>
            <span
              className="material-symbols-rounded close"
              onClick={() => clearSetData()}
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
                  <th style={{ borderTop: "none" }}>Approval Status</th>
                  <th style={{ borderTop: "none" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedItemMaterialPictures.map(
                  (attachment: any, index: number) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{attachment.documentName.replaceAll("_", " ")}</td>
                        <td>{formatDateTime(attachment.createdDate)}</td>
                        <td>
                          <div className="dropdown custom">
                            <button
                              className={`dropbtn-2 ${
                                getStatusAndColorForMRDUploads(
                                  attachment.status
                                ).color
                              }`}
                            >
                              <div>
                                <span className="material-symbols-rounded">
                                  {
                                    getStatusAndColorForMRDUploads(
                                      attachment.status
                                    ).icon
                                  }
                                </span>
                                <p>
                                  {
                                    getStatusAndColorForMRDUploads(
                                      attachment.status
                                    ).statusText
                                  }
                                </p>
                              </div>

                              <span className="material-symbols-rounded">
                                arrow_drop_down
                              </span>
                            </button>
                            <div className="dropdown-content">
                              <button
                                type="button"
                                disabled={attachment.status}
                                onClick={() =>
                                  handleMaterialAttachmentApproval(
                                    attachment.id,
                                    true
                                  )
                                }
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={attachment.status === false}
                                onClick={() => {
                                  setOpenChatModal(true);
                                  setViewAttachmentModal(false);
                                  setAttachment({
                                    id: attachment.id,
                                    documentName: attachment.documentName,
                                  });
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </td>
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
        <Modal
          isOpen={openChatModal}
          style={customStyles}
          className="modal modal-5"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h3>Attachment Rejection</h3>
            <span
              className="material-symbols-rounded close"
              onClick={() => {
                setOpenChatModal(false);
                setIsSubmitting(false);
                clearChatData();
                setViewAttachmentModal(true);
              }}
            >
              close
            </span>
          </div>
          <form onSubmit={handleSendChat}>
            <div className="modal-body">
              <div>
                <label>
                  <span className="errorX mr-2">*</span> Reason
                </label>
                <textarea
                  className="mt-1"
                  name="comment"
                  placeholder="Write a message..."
                  maxLength={300}
                  onChange={(event) =>
                    setChatData({ ...chatData, comment: event.target.value })
                  }
                  value={chatData.comment}
                  required
                ></textarea>
              </div>
              <small
                style={{ fontSize: "10px" }}
                className={
                  chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"
                }
              >
                {chatData.comment.length}/300 Characters
              </small>
            </div>
            <div className="modal-footer bt-1">
              <button
                type="button"
                className="custom-button grey-outline"
                onClick={() => {
                  setOpenChatModal(false);
                  clearChatData();
                  setViewAttachmentModal(true);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="custom-button orange"
              >
                {isSubmitting ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={openChatHistory}
          style={customStyles}
          className="modal modal-7"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h3>Chats</h3>
            <span
              className="material-symbols-rounded close"
              onClick={() => {
                setOpenChatHistory(false);
                clearChatData();
              }}
            >
              close
            </span>
          </div>
          <div className="modal-body" style={{ minHeight: "200px" }}>
            {!isChatLoading && !chats.length && <p>No Chats Found.</p>}

            {!isChatLoading && (
              <div className="chat-container">
                {chats.map((chat: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`chat-dialog ${
                        chat.sender === "ExpeditingTeam" ? "right" : "left"
                      }`}
                    >
                      <label className="title">
                        {chat.sender === "ExpeditingTeam"
                          ? "Expediting Team"
                          : "Supplier"}
                      </label>
                      <p>
                        {
                          chat.message.split('|').map((message: string, index: number) => {
                              return (
                                  <p key={index}>{message}</p>
                              )
                          })
                        }
                      </p>
                      <span className="date">
                        {formatDateTime(chat.createdDate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {isChatLoading && (
              <div className="loader">
                <img src={loading} alt="loading" />
                <p className="d-flex-center">Loading Chats...</p>
              </div>
            )}
          </div>
        </Modal>
        <Modal
          isOpen={isLoading2}
          style={customStyles}
          className="modal modal-sm"
          ariaHideApp={false}
        >
          <div className="loader">
            <img src={loading} alt="loading" />
            <p>Loading data...</p>
          </div>
        </Modal>
        <ToastContainer />
      </div>
    </Layout>
  );
};

export default ReviewPurchaseOrderItems;
