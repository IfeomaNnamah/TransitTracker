import axios from 'axios';
import { Config, ObjectType } from './interfaces/index.interface';
import configureStore from './store';
import { setTepngUser } from 'store/tepngUser';
import { setAccessToken } from 'store/accessToken';
import { setRoles } from 'store/roles';
import { setPermissions } from 'store/permissions';
import { useDispatch } from 'react-redux';

const baseUrl = process.env.REACT_APP_SERVER_URL
const redirectURI:string = process.env.REACT_APP_FRONTEND_URL!

// get access token from store 
export function getAccessToken() {
    const state = configureStore.getState();
    if(state.accessToken.value != null){
        const token:any = state.accessToken.value
        return token.token;
    }
    else return null;
}

const loginTepngUser = () => {
    return new Promise((resolve, reject) =>  { 
        axios({      
                method: 'POST',            
                url: process.env.REACT_APP_SERVER_URL + 'Authentication/Login',            
                data: {},            
                withCredentials: true,            
                headers: { 
                    "Content-Type": "application/json",
                },            
                responseType: 'json'
            
            }).then(res => {                  
                resolve({
                    msg: "Login Successful",
                    roles: res.data.data.roles,
                    accessToken: res.data.data.accessToken,
                    userDetails: res.data.data.user,
                    permissions: res.data.data.permissions,
                    status: true
                })            
            
            }).catch(error => {
                
                let queryParams = new URLSearchParams(window.location.search);

                if (queryParams.get("azureauthredirect") !== '1' && error.response.status === 401) {
                    let url = new URL(process.env.REACT_APP_FRONTEND_URL!)// return to login page
                    url.searchParams.append('azureauthredirect', '1')
                    window.location.replace(process.env.REACT_APP_AUTH_URL + window.encodeURIComponent(url.href));                    
                }else {                   
                    window.location.replace(process.env.REACT_APP_FRONTEND_URL+"/unauthorized")
                };
        })
    })
}

const authenticateLocally = () => {

    var request = {
        params: { email: 'joseph.olabode@external.totalenergies.com' }
        // params: { email: 'ifeoma.nnamah@external.totalenergies.com' }
    };
    return new Promise((resolve, reject) => {
        axios({      
            method: 'POST',            
            url: process.env.REACT_APP_SERVER_URL + 'Authentication/TestLogin?email='+request.params.email,            
            data: {},            
            withCredentials: true        
        }).then((res) => {      
            resolve({
                msg: "Login Successful",
                roles: res.data.data.roles,
                accessToken: res.data.data.accessToken,
                userDetails: res.data.data.user,
                status: true,
            });

          }).catch((error) => {
            if(error.response.status === 401) {
                const currentUrl = window.location.origin                
                window.location.replace(currentUrl+"/unauthorized")
            }            
          })
      });
      
}

const logoutTepngUser = () => {
    var token: string | null;
    if(sessionStorage.getItem("token")) token = sessionStorage.getItem("token")
    else token = getAccessToken()
    return new Promise((resolve, reject) =>  { 
        axios({      
                method: 'POST',            
                url: process.env.REACT_APP_SERVER_URL + 'Authentication/Logout',            
                data: {},            
                withCredentials: true,            
                headers: { 
                    'Authorization':'Bearer ' + token,
                    "Content-Type": "application/json",
                },            
                responseType: 'json'
            
            }).then(res => {  
                sessionStorage.removeItem("token")
                resolve({
                    msg: "Logout Successful",
                    status: true
                })          
            
            }).catch(error => {
                if(error.response.status === 401) {
                    const currentUrl = window.location.origin                
                    window.location.replace(currentUrl)
                } 
            })
    })
}
export const RefreshToken = (dispatch?:any) => {

    return new Promise((resolve, reject) =>  { 
        axios({      
            method: 'GET',            
            url: process.env.REACT_APP_SERVER_URL + 'Authentication/RefreshToken',            
            data: {},            
            withCredentials: true,            
            headers: { 
                "Content-Type": "application/json", 
            },            
            responseType: 'json'
        
        }).then(res => {  
            const response = res.data.data
            dispatch(setTepngUser(response.user))
            dispatch(setAccessToken(response.accessToken))
            dispatch(setRoles(response.roles))
            dispatch(setPermissions(response.permissions))
            resolve({
                roles: res.data.data.roles,
                status: true
            })  
        }).catch((error) => {
            if(error.message !== "Network Error") {
                if(error.response.status === 401){
                    //get url before redirect if coming from a link
                    
                    if(!(window.location.pathname === "/" || window.location.pathname === "/login")) {
                        sessionStorage.setItem("redirectURL", window.location.href)
                        window.location.replace(window.location.origin)
                    }
                }
            }else alert("Internet Disconnected! Check your Network.")
        });
    })
}

