import html3pdf from 'html3pdf';
import { currentDatetime, customStyles, formatCurrency, formatDateTime, getCurrencySymbol, handleDownloadForMOTChangeRequest, handlePreviewForMOTChangeRequest } from '../../helpers';
import logo from "../../assets/images/logo-2.png"
import {useEffect, useState} from "react"
import { useSelector } from 'react-redux';
import Modal from "react-modal"
import { makeGetRequest, makePatchRequest, makePostRequest } from "../../request";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/loading.gif"
import loading2 from "../../assets/images/loading2.gif"


const PdfGenerator = (props) => {
  const {role} = props
  const param = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector(state => state.tepngUser.value);  
  // const permissions = useSelector((state) => state.permissions.value);
  const currentRolePage = location?.pathname.split("/")[1]
  const accessToken = useSelector(state => state.accessToken.value);
  const [data, setData] = useState([])
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([])
  const [motPackages, setMotPackages] = useState([])
  // const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([])
  // const [items, setItems] = useState([])

  const generatePdf = () => {
    const pdfContent = document.getElementById('pdf-content');

    html3pdf(pdfContent, {
      margin: 10,
      filename: `ModeOfTransportation-${currentDatetime.substring(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html3canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    });
  };

  const handleDownloadClick = async (attachment, modeOfTransportationChangeRequestAttachment) => {
    // Set isLoading to true when the download process starts
    setIsLoading(true);

    // Call the function to handle the document download
    const result = await handleDownloadForMOTChangeRequest(attachment, modeOfTransportationChangeRequestAttachment)

    // Set isLoading to false based on the result of the download operation
    setIsLoading(result);
  };

  const handlePreviewClick = async (attachmentId) => {
    // Set isLoading to true when the download process starts
    setIsLoading(true);

    // Call the function to handle the document download
    const result = await handlePreviewForMOTChangeRequest(attachmentId)

    // Set isLoading to false based on the result of the download operation
    setIsLoading(result);
  };


  const ApprovalRoles = [
    "Transit Manager", // 0 - 10,000
    "Deputy General Manager Technical Logistics", // > 10,000 - 50,000
    "General Manager Technical Logistics", // > 50,000 - 75,000
    "Executive Director Technical Directorate" // > 75,000
  ]

  const formattedApprovalRoles = ApprovalRoles.map(role => role.toLocaleLowerCase().replaceAll(' ',''))
  const [response, setResponse] = useState()
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const getModeOfTransportationById = () => {
    setIsLoading(true)
    var request = {
        what: "getModeOfTransportationById",
        id: param.id,
    };
    
    makeGetRequest(request)
        .then((response) => {
            setIsLoading(false)
            const res = response.data.data
            setData(res)

            const purchaseOrderItemRequests = res.purchaseOrderItemRequests
            setPurchaseOrderItems(
              purchaseOrderItemRequests.map((item) => ({
                id: item.id,
                purchaseOrderNumber: item.purchaseOrderNumber,
                purchaseOrderItemNumber: item.purchaseOrderItemNumber,
                materialNumber: item.materialNumber,
                materialDescription: item.materialDescription,
                quantity: item.quantity,
                purchaseRequestDate: item.purchaseOrder.purchaseRequestDate,
                purchaseRequisitionNumber: item.purchaseOrder.purchaseRequisitionNumber,
                purchaseOrderEstimatedTimeOfDelivery: item.purchaseOrder.purchaseOrderEstimatedTimeOfDelivery,
              }))
            )

            const motPackages = res.modeOfTransportationPackageDetails
            setMotPackages(motPackages.map((pck) => ({
              estimatedDimensions: pck.estimatedDimension,
              estimatedWeight: pck.estimatedWeight,
              packageItems: pck.packageItemForModeOfTransportation
            })))
            // setPurchaseOrderDetails(purchaseOrderItemRequests
            //   ?.map((item) => item.purchaseOrder) // Extract purchaseOrder
            //   .filter((record, index, self) => 
            //     self.findIndex((r) => r.purchaseOrderNumber === record.purchaseOrderNumber) === index // Filter by distinct purchaseOrderNumber
            //   ))
            // setItems(
            //   purchaseOrderItemRequests.map((item) => ({
            //     purchaseOrderNumber: item.purchaseOrderNumber,
            //     quantity: item.quantity,
            //     materialNumber: item.materialNumber,
            //     itemNumber: item.purchaseOrderItemNumber,
            //     materialDescription: item.materialDescription,
            //   }))
            // )
        })
        .catch((error) => 
            {console.log(error); setIsLoading(false)}
        );
    }
    // console.log(window.location.pathname.split('/')[1])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitResponse = () => {
      setIsSubmitting(true)
      var request = {
          what: "SubmitApproval",
          data: {
              modeOfTransportationId: data.id,
              userId: user.id,
              roleName: role,
              response: response,
              sender: "Approvers",
              senderRole: role,
              comment: chatData.comment,
              receiver: chatData.entityRepresentativeId
          },
      };
      
      makePostRequest(request)
          .then((response) => {
              setIsSubmitting(false)
              toast.success(response.msg)
              setResponse(null)
              const role = window.location.pathname.split('/')[1]
              setTimeout(() => {
                  navigate(`/${role}/modeoftransportationchange`)
              }, 1000);  
          })
          .catch((error) => 
              {toast.error(error.msg); setIsSubmitting(false); setResponse(null)}
          );
  }

  const submitRequestersManagerOrGMResponse = (callResponse) => {
    setIsSubmitting(true)
    var request = {
        what: "",
        data: {
            modeOfTransportationId: data.id,
            response: callResponse ? callResponse : response,
            // Don't include chat payload if callResponse is "Approved"
            ...(!callResponse && { comment: chatData.comment }),
            ...(!callResponse && { receiver: chatData.entityRepresentativeId }),
            ...(!callResponse && { sender: "Approvers" }),
            ...(!callResponse && { senderRole: role }),
        },
    };

    if(currentRolePage === "entitygeneralmanager") {
      request.data.requesterGeneralManagerEmail = user.email
      request.what = "SubmitRequesterGeneralManagerApproval"
    } 

    if(currentRolePage === "entitymanager") {
      request.data.requesterManagerEmail = user.email
      request.what = "SubmitRequesterManagerApproval"
    }
    
    makePatchRequest(request)
        .then((response) => {
            setIsSubmitting(false)
            toast.success(response.msg)
            request.data = {}
            setTimeout(() => {
              if(currentRolePage === "entitymanager") navigate("/entitymanager/modeoftransportationchange")
              if(currentRolePage === "entitygeneralmanager") navigate("/entitygeneralmanager/modeoftransportationchange")
            }, 1000);   
        })
        .catch((error) => 
            {toast.error(error); setIsSubmitting(false); request.data = {}}
        );
  }

  const [openChatHistory, setOpenChatHistory] = useState(false)
  const [chats, setChats] = useState([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatData, setChatData] = useState({
      modeOfTransportationId: "", 
      entityRepresentativeId: "", 
      comment: "",
  })
  
  const clearChatData = () => {
      setChatData({
          modeOfTransportationId: "", 
          entityRepresentativeId: "", 
          comment: "",
      })
  }
    
  const getMotChatHistory = (modeOfTransportationId) => {
    setIsChatLoading(true)
    var request = {
        what: "ModeOfTransportationChatHistory",
        params: {
            modeOfTransportationId: modeOfTransportationId,
            orderBy: 1
        }
    };
    
    makeGetRequest(request)
        .then((response) => {
            setIsChatLoading(false)
            const res = response.data.data
            setChats(res.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()))
        })
        .catch((error) => 
            {toast.error(error.msg); setIsChatLoading(false)}
        );
  }

  const handleSendChat = (event) => {
    event.preventDefault()
    if(currentRolePage === "entitymanager" || currentRolePage === "entitygeneralmanager") submitRequestersManagerOrGMResponse("")
    if(formattedApprovalRoles.includes(currentRolePage)) submitResponse()
  }

  const approvalText = (response) => {
    switch(response){
      case "Approved":
        return response

      case "Rejected":
        return response

      case "Review":
        return response
      
      default:
        return null
    }
  }

  const approvalStyling = (response) => {
    switch(response){
      case "Approved":
        return "uppercase text-green"

      case "Rejected":
        return "uppercase text-red"

      case "Review":
        return "uppercase text-blue"
      
      default:
        return null
    }
  }

  // const [isSubmitting2, setIsSubmitting2] = useState(false)
  // const handleShippingOfficerAcknowledgement = () => {
  //   setIsSubmitting2(true)
  //   var request = {
  //       what: "handleShippingOfficerAcknowledgement",
  //       data: {
  //           modeOfTransportationId: param?.id,
  //           shippingOfficerId: user?.id,
  //           shippingOfficerCheck: "Approved"
  //       },
  //   };

  //   makePatchRequest(request)
  //       .then((response) => {
  //           setIsSubmitting2(false)
  //           toast.success(response.msg) 
  //           navigate("/transitofficer/modeoftransportationchange")
  //       })
  //       .catch((error) => 
  //           {toast.error(error); setIsSubmitting2(false);}
  //       );
  //   }

  const getMaterialDescription = (purchaseOrderItemRequestId) => {
    return purchaseOrderItems.find(
      (item) => item.id === purchaseOrderItemRequestId
    )?.materialDescription
  }

  const getMaterialNumber = (purchaseOrderItemRequestId) => {
    return purchaseOrderItems.find(
      (item) => item.id === purchaseOrderItemRequestId
    )?.materialNumber
  }

  useEffect(() => {
    if(accessToken) getModeOfTransportationById()
    // eslint-disable-next-line
  }, [])

  return (
    <div>      
    <div style={{padding: "16px 0px"}}>
      {/* Button to generate PDF */}
      <div className='actions blue' style={{marginLeft: "16px", width: "fit-content"}} onClick={generatePdf}>
        <span className="material-symbols-rounded">download</span>
        <span>Download PDF</span>
      </div>
      <hr style={{border: ".4px solid #e9e9e9", marginTop: "16px"}} />

      {/*  div with content for PDF generation */}
      <div id="pdf-content" className='pdf-content' style={{padding: "0 24px"}}>
        <div className='d-flex' style={{alignItems: "center", padding: "16px 0", borderBottom: "1.5px solid #FEA628"}}>
          <img width="40px" height="28px" src={logo} alt='totalenergies' />
          <h6 style={{margin: "0"}}>TECHNICAL LOGISTICS TUCN</h6>
          <span></span>
        </div>
        <h5 style={{textAlign: "center", margin:"16px 0"}}>REQUEST FOR MODIFICATION OF TRANSPORTATION MODE</h5>

        <h6 className='template-table-title'>Request Details</h6>
        <table className='template-form'>
          <tbody>
            <tr>
              <td>Change Request Date</td>
              <td className='highlight'>{formatDateTime(data.createdDate)}</td>
              <td>Purchase Order Number(s)</td>
              <td className='highlight'>{
                data?.purchaseOrderItemRequests
                ?.map((item) => item.purchaseOrderNumber) // Extract the purchaseOrderNumber
                ?.filter((purchaseOrderNumber, index, self) => 
                    self.indexOf(purchaseOrderNumber) === index // Keep only distinct values
                )
                ?.join(", ") // Join distinct numbers with commas
              }</td>
            </tr>
          </tbody>
        </table>

        <h6 className='template-table-title'>Requester's Information</h6>
        <table className='template-form'>
          <tbody>
            <tr>
              <td>Name of Requester</td>
              <td>{data.user?.firstName} {data.user?.lastName}</td>
              <td>IGG</td>
              <td>{data.igg}</td>
            </tr>
            <tr>
              <td>Department</td>
              <td>{data.department}</td>
              <td>Division</td>
              <td>{data.division}</td>
            </tr>
          </tbody>
        </table>

        <h6 className='template-table-title'>Materials</h6>
        <table className='template-form' style={{ tableLayout: 'fixed', width: '100%', borderCollapse: "separate" }}>
          <thead>
            <tr>
              <th style={{ width: '12.5%' }}>PO Number</th>
              <th style={{ width: '12.5%' }}>Item Number</th>
              <th style={{ width: '12.5%' }}>Material Number</th>              
              <th style={{ width: '12.5%' }}>Material Description</th>
              <th style={{ width: '12.5%', textAlign: "center" }}>Quantity</th>
              <th style={{ width: '12.5%' }}>PR Date</th>
              <th style={{ width: '12.5%' }}>PR Number</th>
              <th style={{ width: '12.5%' }}>Purchase ETD</th>
            </tr>
          </thead>
          <tbody>
            {
              purchaseOrderItems?.map((data, index) => {
                return (
                  <tr key={index} className='plain'>
                    <td>{data.purchaseOrderNumber}</td>
                    <td>Item {data.purchaseOrderItemNumber}</td>
                    <td>{data.materialNumber}</td>                    
                    <td>{data.materialDescription}</td>
                    <td className='text-center'>{data.quantity}</td>
                    <td>{formatDateTime(data.purchaseRequestDate)}</td>
                    <td>{data.purchaseRequisitionNumber}</td>
                    {/* <td>{formatDateTime(data.purchaseOrderEstimatedTimeOfDelivery)}</td> */}
                    <td>03/11/2024 09:38</td>
                  </tr>
                )
              })
            }         
          </tbody>
        </table>

        {
          !!motPackages.length &&<>
            <h6 className='template-table-title'>Packaging Information</h6>
              <table className='template-form' style={{ tableLayout: 'fixed', width: '100%', borderCollapse: "separate" }}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Package Number</th>
                    <th style={{ width: '15%' }}>Estimated Dimension (LxWxH)</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Estimated Weight (KG)</th> 
                    <th style={{ width: '15%' }}>Material Number</th>
                    <th style={{ width: '30%' }}>Description</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    motPackages?.map((data, index) => {
                      return (
                        <tr key={index} className='plain'>
                          <td>Package {index+1}</td>
                          <td>{data.estimatedDimensions}cm</td>
                          <td className='text-center'>{data.estimatedWeight}</td>
                          {/* Material Number Column */}
                          <td style={{
                              padding: 0,
                              backgroundColor: "transparent",
                              width: "100%",
                              verticalAlign: "top",
                          }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  {data.packageItems
                                      .map(item => item.purchaseOrderItemRequestId)
                                      .map(id => getMaterialNumber(id))
                                      .map((material, idx) => (
                                          <div key={idx} style={{ backgroundColor: "#F5F5F5", padding: "5px", minHeight: "30px" }}>
                                              {material}
                                          </div>
                                      ))}
                              </div>
                          </td>
                          
                          {/* Material Description Column */}
                          <td style={{
                              padding: 0,
                              backgroundColor: "transparent",
                              width: "100%",
                              verticalAlign: "top",
                          }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  {data.packageItems
                                      .map(item => item.purchaseOrderItemRequestId)
                                      .map(id => getMaterialDescription(id))
                                      .map((material, idx) => (
                                          <div key={idx} style={{ backgroundColor: "#F5F5F5", padding: "5px", minHeight: "30px" }}>
                                              {material}
                                          </div>
                                      ))}
                              </div>
                          </td>
                          {/* Material Description Column */}
                          <td style={{
                              padding: 0,
                              backgroundColor: "transparent",
                              width: "100%",
                              verticalAlign: "top",
                              textAlign: "center"
                          }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  {data.packageItems
                                      .map(item => item.quantity)
                                      .map((material, idx) => (
                                          <div key={idx} style={{ backgroundColor: "#F5F5F5", padding: "5px", minHeight: "30px" }}>
                                              {material}
                                          </div>
                                      ))}
                              </div>
                          </td>
                          
                        </tr>
                      )
                    })
                  } 
                  <tr>
                    <td style={{backgroundColor: "#f5f5f5"}} colSpan={2}></td>
                    <td className='text-center' style={{backgroundColor: "#FFD79E"}}>{motPackages
                                      ?.map(item => item.estimatedWeight)
                                      .reduce((acc, pck) => acc + Number(pck), 0)}</td>
                    <td style={{backgroundColor: "#f5f5f5"}}></td>
                    <td style={{backgroundColor: "#f5f5f5"}}></td>
                    <td className='text-center' style={{backgroundColor: "#FFD79E"}}>{purchaseOrderItems
                                      ?.map(item => item.quantity)
                                      .reduce((acc, item) => acc + Number(item), 0)}</td>
                    
                  </tr>        
                </tbody>
              </table>
          </>
        }

        {/*<h6 className='template-table-title'>Purchase Orders</h6>
        <table className='template-form'>
          <thead>
            <tr>
              <th>Purchase Order Number</th>
              <th>Purchase Request Date</th>
              <th>Purchase Requisition Number</th>
              <th>Purchase Estimated Time of Delivery</th>
            </tr>
          </thead>
          <tbody>
            {
              purchaseOrderDetails?.map((purchaseOrder, index) => {
                return (
                  <tr key={index} className='plain'>
                    <td>{purchaseOrder.purchaseOrderNumber}</td>
                    <td>{formatDateTime(purchaseOrder.purchaseRequestDate)}</td>
                    <td>{purchaseOrder.purchaseRequisitionNumber}</td>
                    <td>{formatDateTime(purchaseOrder.purchaseOrderEstimatedTimeOfDelivery)}</td>
                  </tr>
                )
              })
            }         
          </tbody>
        </table>  
        
        <h6 className='template-table-title'>Materials</h6>
        <table className='template-form's>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Item Number</th>
              <th>Material Number & Description</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {
              items?.sort((a,b) => a.itemNumber - b.itemNumber)?.map((item, index) => {
                return (
                  <tr key={index} className='plain'>
                    <td>{item.purchaseOrderNumber}</td>
                    <td>Item {item.itemNumber}</td>
                    <td><span className='fw-600'>{item.materialNumber}</span> <br/><span style={{fontWeight:"normal"}}>{item.materialDescription}</span></td>
                    <td>{item.quantity}</td>
                  </tr>
                )
              })
            }         
          </tbody>
        </table>*/}

        <h6 className='template-table-title'>Mode of Transport Analysis <small>(Must be completed before Justification, Approval and Validation of Request)</small></h6>
        <table className='template-form'>
          <tbody>
            {/* <tr>
              <td>Estimated Dimensions (CM)</td>
              <td>{data.estimatedDimensions}</td>
              <td>Estimated Weight (KG)</td>
              <td>{data.estimatedWeight}</td>
            </tr> */}
            <tr style={{height: "60px"}}>
              <td>Justification for the Request</td>
              <td colSpan={3}>{data.justification}</td>
            </tr>
          </tbody>
        </table> 

        <h6 className='template-table-title'>Approval by Request Hierarchy</h6>
        <table className='template-form'>
          <thead>            
            <tr>
              <th>Job Function/ Position</th>
              <th>Name</th>
              <th>Response</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody> 
            <tr className='plain'>
              <td>Requester's Manager</td>
              <td>{data.requesterManagerName}</td>
              <td className={approvalStyling(data.requesterManagerApproval)}>
                {data?.requesterManagerApproval !== null && <>{approvalText(data?.requesterManagerApproval)}</>}
              </td>
              <td>{data.requesterManagerApproval !== null ? formatDateTime(data.requesterManagerDate): null}</td>
            </tr>
            <tr className='plain'>
              <td>Requester's GM/EGM</td>
              <td>{data.requesterGeneralManagerName}</td>
              <td className={approvalStyling(data.requesterGeneralManagerApproval)}>
                {data?.requesterGeneralManagerApproval !== null && <>{approvalText(data.requesterGeneralManagerApproval)}</>}
              </td>
              <td>{data.requesterGeneralManagerApproval !== null ? formatDateTime(data.updatedDate): null}</td>
            </tr>          
          </tbody>
        </table> 

        <h6 className='template-table-title'>Validation of Request</h6>
        <table className='template-form'>
          <tbody>
            <tr>              
              <td>Estimated Sea Freight Cost</td>
              <td className='highlight' style={{fontWeight: "500"}}>{getCurrencySymbol(data.freightCostCurrency)}{ formatCurrency( data.estimatedCostSeaFreight ) }</td>
              <td>Estimated Air Freight Cost</td>
              <td className='highlight' style={{fontWeight: "500"}}>{getCurrencySymbol(data.freightCostCurrency)}{ formatCurrency( data.estimatedCostAirFreight ) }</td>
            </tr>
          </tbody>
        </table>
        <table className='template-form'>
          <thead>
            <tr>
              <th>Job Function/ Position</th>
              <th>Name</th>
              <th>Response | Comment</th>
              <th>Date/Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className='plain'>
              <td>Shipping Officer</td>
              <td>{data?.shippingOfficerName}</td>
              <td className={approvalStyling(data?.shippingOfficerCheck)}>{data?.shippingOfficerCheck ? "Seen" : null}</td>
              <td>{formatDateTime(data?.shippigOfficerDate)}</td>
            </tr>
            {
                data?.approval?.map((approval, index) => {
                  return (
                    <tr className='plain' key={index}>
                      <td>
                          <div className='mb-1'>{approval?.role.name}</div>
                          {/* <span className={approvalStyling(approval?.approved)}>
                            {approvalText(approval?.approved)}
                          </span>                    */}
                      </td>
                      <td>{approval?.user.firstName} {approval?.user.lastName}</td>
                      <td>
                        <span className={approvalStyling(approval?.approved)}>
                          {approvalText(approval?.approved)}
                        </span>                  
                        {` | ${approval?.comment}`}
                      </td>
                      <td>{approval ? formatDateTime(approval?.createdDate): null}</td>
                    </tr> 
                )
              })
            }                   
          </tbody>
        </table> 

        <table className='template-form mt-2'>
          <tbody>
            <tr>
              <td>Freight Forwarder</td>
              {/* <td colSpan={2}>{data.freightForwarder?.firstName} {data.freightForwarder?.lastName} | {data.freightForwarder?.companyName}</td> */}
              <td colSpan={2}>{data.freightForwarder?.companyName}</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>

  {/* Shipping Officer Acknowledgement */}
    {/* {permissions?.includes("ValidateMOT") &&
    currentRolePage==="transitofficer" &&
    <div style={{padding: "16px"}}>
      <div style={{margin: "0", padding: "16px 0", borderTop: "1px solid #d9d9d9"}}>
        <input 
        disabled={!data?.estimatedCostSeaFreight === 0 && !data?.estimatedCostAirFreight === 0} 
        title={!data?.estimatedCostSeaFreight === 0 && !data?.estimatedCostAirFreight === 0 ? "Please complete the Mode of Trasnportation Analysis form to enable the checkbox" : ""}
        onClick={event => setIsChecked(event.target.checked)} type="checkbox" />
        <small className="ml-2" style={{fontSize: "12px"}}>I, <strong className="uppercase">{user?.firstName} {user?.lastName}</strong>, acknowledge the request to change the mode of transportation for the above stated materials.</small>
      </div>
      <button 
        disabled={isSubmitting2 || !isChecked}
        onClick={handleShippingOfficerAcknowledgement}
        style={{width:"100%"}} 
        className='custom-button orange d-flex-center'>{isSubmitting2 ? "Loading..." : "Acknowledge Request"}</button>
    </div>} */}

    {!!data?.modeOfTransportationAttachments?.length && 
    <div className="mt-1" style={{borderTop: ".4px solid #e9e9e9", padding: "16px 24px"}}> 
      <p className="m-0 fw-500" style={{fontSize: "12px"}}>Attachments</p>
        {
            data?.modeOfTransportationAttachments.map((attachment, index) => {
                return (
                    <div key={index} className="d-flex file-input-container mt-1 mb-1">
                        <span className="d-flex-2">
                            <span>{index+1}. {attachment.documentName.replaceAll("_", " ")}</span>
                        </span>  
                        <div className='d-flex-2'>                                                
                            <button className="actions blue" 
                            onClick={() => handleDownloadClick(attachment, attachment.documentName)}
                            >
                                <span className="material-symbols-rounded">download</span>
                                <span>Download</span>
                            </button>
                            {attachment?.documentBlobStorageName?.split(".")[1] === "pdf" &&<button className='actions blue mr-1'
                                onClick={() => handlePreviewClick(attachment.id)}
                                >
                                    <span className="material-symbols-rounded">preview</span>
                                    <span>Preview</span>
                            </button>}                                            
                        </div>
                    </div> 
                )
            })
        }
    </div>}

    {/* Entity Manager - Checks if its the valid role and if the valid role is yet to approve  */}
    {(currentRolePage==="entitymanager" ) && data.requesterManagerApproval === null &&
        <>
          <div style={{margin: "0", padding: "16px 16px 36px 16px", borderTop: "1px solid #d9d9d9"}}>
            <input onClick={event => setIsChecked(event.target.checked)} type="checkbox" />
            <small className="ml-2" style={{fontSize: "12px"}}>I, <strong className="uppercase">{user?.firstName} {user?.lastName}</strong>, acknowledge the request to change the mode of transportation for the above stated materials.</small></div>

          {!isSubmitting && <div style={{gap: "8px", paddingBottom: "24px", margin: "0 16px"}} className="d-flex-center">
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" className="custom-button red-outline"
                onClick={() => {
                  setResponse("Rejected");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>thumb_down</span>
                  Reject</button>
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" 
                className="custom-button blue-outline"
                onClick={() => {
                  setResponse("Review");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>feedback</span>
                  Review</button>
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" 
                className="custom-button orange"
                onClick={() => submitRequestersManagerOrGMResponse("Approved")}>                      
                  <span className='material-symbols-rounded'>thumb_up</span>
                  Approve</button>
          </div>}
          {isSubmitting && <div className="d-flex-center" style={{gap: "12px", alignItems: "center"}}>
              <img src={loading2} width="24px" height="24px" alt="" />
              <p style={{fontSize: "12px"}}>Response Submitting...</p>
          </div>}
        </>
    }

    {/* Entity General Manager - Checks if its the valid role, if the first level has approved and if the valid role is yet to approve */}
    {(currentRolePage==="entitygeneralmanager" && data.requesterManagerApproval !== null && data.requesterGeneralManagerApproval === null) && 
        <>
          <div style={{margin: "0", padding: "16px 24px 36px 24px", borderTop: "1px solid #d9d9d9"}}>
            <input onClick={event => setIsChecked(event.target.checked)} type="checkbox" />
            <small className="ml-2" style={{fontSize: "12px"}}>I, <strong className="uppercase">{user?.firstName} {user?.lastName}</strong>, acknowledge the request to change the mode of transportation for the above stated materials.</small></div>

          {!isSubmitting && <div style={{gap: "12px", paddingBottom: "24px", margin: "0 16px"}} className="d-flex-center">
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" className="custom-button red-outline"
                onClick={() => {
                  setResponse("Rejected");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>thumb_down</span>
                  Reject</button>
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" 
                className="custom-button blue-outline"
                onClick={() => {
                  setResponse("Review");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>feedback</span>
                  Review</button>
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" 
                className="custom-button orange"
                onClick={() => submitRequestersManagerOrGMResponse("Approved")}>
                  <span className='material-symbols-rounded'>thumb_up</span>
                  Approve</button>
          </div>}
          {isSubmitting && <div className="d-flex-center" style={{gap: "12px", alignItems: "center"}}>
              <img src={loading2} width="24px" height="24px" alt="" />
              <p style={{fontSize: "12px"}}>Response Submitting...</p>
          </div>}
        </>
    }    

    {formattedApprovalRoles.includes(currentRolePage) 
    && !data?.approval?.find(approval => (approval?.role?.name).replaceAll(" ", "").toLocaleLowerCase() === currentRolePage) &&
        <>
        <div style={{margin: "0", padding: "16px 24px 36px 24px", borderTop: "1px solid #d9d9d9"}}>
          <input onClick={event => setIsChecked(event.target.checked)} type="checkbox" />
          <small className="ml-2" style={{fontSize: "12px"}}>I, <strong className="uppercase">{user?.firstName} {user?.lastName}</strong>, acknowledge the request to change the mode of transportation for the above stated materials.</small>
        </div>

        <div style={{gap: "12px", paddingBottom: "24px", margin: "0 24px"}} className="d-flex-center">
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" className="custom-button red-outline"
                onClick={() => {
                  setResponse("Rejected");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>thumb_down</span>
                  Reject</button>
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" 
                className="custom-button blue-outline"
                onClick={() => {
                  setResponse("Review");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>feedback</span>
                  Review</button>
              <button 
                disabled={!isChecked} 
                style={{width: "100%", justifyContent: "center"}} 
                type="submit" 
                className="custom-button orange"
                onClick={() => {
                  setResponse("Approved");
                  setOpenChatHistory(true); 
                  getMotChatHistory(data.id);
                  setChatData({...chatData, modeOfTransportationId: data.id, entityRepresentativeId: data.userId})}}>
                  <span className='material-symbols-rounded'>feedback</span>
                  Approve</button>
        </div>        
        </>
    }  
    <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
        <div className="modal-header">
            <h3>Chats</h3>
            <span className="material-symbols-rounded close"
                onClick={() => {setOpenChatHistory(false); clearChatData()} }>close</span>
        </div>        
        <div className="modal-body" style={{ minHeight: "200px"}}>
            {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

            {!isChatLoading && 
            <div className='chat-container'>
                {chats.map((chat, index) => {
                    return (
                        <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                            <label className='title'>{chat.sender === "Approvers" ? chat?.senderRole : "Entity Representative"}</label>
                            <p>{chat.message}</p>
                            <span className='date'>{formatDateTime(chat.createdDate)}</span>
                        </div>
                    )
                })}
            </div>}

            {isChatLoading && 
            <div className="loader">
                <img src={loading} alt="loading" />
                <p className="d-flex-center">Loading Chats...</p>
            </div>}
        </div>
        <form onSubmit={handleSendChat}>
        <div className="modal-footer">
            <textarea 
                name="comment" 
                placeholder={response === "Rejected" ? "Reason for Rejection..." : "Message for Entity Representative..."} 
                rows={4} 
                maxLength={300}
                onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                value={chatData.comment} 
                required >
            </textarea>
            <button type="submit" 
            disabled={isSubmitting || !chatData.comment}
            className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
        </div>
        <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>    
        </form>
    </Modal>
    <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
        <div className="loader">
            <img src={loading} alt="loading" />
            <p>Loading data...</p>
        </div>
    </Modal> 
    <ToastContainer />
    </div>
  );
};

export default PdfGenerator;
