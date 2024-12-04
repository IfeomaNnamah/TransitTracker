import { Routes, BrowserRouter, Route} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// AUTH PAGES
import Authentication from './pages/authentication/Authenticate';
import ThirdPartyLogin from './pages/authentication/ThirdPartyLogin'
import ResetPassword from './pages/authentication/ResetPassword'
import ChangePassword from './pages/authentication/ChangePassword'
import ValidateRole from './pages/authentication/ValidateRole'
import Unauthorized from './pages/authentication/Unauthorized';
import LogoutUser from './pages/authentication/LogoutUser';

import Dashboard from './pages/Dashboard';
import NotificationsTO from './pages/transitofficer/Notifications';
import NotificationsSupplier from './pages/supplier/Notifications';
import NotificationsFF from './pages/freightforwarder/Notifications';
import NotificationsLCA from './pages/localclearingagent/Notifications';

// FREIGHT FORWARDER
import ProofOfCollection from './pages/freightforwarder/ProofOfCollection/ProofOfCollection';
import CreateProofOfCollection from './pages/freightforwarder/ProofOfCollection/CreateProofOfCollection';
import ProofOfCollectionDetail from './pages/freightforwarder/ProofOfCollection/ProofofCollectionDetail';
import MaterialReadinessDocumentFF from './pages/freightforwarder/MaterialReadinessDocument/MaterialReadinessDocument';
import MaterialReadinessDocumentDetailFF from './pages/freightforwarder/MaterialReadinessDocument/MaterialReadinessDocumentDetail/MaterialReadinessDocumentDetail';
import ShippingDocuments from './pages/freightforwarder/ShippingDocuments/ShippingDocuments';
import ShippingDocumentsDetail from './pages/freightforwarder/ShippingDocuments/ShippingDocumentsDetail';
import ConsolidatedDocuments from 'pages/freightforwarder/ConsolidatedDocuments/ConsolidatedDocuments';
import CreateConsolidatedDocument from 'pages/freightforwarder/ConsolidatedDocuments/CreateConsolidatedDocument';
import ConsolidatedDocumentDetail from 'pages/freightforwarder/ConsolidatedDocuments/ConsolidatedDocumentDetail';

// SUPPLIER
import PurchaseOrder from './pages/supplier/PurchaseOrder';
import ViewMaterialReadinessDocument from './pages/supplier/MaterialReadinessDocument1/MaterialReadinessDocumentDetail/MaterialReadinessDocumentDetail';
import ProofOfCollectionSupplier from './pages/supplier/ProofOfCollection/ProofOfCollection';
import ProofOfCollectionSupplierDetail from './pages/supplier/ProofOfCollection/ProofofCollectionDetail';
import MaterialReadinessDocumentSupplier from './pages/supplier/MaterialReadinessDocument1/MaterialReadinessDocument';
import CreateMaterialReadinessDocument2 from './pages/supplier/MaterialReadinessDocument1/create2/CreateMaterialReadinessDocument';
import UpdateMaterialReadinessDocument from './pages/supplier/MaterialReadinessDocument1/update/UpdateMaterialReadinessDocument';

// C AND P
import PurchaseOrderCP from './pages/candp/PurchaseOrder';
import MaterialReadinessDocumentCP from './pages/candp/MaterialReadinessDocument/MaterialReadinessDocument';
import MaterialReadinessDocumentDetailCP from './pages/candp/MaterialReadinessDocument/MaterialReadinessDocumentDetail/MaterialReadinessDocumentDetail';
import UserManagementCAndP from './pages/candp/UserManagement';
import UserPermissionsManagementCAndP from './pages/candp/UserPermissionsManagement';
import ProofOfCollectionCAndP from './pages/candp/ProofOfCollection/ProofOfCollection';
import ProofOfCollectionDetailCAndP from './pages/candp/ProofOfCollection/ProofofCollectionDetail';