const GetDispatch = () => {
    const dispatch = useDispatch()

    return dispatch
};

const makeGetRequest = (request: Record<string, any>) =>  {
    const request_urls: Record<string, string> =  {
        'getAllUsers': "User", 
        'getAllPermissions': "Permission", 
        'getUserByEmail': "User/GetUserByEmail", 
        'getAllRoles': "Roles", 
        "getAllCountries": "Country",
        "getPurchaseOrders": "PurchaseOrder",
        "getConsolidatedCommercialInvoices": "ConsolidatedCommercialInvoice",
        "getConsolidatedCommercialInvoice": "ConsolidatedCommercialInvoice/" + request.id,
        "getConsolidatedCommercialInvoiceByNumber": "ConsolidatedCommercialInvoice/GetByCommercialInvoiceNumber/" + request.id,
        "getConsolidatedPackingLists": "ConsolidatedPackingList",
        "getConsolidatedPackingList": "ConsolidatedPackingList/" + request.id,
        "getConsolidatedPackingListByNumber": "ConsolidatedPackingList/GetByPackingListNumber/" + request.id,
        "getShippingDocuments": "ShippingDocument",
        "getShippingDocumentById": "ShippingDocument/"+request.id,
        "downloadShippingDocumentById": `ShippingDocument/DownloadShippingDocument/${request.id}/${request.name}`,
        "getPurchaseOrder": "PurchaseOrder/GetByPurchaseOrderNumber/"+request.id,
        "getPurchaseOrderItemsFromPackages": "MaterialReadinessDocument/MaterialReadinessDocumentPackages",
        "getPurchaseOrderItems": "PurchaseOrderItem",
        "getPurchaseOrderById": "PurchaseOrder/"+request.id,
        "getAllUsersForARole": "Roles/GetAllUsersForARole",
        "getPackages": "Package",
        "getPackage": "Package/" + request.id,
        "getPackageForFreightForwader": "Package/GetPackagesForAirConsolidation/"+request.id,
        "getMRDs": "MaterialReadinessDocument",
        "getMRDForFreightForwarder": "MaterialReadinessDocument/ForFreightForwarder",
        "getFreightForwarderAssignedMRDs": "MaterialReadinessDocument/ForTransitToGetFreightForwarderMRD",
        "getMRDForSupplier": "MaterialReadinessDocument/ForSupplier",
        "getMRDForCAndP": "MaterialReadinessDocument/ForCAndP",
        "getMaterialReadinessDocumentById": "MaterialReadinessDocument/" + request.id,
        "getProofOfCollection": "ProofOfCollection",
        "getProofOfCollectionForTransitOfficer": "ProofOfCollection/ForTransitOfficer",
        "getProofOfCollectionForCAndP": "ProofOfCollection/ForC&P",
        "getProofOfCollectionById": "ProofOfCollection/"+request.id,
        "getAllModeOfTransportation": "ModeOfTransportation",
        "getModeOfTransportationById": "ModeOfTransportation/"+request.id,
        "getAllModeOfTransportationForApprover": "ModeOfTransportation/GetModeOfTransportationForApprovalLevel",
        "getAllModeOfTransportationForEntityRepManagers": "ModeOfTransportation/GetModeOfTransportationForEntityRepManagers",
        "getAllTotalEnergiesUsers": "User/GetTotalEnergyUsers",
        "getAllModeOfTransportationForTransitOfficer": "ModeOfTransportation/GetModeOfTransportationForTransitOfficer",
        "getShippingDocumentsForLocalClearingAgent": "ShippingDocument/LocalClearingAgent",
        "getShippingDocumentsForPortOfficer": "ShippingDocument/PortOfficer",
        "getShippingDocumentsForBatching": "ShippingDocument/TransitOfficer",
        "getShippingDocumentChatHistory": "ShippingDocument/ChatHistory",
        "getMaterialReadinessDocumentChatHistory": "MaterialReadinessDocument/MaterialReadinessDocumentChatHistory/" + request.id,
        "getAllShippingDocumentNotifications": "ShippingDocument/BothReadAndUnreadChat",
        "getMaterialReadinessDocumentNotifications": "MaterialReadinessDocument/BothReadAndUnreadChat",
        "getUnreadShippingDocumentNotifications": "ShippingDocument/UnreadChat",
        "getUnreadMaterialReadinessDocumentNotifications": "MaterialReadinessDocument/UnreadChat",
        "getMaterialReadinessDocumentBasicInfoBySupplier": "MaterialReadinessDocument/MaterialReadinessDocumentBasicInfoBySupplier/" + request.id,
        "getPurchaseOrderItemSupply": "PurchaseOrderItem/PurchaseOrderItemSupplyForEntityRep",
        'FinalUpdateMaterialReadinessDocument': "MaterialReadinessDocument/FinalUpdateMaterialReadinessDocument",
        "ModeOfTransportationChatHistory": "/ModeOfTransportation/ChatHistory",
    }

    if (request.params !== undefined) {
        var obj: ObjectType = request.params
        var params = Object.keys(obj).map((key) =>  {return key + '=' + obj[key] }).join('&')
        var request_url = baseUrl + request_urls[request.what] + "?" + params
    }else {
        request_url = baseUrl + request_urls[request.what]
    }

    const config = {
        headers: {
            'Authorization':'Bearer ' + getAccessToken(), 
            'Content-Type':'application/json',
            'Accept': 'application/json'        // Ensures the response is JSON
        },
        params: {},
    }
    config.params = (request.data !== undefined) ? request.data : {}
    
    return new Promise((resolve, reject) =>  {
        
        axios.get(request_url, config)
        .then((response) =>  {
            var res =  {
                msg:"Action Successful", 
                type:request.what, 
                status:true, 
                data:response.data
            }
            resolve(res)            
        })
        .catch((err:any) =>  {
            if (err.request?.status === 401) {
                try{
                    const dispatch = GetDispatch(); //ignore error

                    // Call refreshToken and re-run the request on success
                    RefreshToken(dispatch).then((res: any) => {
                        // Retry makeGetRequest after token is refreshed
                        makeGetRequest(request)
                            .then(resolve)
                            .catch(reject);
                    }).catch(reject); // If refreshToken fails, reject with error
                }catch {
                    return null
                }
            } else {
                if (err.response) {
                    reject({
                        msg: err.response.data?.Message || err.message
                    });
                } else {
                    reject({ msg: err.message });
                }
            }
        })
    })
}

