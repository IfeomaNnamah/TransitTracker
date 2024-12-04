import { useState, useEffect, FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import loading from "../../../assets/images/loading.gif";
import Modal from "react-modal";
import PdfGeneratorConsCommercialInvoice from "../../pdftemplates/generateConsolidatedCommercialInvoice";
import PdfGeneratorConsPackingList from "../../pdftemplates/generateConsolidatedPackingList";
import { makeGetRequest, makePatchRequest } from "../../../request";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import {
  ClearingProcessStatus,
  customStyles,
  formatDateTime,
  handleDownloadForShippingDocuments,
  handlePreviewForShippingDocuments,
} from "helpers";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

const ShippingDocumentsDetail = () => {
  const accessToken: any = useSelector((state: any) => state.accessToken.value);
  const user: any = useSelector((state: any) => state.tepngUser.value);
  // const roles:any = useSelector((state: any) => state.roles.value);
  const param = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const statusAfterNavigation = location.state as { status: number };
  const pageContext: any = useSelector((state: any) => state.pageContext.value);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [data, setData] = useState<Record<string, any>>([]);
  const [isShowInvoice, setIsShowInvoice] = useState(false);
  const [isShowPackingList, setIsShowPackingList] = useState(false);

  const getShippingDocument = () => {
    setIsLoading(true);
    var request: Record<string, any> = {
      what: "getShippingDocumentById",
      id: param.id,
    };

    makeGetRequest(request)
      .then((response: any) => {
        setIsLoading(false);
        const res = response.data.data;
        setData(res);
      })
      .catch((error: any) => toast.error(error.errorMessage));
  };

  const handleDownloadClick = async (shipment: any, documentName: string, title: string) => {
    // Set isLoading to true when the download process starts
    setIsLoading(true);

    // Call the function to handle the document download
    const result = await handleDownloadForShippingDocuments(shipment, documentName, title);

    // Set isLoading to false based on the result of the download operation
    setIsLoading(result);
  };

  const handlePreviewClick = async (shipment: any, documentName: string) => {
    // Set isLoading to true when the download process starts
    setIsLoading(true);

    // Call the function to handle the document download
    const result = await handlePreviewForShippingDocuments(shipment, documentName);

    // Set isLoading to false based on the result of the download operation
    setIsLoading(result);
  };

  const handleValidation = () => {
    setIsSubmitting(true);
    var request: Record<string, any> = {
      what: "AddValidationForShippingDocuments",
      data: {
        id: param.id,
        isSuccess: true,
      },
    };

    makePatchRequest(request)
      .then((response: any) => {
        setIsSubmitting(false);
        toast.success(response.msg);

        setTimeout(() => {
          navigate("/transitofficer/shippingdocuments");
        }, 1000);
      })
      .catch((error: any) => {
        toast.error(error);
        setIsSubmitting(false);
      });
  };
  const [formData, setFormData] = useState({
    documentName: "",
    document: "",
    shippingDocumentId: "",
    freightForwarderId: "",
    localClearingAgentId: "",
    receiver: "",
    comment: "",
    attachments: [],
    additionalInfo: ""
  });
  const clearData = () => {
    setFormData({
      documentName: "",
      document: "",
      shippingDocumentId: "",
      freightForwarderId: "",
      localClearingAgentId: "",
      receiver: "",
      comment: "",
      attachments: [],
      additionalInfo: ""
    });
  };
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [openChatHistory, setOpenChatHistory] = useState(false);
  const [documentRejectionData, setDocumentRejectionData] = useState({
    status: false,
    documentName: "",
  });
  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    var request: Record<string, any> = {
      what: "AddCommentForShippingDocuments",
      data: {
        id: formData.shippingDocumentId,
        comment: documentRejectionData.status ?
          `With reference to the ${formData.additionalInfo.replaceAll("_", " ")}: ${formData.comment}`
          : formData.comment,
        sender: "TransitOfficer",
        senderRole: "Transit Officer",
        receiver:
          formData.receiver === "Freight Forwarder"
            ? formData.freightForwarderId
            : formData.receiver === "Local Clearing Agent"
            ? formData.localClearingAgentId
            : "",
        receiverRole:
          formData.receiver === "Freight Forwarder"
            ? "Freight Forwarder"
            : formData.receiver === "Local Clearing Agent"
            ? "Local Clearing Agent"
            : "",
      },
    };

    makePatchRequest(request)
      .then((response: any) => {
        if(documentRejectionData.status) {
          handleDocumentApproval(data, documentRejectionData.documentName, false)
          setDocumentRejectionData({
            status: false,
            documentName: "",
          })
        }
        setIsSubmitting(false);
        clearData();
        toast.success("Chat Sent Successfully!");
        setOpenChatHistory(false);
        getShippingDocument();
      })
      .catch((error: any) => {
        toast.error(error);
        setIsSubmitting(false);
      });
  };

  const [chats, setChats] = useState<Record<string, any>>([]);
  const getShippingChatHistory = (
    selectedReceiver: string, 
    freightForwarderId?: string, 
    localClearingAgentId?: string, 
    shippingDocumentId?: string,
  ) => {
    setIsChatLoading(true);
    
    var request: Record<string, any> = {
      what: "getShippingDocumentChatHistory",
      params: {
        shippingDocumentId: formData.shippingDocumentId ? formData.shippingDocumentId : shippingDocumentId,
        sender: "TransitOfficer",
        receiver:
          selectedReceiver === "Freight Forwarder"
            ? (formData.freightForwarderId ? formData.freightForwarderId : freightForwarderId)
            : selectedReceiver === "Local Clearing Agent"
            ? (formData.localClearingAgentId ? formData.localClearingAgentId : localClearingAgentId)
            : "",
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
  const handleChange = (event: any) => {
    const { name, value } = event.target; //get data form each input on change

    setFormData((values) => ({ ...formData, [name]: value })); //set retrieved values to "formData" object

    if (name === "receiver") getShippingChatHistory(value);
  };

  /**
   * Retrives the last occurence that matches the document name
   *
   * @param {any} shipment - The shipment object containing the document attachments.
   * @param {string} documentName - The name of the document to retrieve the blob storage name for.
   * @return {string | null} The document blob storage name if found, otherwise null.
   */
  const getDocumentBlobStorageName = (shipment: any, documentName: string) => {
    return shipment?.shippingDocumentAttachments?.reduce(
      (prev: any, curr: any) => {
        return curr.documentName === documentName ? curr : prev;
      },
      null
    )?.documentBlobStorageName;
  };
  const getDocumentStatus = (shipment: any, documentName: string) => {
    const status = shipment?.shippingDocumentAttachments?.reduce(
      (prev: any, curr: any) => {
        return curr.documentName === documentName ? curr : prev;
      },
      null
    )?.isApproved;

    return status
  }

  // Retrives the last occurence that matches the document name
  const getDocumentStatusColor = (shipment: any, documentName: string) => {
    const status = shipment?.shippingDocumentAttachments?.reduce(
      (prev: any, curr: any) => {
        return curr.documentName === documentName ? curr : prev;
      },
      null
    )?.isApproved;

    switch (status) {
      case true:
        return "green";
      case false:
        return "red";
      default:
        return null;
    }
  };

  const handleDocumentApproval = (shipment: any, documentName: string, response: boolean) => {
    const attachmentId = shipment?.shippingDocumentAttachments?.reduce(
      (prev: any, curr: any) => {
        return curr.documentName === documentName ? curr : prev;
      },
      null
    )?.id;

    setIsLoading(true);
    var request: Record<string, any> = {
      what: "AddValidationToFinalDocument",
      data: {
        shippingDocumentAttachmentId: attachmentId,
        isApproved: response,
        approverId: user?.id
      },
    };

    makePatchRequest(request)
      .then((response: any) => {
        toast.success(response.msg);
        getShippingDocument();
      })
      .catch((error: any) => {
        toast.error(error);
        setIsLoading(false);
      });
  }
  const getDocumentUploadDate = (shipment: any, documentName: string) => {
    return shipment?.shippingDocumentAttachments?.find(
      (attachment: any) => attachment.documentName === documentName
    )?.createdDate;
  };

  useEffect(() => {
    if (accessToken) getShippingDocument(); // eslint-disable-next-line
  }, [accessToken]);

  const page = pageContext?.page ? pageContext.page : "Shipping Documents";

  return (
    <Layout title={page}>
      <div className="container">
        <div className="main">
          <h3 className="page_title">{}</h3>

          <div className="main-inner">
            <div className="detail-top-section">
              <div className="d-flex">
                <Link
                  to={
                    pageContext?.url
                      ? pageContext.url
                      : "/transitofficer/shippingdocuments"
                  }
                  state={{ status: statusAfterNavigation?.status }}
                  className="actions"
                >
                  <p>
                    <span className="material-symbols-rounded">arrow_back</span>{" "}
                    Back to{" "}
                    {pageContext?.url
                      ? "Local Clearing Agents"
                      : "Shipping Documents"}
                  </p>
                </Link>
                <button
                  className="actions"
                  onClick={() => {
                    setOpenChatHistory(true);
                    setFormData({
                      ...formData,
                      shippingDocumentId: data.id,
                      freightForwarderId: data.freightForwarderId,
                      localClearingAgentId: data.localClearingAgentId,
                      attachments: data.shippingDocumentAttachments,
                    });
                  }}
                >
                  <p>
                    <span className="material-symbols-outlined">forum</span>Send | View Chats
                  </p>
                </button>
              </div>

              <div className="tab">
                <div className="tab-item active">
                  <span className="material-symbols-rounded">visibility</span>
                  <p>Preview Shipping Documents</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="main-inner mt-1"
            style={{
              minHeight: "calc(100vh - 160px)",
              padding: "16px",
              boxSizing: "border-box",
            }}
          >
            {data?.status === 4 && (
              <div
                className="mb-2"
                style={{
                  padding: "12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                }}
              >
                <Box>
                  <Stepper
                    activeStep={
                      data?.clearingProcessStatuses?.length > 0
                        ? data?.clearingProcessStatuses?.length + 1
                        : 1
                    }
                    alternativeLabel
                  >
                    {ClearingProcessStatus().map(
                      (label: any, index: number) => (
                        <Step key={index}>
                          <StepLabel>
                            {data?.shippingDocumentAttachments?.length &&
                              label.value === 1 && (
                                <span className="text-grey">
                                  {formatDateTime(
                                    data.shippingDocumentAttachments[
                                      data.shippingDocumentAttachments.length -
                                        1
                                    ]?.createdDate
                                  )}
                                </span>
                              )}
                            {label.value > 1 && (
                              <span className="text-grey">
                                {formatDateTime(
                                  data?.clearingProcessStatuses.find(
                                    (cps: any) => cps.status === label.name
                                  )?.createdDate
                                )}
                              </span>
                            )}
                            <br />
                            <span>{label.name}</span>
                          </StepLabel>
                        </Step>
                      )
                    )}
                  </Stepper>
                </Box>
              </div>
            )}

            <div className="accordion">
              <div
                className={`header d-flex ${isShowInvoice ? "active" : ""}`}
                onClick={() => setIsShowInvoice(!isShowInvoice)}
              >
                <div className="d-flex">
                  <span className="material-symbols-rounded">
                    {isShowInvoice ? "expand_more" : "chevron_right"}
                  </span>
                  <span>Consolidated Commercial Invoice</span>
                </div>
                <p className="small-text m-0">
                  Created: {formatDateTime(data?.createdDate)}
                </p>
              </div>
              {isShowInvoice && (
                <div className="body">
                  <PdfGeneratorConsCommercialInvoice
                    key="1"
                    data={data?.consolidatedCommercialInvoice}
                  />
                </div>
              )}
            </div>

            <div className="accordion mt-1">
              <div
                className={`header d-flex ${isShowPackingList ? "active" : ""}`}
                onClick={() => setIsShowPackingList(!isShowPackingList)}
              >
                <div className="d-flex">
                  <span className="material-symbols-rounded">
                    {isShowPackingList ? "expand_more" : "chevron_right"}
                  </span>
                  <span>Consolidated Packing List</span>
                </div>
                <p className="small-text m-0">
                  Created: {formatDateTime(data?.createdDate)}
                </p>
              </div>
              {isShowPackingList && (
                <div className="body">
                  <PdfGeneratorConsPackingList
                    key="2"
                    data={data?.consolidatedPackingList}
                  />
                </div>
              )}
            </div>

            <div className={`d-flex file-input-container ${getDocumentStatusColor(data, "DraftBillOfLadingOrAirWayBill")} mt-1`}>
              <span
                className={
                  !getDocumentBlobStorageName(
                    data,
                    "DraftBillOfLadingOrAirWayBill"
                  )
                    ? "disabled"
                    : ""
                }
              >
                Draft Bill Of Lading/Air Way Bill
                <p className="small-text m-0 mt-1">
                  Uploaded:{" "}
                  {formatDateTime(
                    getDocumentUploadDate(data, "DraftBillOfLadingOrAirWayBill")
                  )}
                </p>
              </span>
              <div className="d-flex">
                {getDocumentBlobStorageName(
                  data,
                  "DraftBillOfLadingOrAirWayBill"
                )?.split(".")?.pop() === "pdf" && (
                  <button
                    className="actions blue mr-1"
                    onClick={() =>
                      handlePreviewClick(data, "DraftBillOfLadingOrAirWayBill")
                    }
                  >
                    <span className="material-symbols-rounded">preview</span>
                    <span>Preview</span>
                  </button>
                )}
                <button
                  className="actions blue"
                  disabled={
                    !getDocumentBlobStorageName(
                      data,
                      "DraftBillOfLadingOrAirWayBill"
                    )
                  }
                  onClick={() =>
                    handleDownloadClick(
                      data,
                      "DraftBillOfLadingOrAirWayBill",
                      "Draft_Bill_Of_Lading_Or_Air_Way_Bill_"
                    )
                  }
                >
                  <span className="material-symbols-rounded">download</span>
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className={`d-flex file-input-container ${getDocumentStatusColor(data, "DraftCombinedCertificateValueOrigin")} mt-1`}>
              <span
                className={
                  !getDocumentBlobStorageName(
                    data,
                    "DraftCombinedCertificateValueOrigin"
                  )
                    ? "disabled"
                    : ""
                }
              >
                Draft Combined Certificate Value Origin (CCVO)
                <p className="small-text m-0 mt-1">
                  Uploaded:{" "}
                  {formatDateTime(
                    getDocumentUploadDate(
                      data,
                      "DraftCombinedCertificateValueOrigin"
                    )
                  )}
                </p>
              </span>
              <div className="d-flex">
                {getDocumentBlobStorageName(
                  data,
                  "DraftCombinedCertificateValueOrigin"
                )?.split(".")?.pop() === "pdf" && (
                  <button
                    className="actions blue mr-1"
                    onClick={() =>
                      handlePreviewClick(
                        data,
                        "DraftCombinedCertificateValueOrigin"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">preview</span>
                    <span>Preview</span>
                  </button>
                )}
                <button
                  className="actions blue"
                  disabled={
                    !getDocumentBlobStorageName(
                      data,
                      "DraftCombinedCertificateValueOrigin"
                    )
                  }
                  onClick={() =>
                    handleDownloadClick(
                      data,
                      "DraftCombinedCertificateValueOrigin",
                      "Draft_Combined_Certificate_Value_Origin_"
                    )
                  }
                >
                  <span className="material-symbols-rounded">download</span>
                  <span>Download</span>
                </button>
              </div>
            </div>

            {getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill") && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "BillOfLadingOrAirWayBill")} mt-1`}>
                <div className="d-flex">
                  <span
                    className={
                      !getDocumentBlobStorageName(
                        data,
                        "BillOfLadingOrAirWayBill"
                      )
                        ? "disabled"
                        : ""
                    }
                  >
                    Bill Of Lading/Air Way Bill
                    <p className="small-text m-0 mt-1">
                      Uploaded:{" "}
                      {formatDateTime(
                        getDocumentUploadDate(data, "BillOfLadingOrAirWayBill")
                      )}
                    </p>
                  </span>
                  <div className="d-flex">
                    {getDocumentBlobStorageName(
                      data,
                      "BillOfLadingOrAirWayBill"
                    )?.split(".")?.pop() === "pdf" && (
                      <button
                        className="actions blue mr-1"
                        onClick={() =>
                          handlePreviewClick(data, "BillOfLadingOrAirWayBill")
                        }
                      >
                        <span className="material-symbols-rounded">preview</span>
                        <span>Preview</span>
                      </button>
                    )}
                    <button
                      className="actions blue"
                      disabled={
                        !getDocumentBlobStorageName(
                          data,
                          "BillOfLadingOrAirWayBill"
                        )
                      }
                      onClick={() =>
                        handleDownloadClick(
                          data,
                          "BillOfLadingOrAirWayBill",
                          "Bill_Of_Lading_Or_Air_Way_Bill_"
                        )
                      }
                    >
                      <span className="material-symbols-rounded">download</span>
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {getDocumentBlobStorageName(data, "BillOfLadingOrAirWayBill") 
                && (getDocumentStatus(data, "BillOfLadingOrAirWayBill") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          freightForwarderId: data.freightForwarderId,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Freight Forwarder",
                          additionalInfo: "Bill_Of_Lading_Or_Air_Way_Bill_"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "BillOfLadingOrAirWayBill",
                      })
                      getShippingChatHistory("Freight Forwarder", data.freightForwarderId, "", data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "BillOfLadingOrAirWayBill", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(
              data,
              "CombinedCertificateValueOrigin"
            ) && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "CombinedCertificateValueOrigin")} mt-1`}>
                <div className="d-flex">
                  <span
                    className={
                      !getDocumentBlobStorageName(
                        data,
                        "CombinedCertificateValueOrigin"
                      )
                        ? "disabled"
                        : ""
                    }
                  >
                    Combined Certificate Value Origin (CCVO)
                    <p className="small-text m-0 mt-1">
                      Uploaded:{" "}
                      {formatDateTime(
                        getDocumentUploadDate(
                          data,
                          "CombinedCertificateValueOrigin"
                        )
                      )}
                    </p>
                  </span>

                  <div className="d-flex">
                    {getDocumentBlobStorageName(
                      data,
                      "CombinedCertificateValueOrigin"
                    )?.split(".")?.pop() === "pdf" && (
                      <button
                        className="actions blue mr-1"
                        onClick={() =>
                          handlePreviewClick(
                            data,
                            "CombinedCertificateValueOrigin"
                          )
                        }
                      >
                        <span className="material-symbols-rounded">preview</span>
                        <span>Preview</span>
                      </button>
                    )}
                    <button
                      className="actions blue"
                      disabled={
                        !getDocumentBlobStorageName(
                          data,
                          "CombinedCertificateValueOrigin"
                        )
                      }
                      onClick={() =>
                        handleDownloadClick(
                          data,
                          "CombinedCertificateValueOrigin",
                          "Combined_Certificate_Value_Origin_"
                        )
                      }
                    >
                      <span className="material-symbols-rounded">download</span>
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                {getDocumentBlobStorageName(data, "CombinedCertificateValueOrigin") 
                && (getDocumentStatus(data, "CombinedCertificateValueOrigin") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          freightForwarderId: data.freightForwarderId,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Freight Forwarder",
                          additionalInfo: "Combined_Certificate_Value_Origin_"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "CombinedCertificateValueOrigin",
                      })
                      getShippingChatHistory("Freight Forwarder", data.freightForwarderId, "", data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "CombinedCertificateValueOrigin", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {/* Other shipping documents */}
            {getDocumentBlobStorageName(
              data,
              "FinalDutyAssessmentDocument"
            ) && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "FinalDutyAssessmentDocument")} mt-1`}>
                <div className="d-flex">
                <span>
                  Final Duty Assessment Document
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "FinalDutyAssessmentDocument")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "FinalDutyAssessmentDocument"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "FinalDutyAssessmentDocument")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "FinalDutyAssessmentDocument"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "FinalDutyAssessmentDocument",
                        "Final_Duty_Assessment_Document_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "FinalDutyAssessmentDocument") 
                && (getDocumentStatus(data, "FinalDutyAssessmentDocument") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Final_Duty_Assessment_Document_"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "FinalDutyAssessmentDocument",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "FinalDutyAssessmentDocument", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(
              data,
              "StandardOrganisationOfNigeriaConformityAssessmentProgramme"
            ) && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(
                      data,
                      "StandardOrganisationOfNigeriaConformityAssessmentProgramme"
                    )
                      ? "disabled"
                      : ""
                  }
                >
                  SONCAP
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(
                        data,
                        "StandardOrganisationOfNigeriaConformityAssessmentProgramme"
                      )
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "StandardOrganisationOfNigeriaConformityAssessmentProgramme"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(
                          data,
                          "StandardOrganisationOfNigeriaConformityAssessmentProgramme"
                        )
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "StandardOrganisationOfNigeriaConformityAssessmentProgramme"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "StandardOrganisationOfNigeriaConformityAssessmentProgramme",
                        "Standard_Organisation_Of_Nigeria_Conformity_Assessment_Programme_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") 
                && (getDocumentStatus(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Standard_Organisation_Of_Nigeria_Conformity_Assessment_Programme_"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "StandardOrganisationOfNigeriaConformityAssessmentProgramme",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "StandardOrganisationOfNigeriaConformityAssessmentProgramme", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "PreArrivalAssessmentReport")} mt-1`}>
                <div className="d-flex">
                <span>
                  Pre Arrival Assessment Report (PAAR)
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "PreArrivalAssessmentReport")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "PreArrivalAssessmentReport"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "PreArrivalAssessmentReport")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "PreArrivalAssessmentReport"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "PreArrivalAssessmentReport",
                        "Pre_Arrival_Assessment_Report"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "PreArrivalAssessmentReport") 
                && (getDocumentStatus(data, "PreArrivalAssessmentReport") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Pre_Arrival_Assessment_Report"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "PreArrivalAssessmentReport",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "PreArrivalAssessmentReport", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "DemandNotice") && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "DemandNotice")} mt-1`}>
                <div className="d-flex">
                <span>
                  Demand Notice
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "DemandNotice")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(data, "DemandNotice")?.split(
                    "."
                  )?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() => handlePreviewClick(data, "DemandNotice")}
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={!getDocumentBlobStorageName(data, "DemandNotice")}
                    onClick={() =>
                      handleDownloadClick(data, "DemandNotice", "Demand_Note_")
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "DemandNotice") 
                && (getDocumentStatus(data, "DemandNotice") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Demand_Notice"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "DemandNotice",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "DemandNotice", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "DemandNoticePaymentReceipt")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(
                      data,
                      "DemandNoticePaymentReceipt"
                    )
                      ? "disabled"
                      : ""
                  }
                >
                  Demand Notice Payment Receipt
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "DemandNoticePaymentReceipt")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "DemandNoticePaymentReceipt"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "DemandNoticePaymentReceipt")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "DemandNoticePaymentReceipt"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "DemandNoticePaymentReceipt",
                        "Demand_Notice_Payment_Receipt_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "DemandNoticePaymentReceipt") 
                && (getDocumentStatus(data, "DemandNoticePaymentReceipt") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Demand_Notice_Payment_Receipt"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "DemandNoticePaymentReceipt",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "DemandNoticePaymentReceipt", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") && (
              <div className={`file-input-container ${getDocumentStatusColor(data, "SingleGoodsDeclarationForm")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(
                      data,
                      "SingleGoodsDeclarationForm"
                    )
                      ? "disabled"
                      : ""
                  }
                >
                  SGD Form
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "SingleGoodsDeclarationForm")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "SingleGoodsDeclarationForm"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "SingleGoodsDeclarationForm")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "SingleGoodsDeclarationForm"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "SingleGoodsDeclarationForm",
                        "Single_Goods_Declaration_Form_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "SingleGoodsDeclarationForm") 
                && (getDocumentStatus(data, "SingleGoodsDeclarationForm") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Single_Goods_Declaration_Form"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "SingleGoodsDeclarationForm",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "SingleGoodsDeclarationForm", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(
              data,
              "SingleGoodsDeclarationDetailOfValuationNote"
            ) && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "SingleGoodsDeclarationDetailOfValuationNote")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(
                      data,
                      "SingleGoodsDeclarationDetailOfValuationNote"
                    )
                      ? "disabled"
                      : ""
                  }
                >
                  SGD Detail Of Valuation Note
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(
                        data,
                        "SingleGoodsDeclarationDetailOfValuationNote"
                      )
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "SingleGoodsDeclarationDetailOfValuationNote"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(
                          data,
                          "SingleGoodsDeclarationDetailOfValuationNote"
                        )
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "SingleGoodsDeclarationDetailOfValuationNote"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "SingleGoodsDeclarationDetailOfValuationNote",
                        "Single_Goods_Declaration_Detail_Of_Valuation_Note_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "SingleGoodsDeclarationDetailOfValuationNote") 
                && (getDocumentStatus(data, "SingleGoodsDeclarationDetailOfValuationNote") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Single_Goods_Declaration_Detail_Of_Valuation_Note"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "SingleGoodsDeclarationDetailOfValuationNote",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "SingleGoodsDeclarationDetailOfValuationNote", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "ExchangeControl") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "ExchangeControl")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(data, "ExchangeControl")
                      ? "disabled"
                      : ""
                  }
                >
                  Exchange Control
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "ExchangeControl")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(data, "ExchangeControl")?.split(
                    "."
                  )?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "ExchangeControl")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(data, "ExchangeControl")
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "ExchangeControl",
                        "Exchange_Control_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "ExchangeControl") 
                && (getDocumentStatus(data, "ExchangeControl") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Exchange_Control"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "ExchangeControl",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "ExchangeControl", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "FormM") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "FormM")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(data, "FormM") ? "disabled" : ""
                  }
                >
                  Form M
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(getDocumentUploadDate(data, "FormM"))}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(data, "FormM")?.split(".")?.pop() ===
                    "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() => handlePreviewClick(data, "FormM")}
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={!getDocumentBlobStorageName(data, "FormM")}
                    onClick={() => handleDownloadClick(data, "FormM", "FormM_")}
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "FormM") 
                && (getDocumentStatus(data, "FormM") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "FormM"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "FormM",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "FormM", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(
              data,
              "ShippingAndTerminalCompanyReceipts"
            ) && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "ShippingAndTerminalCompanyReceipts")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(
                      data,
                      "ShippingAndTerminalCompanyReceipts"
                    )
                      ? "disabled"
                      : ""
                  }
                >
                  Shipping And Terminal Company Receipts
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(
                        data,
                        "ShippingAndTerminalCompanyReceipts"
                      )
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "ShippingAndTerminalCompanyReceipts"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(
                          data,
                          "ShippingAndTerminalCompanyReceipts"
                        )
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "ShippingAndTerminalCompanyReceipts"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "ShippingAndTerminalCompanyReceipts",
                        "Shipping_And_Terminal_Company_Receipts_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>
                
                {getDocumentBlobStorageName(data, "ShippingAndTerminalCompanyReceipts") 
                && (getDocumentStatus(data, "ShippingAndTerminalCompanyReceipts") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Shipping_And_Terminal_Company_Receipts"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "ShippingAndTerminalCompanyReceipts",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "ShippingAndTerminalCompanyReceipts", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "ProofOfDelivery") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "ProofOfDelivery")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(data, "ProofOfDelivery")
                      ? "disabled"
                      : ""
                  }
                >
                  Proof Of Delivery
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "ProofOfDelivery")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(data, "ProofOfDelivery")?.split(
                    "."
                  )?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "ProofOfDelivery")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(data, "ProofOfDelivery")
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "ProofOfDelivery",
                        "Proof_Of_Delivery_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "ProofOfDelivery") 
                && (getDocumentStatus(data, "ProofOfDelivery") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Proof_Of_Delivery"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "ProofOfDelivery",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "ProofOfDelivery", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "NAFDACReleaseNote") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "NAFDACReleaseNote")} mt-1`}>
                <div className="d-flex">
                <span
                  className={
                    !getDocumentBlobStorageName(data, "NAFDACReleaseNote")
                      ? "disabled"
                      : ""
                  }
                >
                  NAFDAC Release Note
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "NAFDACReleaseNote")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(data, "NAFDACReleaseNote")?.split(
                    "."
                  )?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "NAFDACReleaseNote")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(data, "NAFDACReleaseNote")
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "NAFDACReleaseNote",
                        "NAFDAC_Release_Note_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "NAFDACReleaseNote") 
                && (getDocumentStatus(data, "NAFDACReleaseNote") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "NAFDAC_Release_Note"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "NAFDACReleaseNote",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "NAFDACReleaseNote", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "AcknowledgementLetter") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "AcknowledgementLetter")} mt-1`}>
                <div className="d-flex">
                <span>
                  Acknowledgement Letter
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "AcknowledgementLetter")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "AcknowledgementLetter"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "AcknowledgementLetter")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(data, "AcknowledgementLetter")
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "AcknowledgementLetter",
                        "Acknowledgement_Letter_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "AcknowledgementLetter") 
                && (getDocumentStatus(data, "AcknowledgementLetter") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Acknowledgement_Letter"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "AcknowledgementLetter",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "AcknowledgementLetter", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "ExitNote") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "ExitNote")} mt-1`}>
                <div className="d-flex">
                <span>
                  Customs Exit Note
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(getDocumentUploadDate(data, "ExitNote"))}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(data, "ExitNote")?.split(
                    "."
                  )?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() => handlePreviewClick(data, "ExitNote")}
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={!getDocumentBlobStorageName(data, "ExitNote")}
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "ExitNote",
                        "Customs_Exit_Note_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "ExitNote") 
                && (getDocumentStatus(data, "ExitNote") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Exit_Note"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "ExitNote",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "ExitNote", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {getDocumentBlobStorageName(data, "ContainerRefundDocuments") && (
              <div className={` file-input-container ${getDocumentStatusColor(data, "ContainerRefundDocuments")} mt-1`}>
                <div className="d-flex">
                <span>
                  Container Refund Documents
                  <p className="small-text m-0 mt-1">
                    Uploaded:{" "}
                    {formatDateTime(
                      getDocumentUploadDate(data, "ContainerRefundDocuments")
                    )}
                  </p>
                </span>
                <div className="d-flex">
                  {getDocumentBlobStorageName(
                    data,
                    "ContainerRefundDocuments"
                  )?.split(".")?.pop() === "pdf" && (
                    <button
                      className="actions blue mr-1"
                      onClick={() =>
                        handlePreviewClick(data, "ContainerRefundDocuments")
                      }
                    >
                      <span className="material-symbols-rounded">preview</span>
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    className="actions blue"
                    disabled={
                      !getDocumentBlobStorageName(
                        data,
                        "ContainerRefundDocuments"
                      )
                    }
                    onClick={() =>
                      handleDownloadClick(
                        data,
                        "ContainerRefundDocuments",
                        "Container_Refund_Documents_"
                      )
                    }
                  >
                    <span className="material-symbols-rounded">download</span>
                    <span>Download</span>
                  </button>
                </div>
                </div>

                {getDocumentBlobStorageName(data, "ContainerRefundDocuments") 
                && (getDocumentStatus(data, "ContainerRefundDocuments") === null) && <div className="mt-1"
                style={{display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #d9d9d9", gap: "16px"}}> 
                                             
                  <button className="link-button red f-12"
                    onClick={() => {setOpenChatHistory(true);
                      setFormData({
                        ...formData,
                          shippingDocumentId: data.id,
                          localClearingAgentId: data.localClearingAgentId,
                          receiver: "Local Clearing Agent",
                          additionalInfo: "Container_Refund_Documents"
                      });
                      setDocumentRejectionData({
                        status: true,
                        documentName: "ContainerRefundDocuments",
                      })
                      getShippingChatHistory("Local Clearing Agent", "", data.localClearingAgentId, data.id);                      
                    }}
                    ><span className="material-symbols-rounded f-16">close</span> Reject</button>
                  <button className="link-button green f-12"
                    onClick={() => handleDocumentApproval(data, "ContainerRefundDocuments", true)}
                    ><span className="material-symbols-rounded f-16">check</span> Approve</button>                                     
                </div>}
              </div>
            )}

            {data.trasitOfficerValidation === null &&
              !!data?.shippingDocumentAttachments?.length && (
                <>
                  <div style={{ marginTop: "40px" }}>
                    <input
                      onClick={(event) => setIsChecked(!isChecked)}
                      type="checkbox"
                    />
                    <small className="ml-2" style={{ fontSize: "12px" }}>
                      I,{" "}
                      <strong className="uppercase">
                        {user?.firstName} {user?.lastName}
                      </strong>
                      , approve the above stated shipping documents.
                    </small>
                  </div>
                  <div
                    style={{
                      gap: "8px",
                      padding: "16px 0",
                      borderTop: "1px solid #d9d9d9",
                      marginTop: "16px",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    `
                    <button
                      style={{ padding: "12px 20px" }}
                      type="submit"
                      disabled={!isChecked || isSubmitting}
                      className="custom-button orange"
                      onClick={() => handleValidation()}
                    >
                      {isSubmitting ? "Loading..." : "Approve"}
                    </button>
                  </div>
                </>
              )}
          </div>
        </div>
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
                setIsSubmitting(false);
                clearData();
              }}
            >
              close
            </span>
          </div>
          <div className="modal-body" style={{ minHeight: "300px" }}>
            <label>
              <span className="errorX mr-2">*</span>Entity
            </label>
            <select
              value={formData.receiver}
              onChange={handleChange}
              name="receiver"
              required
            >
              <option value="" disabled>
                --Select--
              </option>
              <option value="Freight Forwarder">Freight Forwarder</option>
              <option value="Local Clearing Agent">Local Clearing Agent</option>
            </select>

            {!formData.receiver && <p>No source selected yet.</p>}
            {!isChatLoading && formData.receiver && !chats.length && (
              <p>No Chats Found.</p>
            )}

            {!isChatLoading && formData.receiver && (
              <div className="chat-container mt-1" style={{maxHeight: "250px"}}>
                {chats.map((chat: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`chat-dialog ${
                        chat.sender === "TransitOfficer" ? "right" : "left"
                      }`}
                    >
                      <label className="title">
                        {chat.sender === "TransitOfficer"
                          ? "Transit Team"
                          : formData.receiver}
                      </label>
                      <p>{chat.message}</p>
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
          {/* Don't allow sending of chat to Freight Forwarder after LCA Assignment */}
          {((formData.receiver === "Freight Forwarder") 
          // {((formData?.localClearingAgentId === null && formData.receiver === "Freight Forwarder") 
            || (formData?.localClearingAgentId !== null && formData.receiver === "Local Clearing Agent")) && (
            <form onSubmit={handleSendChat}>
              <div className="modal-footer">
                <textarea
                  name="comment"
                  placeholder={`Message for ${
                    formData.receiver === "Freight Forwarder"
                      ? "Freight Forwarder"
                      : formData.receiver === "Local Clearing Agent"
                      ? "Local Clearing Agent"
                      : ""
                  }...`}
                  rows={4}
                  maxLength={300}
                  onChange={handleChange}
                  value={formData.comment}
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.comment}
                  className="custom-button orange"
                >
                  {isSubmitting ? "Loading..." : "Send"}
                </button>
              </div>
              <small
                style={{ fontSize: "10px" }}
                className={
                  formData.comment.length >= 300 ? "mt-1 error" : "mt-1"
                }
              >
                {formData.comment.length}/300 Characters
              </small>

              <div className="alert alert-warning" style={{margin: "12px 0 0 0 ", padding: "8px", width: "auto", alignItems: "start"}}>
                  <span className="material-symbols-outlined mr-2" style={{color: "#e4b14b", fontSize: "16px"}}>warning</span>
                  <div style={{fontSize: "10.5px"}}>
                      <p style={{margin: 0, marginBottom: "4px"}}>Keep in mind information</p>
                      <span style={{fontWeight: "300"}}>Sending a chat requires the receiver to reupload the stated shipping document(s) before approval. Avoid initiating if no reupload is needed.</span>
                  </div>
              </div>
            </form>
          )}
        </Modal>
        <Modal
          isOpen={isLoading}
          style={customStyles}
          className="modal modal-sm"
          ariaHideApp={false}
        >
          <div className="loader">
            <img src={loading} alt="loading" />
            <p>Loading...</p>
          </div>
        </Modal>
        <ToastContainer />
      </div>
      <ToastContainer />
    </Layout>
  );
};

export default ShippingDocumentsDetail;