// TRANSIT OFFICER
import PurchaseOrderTO from './pages/transitofficer/PurchaseOrder';
import UserManagement from './pages/transitofficer/UserManagement';
import UserPermissionsManagement from './pages/transitofficer/UserPermissionsManagement';
import ReassignMaterialReadinessDocuments from './pages/transitofficer/MaterialReadinessDocument/ReassignMaterialReadinessDocuments';
import ModeOfTransportationTO from './pages/transitofficer/ModeOfTransportation/ModeOfTransportation';
import ModeOfTransportationDetailTO from './pages/transitofficer/ModeOfTransportation/ModeOfTransportationDetail';
import MaterialReadinessDocumentDetailTT from './pages/transitofficer/MaterialReadinessDocument/MaterialReadinessDocumentDetail/MaterialReadinessDocumentDetail';
import FreightForwarder from './pages/transitofficer/FreightForwarder';
import BatchAssignMaterialReadinessDocuments from './pages/transitofficer/BatchAssignMaterialReadinessDocuments';
import FreightForwarderAssignedMaterialReadinessDocuments from './pages/transitofficer/FreightForwarderAssignedMaterialReadinessDocuments';
import MaterialReadinessDocumentTT from './pages/transitofficer/MaterialReadinessDocument/MaterialReadinessDocument';
import ProofOfCollectionTO from 'pages/transitofficer/ProofOfCollection/ProofOfCollection';
import ProofOfCollectionDetailTO from 'pages/transitofficer/ProofOfCollection/ProofofCollectionDetail';
import ShippingDocumentsTO from './pages/transitofficer/ShippingDocuments/ShippingDocuments';
import ShippingDocumentsDetailTO from './pages/transitofficer/ShippingDocuments/ShippingDocumentsDetail';
import LocalClearingAgent from 'pages/transitofficer/LocalClearingAgent/LocalClearingAgent';
import BatchAssignShippingDocuments from 'pages/transitofficer/LocalClearingAgent/BatchAssignShippingDocuments';
import AssignedShippingDocuments from 'pages/transitofficer/LocalClearingAgent/AssignedShippingDocuments';
import PurchaseOrderAssignmentToFreightForwarder from 'pages/transitofficer/PurchaseOrderAssigmentToFreightForwarder';
import PurchaseOrderReassignmentToFreightForwarder from 'pages/transitofficer/FreightForwarderReassignment';

// ENTITY REPRESENTATIVE
import ModeOfTransportationER from './pages/entityrepresentative/ModeOfTransportation/ModeOfTransportation';
import ChangeModeOfTransportationER from './pages/entityrepresentative/ModeOfTransportation/ChangeModeOfTransportation copy';
import ModeOfTransportationDetailER from './pages/entityrepresentative/ModeOfTransportation/ModeOfTransportationDetail';
import ReviewPurchaseOrderItems from './pages/entityrepresentative/ReviewPurchaseOrderItems';
import PurchaseOrdersER from './pages/entityrepresentative/PurchaseOrder';

// ENTITY MANAGER
import PurchaseOrdersTrackingEntityManager from './pages/entitymanager/PurchaseOrder';
import ModeOfTransportationEM from './pages/entitymanager/ModeOfTransportation/ModeOfTransportation';
import ModeOfTransportationDetailEM from './pages/entitymanager/ModeOfTransportation/ModeOfTransportationDetail';

// ENTITY GENERAL MANAGER
import PurchaseOrdersTrackingEntityGeneralManager from './pages/entitygeneralmanager/PurchaseOrder';
import ModeOfTransportationEGM from './pages/entitygeneralmanager/ModeOfTransportation/ModeOfTransportation';
import ModeOfTransportationDetailEGM from './pages/entitygeneralmanager/ModeOfTransportation/ModeOfTransportationDetail';

// TRANSIT MANAGER
import PurchaseOrdersTrackingTransitManager from './pages/transitmanager/PurchaseOrder';
import ModeOfTransportationTM from './pages/transitmanager/ModeOfTransportation/ModeOfTransportation';
import MaterialReadinessDocumentTransitManager from './pages/transitmanager/MaterialReadinessDocument/MaterialReadinessDocument';
import MaterialReadinessDocumentDetailTransitManager from './pages/transitmanager/MaterialReadinessDocument/MaterialReadinessDocumentDetail/MaterialReadinessDocumentDetail';
import ModeOfTransportationDetailTM from './pages/transitmanager/ModeOfTransportation/ModeOfTransportationDetail';

// DGM TLOGISTICS
import PurchaseOrdersTrackingDGMTLog from './pages/dgmtlogistics/PurchaseOrder';
import ModeOfTransportationDGMTLog from './pages/dgmtlogistics/ModeOfTransportation/ModeOfTransportation';
import ModeOfTransportationDetailDGMTLog from './pages/dgmtlogistics/ModeOfTransportation/ModeOfTransportationDetail';

// GM TECHLOG
import PurchaseOrdersTrackingGMTechLog from './pages/gmtechlog/PurchaseOrder';
import ModeOfTransportationGMTechLog from './pages/gmtechlog/ModeOfTransportation/ModeOfTransportation';
import ModeOfTransportationDetailGMTechLog from './pages/gmtechlog/ModeOfTransportation/ModeOfTransportationDetail';