const makePostRequest = (request: Record<string, any>) =>  {

    const request_urls: Record<string, string> =  {
        'OnboardUser': "Authentication/UserRegistration", 
        'LoginThirdPartyUser': "Authentication/ThirdPartyUserLogin", 
        'ThirdPartyUserLogin2FA': "Authentication/ThirdPartyUserLogin2FA",
        'ThirdPartyChangeUserCreds': "Authentication/ThirdPartyChangeUserPassword",
        'SendResetToken': "Authentication/ThirdPartyForgotPassword",
        'ThirdPartyResetCreds': "Authentication/ThirdPartyResetPassword",
        'CreateConsolidatedCommercialInvoice': "ConsolidatedCommercialInvoice/CreateConsolidatedCommercialInvoice",
        'CreateConsolidatedConsolidatedPackingList': "ConsolidatedPackingList/CreateConsolidatedPackingList",
        'CreateShippingDocuments': "ShippingDocument/CreateShippingDocument",
        'CreateMaterialReadinessDocument': "MaterialReadinessDocument/CreateMaterialReadinessDocumentContent",
        'CreatePackage': "Package/CreatePackage",   
        'CreateMultiplePackages': "Package/CreateMultiplePackage",        
        'CreatePackageForAirConsolidation': "Package/CreatePackageForAirConsolidation",   
        'CreateProofOfCollection': "/ProofOfCollection/CreateProofOfCollection",
        'ChangeModeOfTransportation': "/ModeOfTransportation/CreateModificationOfTransportation",
        'SubmitApproval': "Approval/SubmitApproval",
        'UploadShippingDocuments': "ShippingDocument/ReuploadShippingDocument",
        'UploadDraftShippingDocuments': "ShippingDocument/UploadDraftShippingDocument",
        'CreateConsolidatedDocuments': "ShippingDocument/CreateConsolidatedShippingDocument",
        'UploadOtherShippingDocuments': "ShippingDocument/UploadOtherShippingDocument",
        'UploadPreArrivalAssessmentReport': "ShippingDocument/UploadPreArrivalAssessmentReport",
        'UploadMaterialPictures': "PurchaseOrderItem/UploadPurchaseOrderItemSupplyAttachment",
        'UploadPackageAttachments': "Package/UploadPackageAttachment",
        'CreateMaterialReadinessDocumentWithBasicInformation': "MaterialReadinessDocument/CreateMaterialReadinessDocumentBasicInfo",
        'UpdatePackageAttachment': "Package/UpdatePackageAttachment", 
        'UpdateMaterialPictures': "PurchaseOrderItem/UpdatePurchaseOrderItemSupplyAttachment",
        'RequestItemReviewByEntityRepresentative': "PurchaseOrderItem/AssignPurchaseOrderItemSupplyToEntityRep",
    }

    if (request.params !== undefined) {
        const obj: ObjectType = request.params
        var params = Object.keys(obj).map((key) =>  {return key + '=' + obj[key] }).join('&')
        var request_url = baseUrl + request_urls[request.what] + "?" + params
    }else {
        request_url = baseUrl + request_urls[request.what]
    }

    var data = (request.data !== undefined)?request.data: {}
   
    var config: Config = {
        headers: {},
        withCredentials: true
    }; 

    if ( // do not set if it is pointing to 'authentication'
        // (request_url !== baseUrl + 'Authentication/ThirdPartyUserLogin')
        (request_url !== baseUrl + 'Authentication/ThirdPartyUserLogin2FA')) 
    {        
        config.headers = {
            'Authorization':'Bearer ' + getAccessToken(),
        }
    }
    
    return new Promise((resolve, reject) =>  {
        axios.post(request_url, data, config)
            .then((response) =>  {
                var res; 
                res =  {
                    msg: response.data.message, 
                    type:request.what, 
                    status:true, 
                    data:response.data
                }
                resolve(res)
            })
            .catch((err) =>  {
                //cannot run refresh till refreshtoken double call is fixed
                // if(getAccessToken() && err.request?.status === 401)
                if (err.response) {
                    if(err.response.data) {
                        reject({
                            msg: err.response.data.Message,
                            statuscode: err.response.status,
                        })
                    }
                }else reject({msg: err.message})
            })
    })
}

const makePatchRequest = (request: Record<string, any>) =>  {

    const request_urls: Record<string, string> =  {
        "ActivateUser": "User/Enable",
        "DeactivateUser": "User/Disable",
        "UpdateUser": "User/Update",
        "AssignUserToPermissions": "Permission/AssignUserToPermissions",
        "RemoveUserFromPermissions": "Permission/RemoveUserFromPermissions",
        'BatchPurchaseOrderItems': 'CommercialInvoice/AssignBatchPOItemstoCommercialInvoice',
        'BatchAssignMaterialReadinessDocuments': "MaterialReadinessDocument/AssignBatchMaterialReadinessDocumentToUser",
        'ReassignMaterialReadinessDocumentToFreightForwarder': "MaterialReadinessDocument/ReassignMaterialReadinessDocumentToUser",
        'SendFeedback': "MaterialReadinessDocument/AddComment",
        'RaiseClaim': "MaterialReadinessDocument/AddClaim",
        'RemovePOItemFromPackage': "Package/RemovePOItemFromPackage",
        'UpdatePackage': "Package/UpdatePackage",
        'UpdateMaterialReadinessDocument': "MaterialReadinessDocument/UpdateMaterialReadinessDocument",
        'ReassignMaterialReadinessDocuments': "MaterialReadinessDocument/ReassignMaterialReadinessDocumentToUser",
        'ManageFufillment': "MaterialReadinessDocument/TogglePicked",
        'SubmitRequesterGeneralManagerApproval': "ModeOfTransportation/SubmitRequesterGeneralManagerApproval",
        'SubmitRequesterManagerApproval': "ModeOfTransportation/SubmitRequesterManagerApproval",
        'SubmitSupplierPOCApproval': "ProofOfCollection/AddSupplierResponseToProofOfCollection",
        'SubmitTransitOfficerAcknowledgement': "ProofOfCollection/AddTransitOfficerAcknowledgementToProofOfCollection",
        'CAndPMRDEndorsement': "MaterialReadinessDocument/ValidateMaterialReadinessDocument",
        'AddCommentForShippingDocuments': "ShippingDocument/AddComment",
        'AddValidationForShippingDocuments': "ShippingDocument/AddValidation",    
        'BatchAssignShippingDocumentsToLocalClearingAgent': 'ShippingDocument/AssignBatcShippingDocumentToLocalClearingAgent',
        'UpdateClearingProcessStatus': "ShippingDocument/UpdateClearingProcessStatus",    
        'setEstimatedTimeOfDelivery': "ShippingDocument/SetEstimatedTimeOfDelivery",
        'setActualTimeOfDelivery': "ShippingDocument/SetActualTimeOfDelivery",
        'confirmDeliveryAtDestination': "ShippingDocument/SetPortOfficerAcknowledgement",
        "ChangeShippedItemsStatus": "ShippingDocument/ChangeShippedItemsStatus",
        "markNotificationsAsRead": "ShippingDocument/MarkChatAsRead",
        "markMaterialReadinessDocumentNotificationsAsRead": "MaterialReadinessDocument/MarkChatAsRead",
        'UpdateMaterialReadinessDocumentBasicInformation': "MaterialReadinessDocument/UpdateMaterialReadinessDocument",
        'EntityRepresentativeReviewItemAttachment': "PurchaseOrderItem/AddEntityRepresentativeReview",
        'C&PReviewPackageAttachment': "Package/AddC&PReviewPackageAttachment",
        'AddCommentForMaterialReadinessDocument': "MaterialReadinessDocument/AddComment",
        'AddCandPMaterialItemAttachmentReview': "PurchaseOrderItem/AddC&PReview",
        'FinalUpdateMaterialReadinessDocument': "MaterialReadinessDocument/FinalUpdate/MaterialReadinessDocument",
        'RequestChangePickupAddress':"MaterialReadinessDocument/NotifyOfWrongPickupAddress",
        'SetPortOfficerDates': "ShippingDocument/SetPortOfficerDates",
        'AddCommentForModeOfTransportation': "ModeOfTransportation/AddComment",
        'handleShippingOfficerAcknowledgement': "ModeOfTransportation/AddShippingOfficerCheckInfo",
        'handleShippingManagerApproval': "ModeOfTransportation/AddShippingOfficerManagerCheckInfo",
        "UpdateMOTInformation": "ModeOfTransportation/UpdateModeOfTransportation",
        "UpdateMOTInformationWithMultiplePackages": "ModeOfTransportation/UpdateModeOfTransportationWithMultiplePackages",
        'AssignBatchPurchaseOrderToFreightForwarder': "PurchaseOrder/AssignBatchPurchaseOrderToFreightForwarder",
        'PurchaseOrderReassignmentToFreightForwarder': "PurchaseOrder/ReassignBatchPurchaseOrderToFreightForwarder",
        'AddValidationToFinalDocument': "ShippingDocument/AddValidationToFinalDocument",
        'UpdateMultiplePackages': "Package/UpdateMultiplePackage",
    }

    if (request.params !== undefined) {
        var obj: ObjectType = request.params
        var params = Object.keys(obj).map((key) =>  {return key + '=' + obj[key] }).join('&')
        var request_url = baseUrl + request_urls[request.what] + "?" + params
    }else {
        request_url = baseUrl + request_urls[request.what]
    }

    var data = (request.data !== undefined)?request.data: {}
    var config =  {
        headers: {
            'Authorization':'Bearer ' + getAccessToken()
        },
        withCredentials: true, 
    }

    //console.log('%cSending patch request to: ' + request_url, 'color:#00ff00;font-size:14px;background:#000;')
    return new Promise((resolve, reject) =>  {
        axios.patch(request_url, data, config)
            .then((response) =>  {
                var res; 
                res =  {
                    msg: response.data.message, 
                    type:request.what, 
                    status:true, 
                    data:response.data.data
                }
                resolve(res)
            })
            .catch((err) =>  {
                if (err.response) {
                    if(err.response.data) reject({
                        msg: err.response.data.Message
                    })
                }else reject({msg: err.message})
            })
    })
}