// ED TECHNICAL DIRECTORATE
import PurchaseOrdersTrackingEDTechDirectorate from './pages/edtechnicaldirectorate/PurchaseOrder';
import ModeOfTransportationEDTechDirectorate from './pages/edtechnicaldirectorate/ModeOfTransportation/ModeOfTransportation';
import ModeOfTransportationDetailEDTechDirectorate from './pages/edtechnicaldirectorate/ModeOfTransportation/ModeOfTransportationDetail';

// LOCAL CLEARING AGENT
import ShippingDocumentsLCA from "./pages/localclearingagent/ShippingDocuments/ShippingDocuments";
import ShippingDocumentsDetailLCA from "./pages/localclearingagent/ShippingDocuments/ShippingDocumentsDetail";

// PORT OFFICER
import ShippingDocumentsPortOfficer from "./pages/portofficer/ShippingDocuments/ShippingDocuments";
import ShippingDocumentsDetailPortOfficer from "./pages/portofficer/ShippingDocuments/ShippingDocumentsDetail";
import HandoffDocumentDetailPortOfficer from "./pages/portofficer/ShippingDocuments/HandoffDocumentDetail";

function App() {
  return (
    <Provider store={store}>     
      <div className="App">
        <BrowserRouter>
          <Routes>
{/* PUBLIC ROUTES */}
            <Route path="/" element={<Authentication />}/>
            <Route path="/login" element={<ThirdPartyLogin />}/>
            <Route path="/logout" element={<LogoutUser />}/>
            <Route path="/resetpassword" element={<ResetPassword />}/>
            <Route path="/changepassword" element={<ChangePassword />}/>
            <Route path="/validaterole" element={<ValidateRole />}/>
            <Route path="/unauthorized" element={<Unauthorized />}/>

{/* SUPPLIER */}
            <Route path="supplier/dashboard" element={<Dashboard />}/>
            <Route path="supplier/purchaseorders" element={<PurchaseOrder />}/>
            <Route path="supplier/purchaseorders/:id" element={<PurchaseOrder />}/>
            <Route path="supplier/materialreadinessdocuments" element={<MaterialReadinessDocumentSupplier />}/>
            <Route path="supplier/create/materialreadinessdocument" element={<CreateMaterialReadinessDocument2 />}/>
            <Route path="supplier/notifications" element={<NotificationsSupplier />}/>
            <Route path="supplier/update/materialreadinessdocument/:id" element={<UpdateMaterialReadinessDocument />}/>
            <Route path="supplier/view/materialreadinessdocument/:id" element={<ViewMaterialReadinessDocument />}/>
            <Route path="supplier/proofofcollection" element={<ProofOfCollectionSupplier />}/>
            <Route path="supplier/proofofcollection/:id" element={<ProofOfCollectionSupplierDetail />}/>

{/* CANDP */}
            <Route path="candp/dashboard" element={<Dashboard />}/>
            <Route path="candp/purchaseorders" element={<PurchaseOrderCP />}/>
            <Route path="candp/purchaseorders/:id" element={<PurchaseOrderCP />}/>
            <Route path="candp/materialreadinessdocument" element={<MaterialReadinessDocumentCP />}/>
            <Route path="candp/materialreadinessdocument/:id" element={<MaterialReadinessDocumentDetailCP />}/>
            <Route path="candp/usermanagement" element={<UserManagementCAndP />}/>
            <Route path="candp/candppermissions" element={<UserPermissionsManagementCAndP />}/>
            <Route path="candp/proofofcollection" element={<ProofOfCollectionCAndP />}/>
            <Route path="candp/proofofcollection/:id" element={<ProofOfCollectionDetailCAndP />}/>


{/* FREIGHT FORWARDER */}
            <Route path="freightforwarder/dashboard" element={<Dashboard />}/>
            <Route path="freightforwarder/materialreadinessdocument" element={<MaterialReadinessDocumentFF />}/>
            <Route path="freightforwarder/materialreadinessdocument/:id" element={<MaterialReadinessDocumentDetailFF />}/>
            <Route path="freightforwarder/proofofcollection" element={<ProofOfCollection />}/>
            <Route path="freightforwarder/create/proofofcollection" element={<CreateProofOfCollection />}/>
            <Route path="freightforwarder/proofofcollection/:id" element={<ProofOfCollectionDetail />}/>
            <Route path="freightforwarder/consolidateddocuments" element={<ConsolidatedDocuments />}/>
            <Route path="freightforwarder/create/consolidateddocument" element={<CreateConsolidatedDocument />}/>
            <Route path="freightforwarder/consolidateddocument/:id" element={<ConsolidatedDocumentDetail />}/>            
            <Route path="freightforwarder/shippingdocuments" element={<ShippingDocuments />}/>
            <Route path="freightforwarder/shippingdocuments/:id" element={<ShippingDocumentsDetail />}/>
            <Route path="freightforwarder/notifications" element={<NotificationsFF />}/>

{/* TRANSIT OFFICER */}
            <Route path="transitofficer/dashboard" element={<Dashboard />}/>
            <Route path="transitofficer/notifications" element={<NotificationsTO />}/>
            <Route path="transitofficer/purchaseorders" element={<PurchaseOrderTO />}/>
            <Route path="transitofficer/purchaseorders/:id" element={<PurchaseOrderTO />}/>
            <Route path="transitofficer/usermanagement" element={<UserManagement />}/>
            <Route path="transitofficer/transitteampermissions" element={<UserPermissionsManagement />}/>
            <Route path="transitofficer/freightforwarders" element={<FreightForwarder />}/>
            <Route path="transitofficer/batch-assign-material-readiness-documents/:email" element={<BatchAssignMaterialReadinessDocuments />}/>
            <Route path="transitofficer/freightforwarder-assigned-material-readiness-documents/:email" element={<FreightForwarderAssignedMaterialReadinessDocuments />}/>
            <Route path="transitofficer/materialreadinessdocument" element={<MaterialReadinessDocumentTT />}/>
            <Route path="transitofficer/materialreadinessdocument/:id" element={<MaterialReadinessDocumentDetailTT />}/>
            <Route path="transitofficer/reassignmaterialreadinessdocument/:id" element={<ReassignMaterialReadinessDocuments />}/>
            <Route path="transitofficer/modeoftransportationchange" element={<ModeOfTransportationTO />}/>
            <Route path="transitofficer/modeoftransportationchange/:id" element={<ModeOfTransportationDetailTO />}/>
            <Route path="transitofficer/proofofcollection" element={<ProofOfCollectionTO />}/>
            <Route path="transitofficer/proofofcollection/:id" element={<ProofOfCollectionDetailTO />}/>
            <Route path="transitofficer/shippingdocuments" element={<ShippingDocumentsTO />}/>
            <Route path="transitofficer/shippingdocuments/:id" element={<ShippingDocumentsDetailTO />}/>
            <Route path="transitofficer/batch-assign-shipping-documents/:email" element={<BatchAssignShippingDocuments />}/>
            <Route path="transitofficer/assigned-shipping-documents/:email" element={<AssignedShippingDocuments />}/>
            <Route path="transitofficer/localclearingagents" element={<LocalClearingAgent />}/>            
            <Route path="transitofficer/purchaseorderassignmenttofreightforwader" element={<PurchaseOrderAssignmentToFreightForwarder />}/>
            <Route path="transitofficer/freightforwarderreassignment" element={<PurchaseOrderReassignmentToFreightForwarder />}/>
            
            
{/* ENTITY REPRESENTATIVE */}
            <Route path="entityrepresentative/dashboard" element={<Dashboard />}/>
            <Route path="entityrepresentative/modeoftransportationchange" element={<ModeOfTransportationER />}/>
            <Route path="entityrepresentative/create/modeoftransportationchange" element={<ChangeModeOfTransportationER />}/>
            <Route path="entityrepresentative/modeoftransportationchange/:id" element={<ModeOfTransportationDetailER />}/>
            <Route path="entityrepresentative/reviewmaterialattachments" element={<ReviewPurchaseOrderItems />}/>
            <Route path="entityrepresentative/purchaseorders" element={<PurchaseOrdersER />}/>
            <Route path="entityrepresentative/purchaseorders/:id" element={<PurchaseOrdersER />}/>

{/* ENTITY MANAGER */}
            <Route path="entitymanager/dashboard" element={<Dashboard />}/>
            <Route path="entitymanager/purchaseorders" element={<PurchaseOrdersTrackingEntityManager />}/>
            <Route path="entitymanager/purchaseorders/:id" element={<PurchaseOrdersTrackingEntityManager />}/>
            <Route path="entitymanager/modeoftransportationchange" element={<ModeOfTransportationEM />}/>
            <Route path="entitymanager/modeoftransportationchange/:id" element={<ModeOfTransportationDetailEM />}/>

{/* ENTITY GENERAL MANAGER */}
            <Route path="entitygeneralmanager/dashboard" element={<Dashboard />}/>
            <Route path="entitygeneralmanager/purchaseorders" element={<PurchaseOrdersTrackingEntityGeneralManager />}/>
            <Route path="entitygeneralmanager/purchaseorders/:id" element={<PurchaseOrdersTrackingEntityGeneralManager />}/>
            <Route path="entitygeneralmanager/modeoftransportationchange" element={<ModeOfTransportationEGM />}/>
            <Route path="entitygeneralmanager/modeoftransportationchange/:id" element={<ModeOfTransportationDetailEGM />}/>

{/* TRANSIT MANAGER */}
            <Route path="transitmanager/dashboard" element={<Dashboard />}/>
            <Route path="transitmanager/purchaseorders" element={<PurchaseOrdersTrackingTransitManager />}/>
            <Route path="transitmanager/purchaseorders/:id" element={<PurchaseOrdersTrackingTransitManager />}/>
            <Route path="transitmanager/materialreadinessdocument" element={<MaterialReadinessDocumentTransitManager />}/>
            <Route path="transitmanager/materialreadinessdocument/:id" element={<MaterialReadinessDocumentDetailTransitManager />}/>            
            <Route path="transitmanager/modeoftransportationchange" element={<ModeOfTransportationTM />}/>
            <Route path="transitmanager/modeoftransportationchange/:id" element={<ModeOfTransportationDetailTM />}/>

{/* DEPUTY GENERAL MANAGER TECHNICAL LOGISTICS */}
            <Route path="deputygeneralmanagertechnicallogistics/dashboard" element={<Dashboard />}/>
            <Route path="deputygeneralmanagertechnicallogistics/purchaseorders" element={<PurchaseOrdersTrackingDGMTLog />}/>
            <Route path="deputygeneralmanagertechnicallogistics/purchaseorders/:id" element={<PurchaseOrdersTrackingDGMTLog />}/>
            <Route path="deputygeneralmanagertechnicallogistics/modeoftransportationchange" element={<ModeOfTransportationDGMTLog />}/>
            <Route path="deputygeneralmanagertechnicallogistics/modeoftransportationchange/:id" element={<ModeOfTransportationDetailDGMTLog />}/>

{/* GENERAL MANAGER TECHNICAL LOGISTICS */}
            <Route path="generalmanagertechnicallogistics/dashboard" element={<Dashboard />}/>
            <Route path="generalmanagertechnicallogistics/purchaseorders" element={<PurchaseOrdersTrackingGMTechLog />}/>
            <Route path="generalmanagertechnicallogistics/purchaseorders/:id" element={<PurchaseOrdersTrackingGMTechLog />}/>
            <Route path="generalmanagertechnicallogistics/modeoftransportationchange" element={<ModeOfTransportationGMTechLog />}/>
            <Route path="generalmanagertechnicallogistics/modeoftransportationchange/:id" element={<ModeOfTransportationDetailGMTechLog />}/>

{/* EXECUTIVE DIRECTOR TECHNICAL DIRECTORATE */}
            <Route path="executivedirectortechnicaldirectorate/dashboard" element={<Dashboard />}/>
            <Route path="executivedirectortechnicaldirectorate/purchaseorders" element={<PurchaseOrdersTrackingEDTechDirectorate />}/>
            <Route path="executivedirectortechnicaldirectorate/purchaseorders/:id" element={<PurchaseOrdersTrackingEDTechDirectorate />}/>
            <Route path="executivedirectortechnicaldirectorate/modeoftransportationchange" element={<ModeOfTransportationEDTechDirectorate />}/>
            <Route path="executivedirectortechnicaldirectorate/modeoftransportationchange/:id" element={<ModeOfTransportationDetailEDTechDirectorate />}/>

{/* LOCAL CLEARING AGENT */}
            <Route path="localclearingagent/dashboard" element={<Dashboard />}/>
            <Route path="localclearingagent/shippingdocuments" element={<ShippingDocumentsLCA />}/>
            <Route path="localclearingagent/shippingdocuments/:id" element={<ShippingDocumentsDetailLCA />}/>
            <Route path="localclearingagent/notifications" element={<NotificationsLCA />}/>

{/* PORT OFFICER */}
            <Route path="portofficer/dashboard" element={<Dashboard />}/>
            <Route path="portofficer/shippingdocuments" element={<ShippingDocumentsPortOfficer />}/>
            <Route path="portofficer/shippingdocuments/:id" element={<ShippingDocumentsDetailPortOfficer />}/>
            <Route path="portofficer/handoffdocument/:id" element={<HandoffDocumentDetailPortOfficer />}/>
           
          </Routes>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