const makePutRequest = (request: Record<string, any>) =>  {

    const request_urls: Record<string, string> =  {
        
    }

    if (request.params !== undefined) {
        var obj: ObjectType = request.params
        var params = Object.keys(obj).map((key) =>  {return key + '=' + obj[key] }).join('&')
        var request_url = baseUrl + request_urls[request.what] + "?" + params
    }else {
        request_url = baseUrl + request_urls[request.what]
    }

    var data = (request.data !== undefined)?request.data: {}
    var config =  {
        headers: {
            'Authorization':'Bearer ' + getAccessToken(),
        },
        withCredentials: true, 
    }

    return new Promise((resolve, reject) =>  {
        axios.put(request_url, data, config)
            .then((response) =>  {
                var res; 
                res =  {
                    msg:"Action Successful", 
                    type:request.what, 
                    status:true, 
                    data:response.data
                }
                resolve(res)
            })
            .catch((err) =>  {
                if (err.response) {
                    if(err.response.data) reject({
                        msg: err.response.data.Message
                    })
                }else reject({msg: err.message})
            })
    })
}

const makeDeleteRequest = (request: Record<string, any>) =>  {

    const request_urls: Record<string, string> =  {
        "DeleteUser": 'User',
        "DeletePackage": 'Package',
        'ClearPurchaseOrderItemSupplyAttachment': "PurchaseOrderItem/ClearAllAttachment/"+request.id,
        'ClearPackageAttachments': "Package/ClearPackageAttachment/"+request.id,
        'ClearMaterialReadinessDocumentBasicInfo': "MaterialReadinessDocument/ClearMaterialReadinessDocumentBasicInfo/"+ request.id
    }

    if (request.params !== undefined) {
        var obj: ObjectType = request.params
        var params = Object.keys(obj).map((key) =>  {return key + '=' + obj[key] }).join('&')
        var request_url = baseUrl + request_urls[request.what] + "?" + params
    }else {
        request_url = baseUrl + request_urls[request.what]
    }

    var data = (request.data !== undefined)?request.data: {}
    var config =  {
        headers: {
            'Authorization':'Bearer ' + getAccessToken()
        },
        withCredentials: true, 
    }

    return new Promise((resolve, reject) =>  {
        axios.delete(request_url, {
            ...config,
            data: data
        }).then((response) =>  {
                var res; 
                res =  {
                    msg: response.data.message, 
                    type:request.what, 
                    status:true, 
                    data:response.data.data
                }
                resolve(res)
            })
            .catch((err: any) =>  {
                if (err.response) {
                    if(err.response.data) reject({
                        msg: err.response.data.Message
                    })
                }else reject({msg: err.message})
            })
    })
}

export { authenticateLocally, baseUrl, loginTepngUser, logoutTepngUser, makeDeleteRequest, makeGetRequest, makePatchRequest, makePostRequest, makePutRequest, redirectURI };
