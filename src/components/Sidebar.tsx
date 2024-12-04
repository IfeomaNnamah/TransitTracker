import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/images/logo-2.png"
import { useDispatch, useSelector } from "react-redux";
import { PageProps } from "../interfaces/index.interface";
import { setPageContext } from "store/pageContext";
import { rolesWithColors } from "helpers";
  
const Sidebar = (props: PageProps) => {
    const { page } = props;
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const roles:any = useSelector((state: any) => state.roles.value)
    const [isActive, setIsActive] = useState(true)
    
    const sidebarItems = [      
        // SUPPLIER  
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Supplier",
            path: "supplier/dashboard"
        },      
        {
            title: "Purchase Orders",
            icon: "list_alt",
            role: "Supplier",
            path: "supplier/purchaseorders"
        }, 
        {
            title: "Material Readiness Documents",
            icon: "note_stack",
            role: "Supplier",
            path: "supplier/materialreadinessdocuments"
        },
        {
            title: "Proof Of Collection",
            icon: "inventory",
            role: "Supplier",
            path: "supplier/proofofcollection"
        },


        // C and P  
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "C and P",
            path: "candp/dashboard"
        },      
        // {
        //     title: "Purchase Orders",
        //     icon: "list_alt",
        //     role: "C and P",
        //     path: "candp/purchaseorders"
        // },  
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "C and P",
            path: "candp/purchaseorders"
        },
        {
            title: "Material Readiness Documents",
            icon: "note_stack",
            role: "C and P",
            path: "candp/materialreadinessdocument"
        },
        {
            title: "Proof Of Collection",
            icon: "inventory",
            role: "C and P",
            path: "candp/proofofcollection"
        }, 
        {
            title: "User Management",
            icon: "group",
            role: "C and P",
            path: "candp/usermanagement"
        },
        {
            title: "C And P Permissions",
            icon: "admin_panel_settings",
            role: "C and P",
            path: "candp/candppermissions"
        },


        // TRANSIT OFFICER
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Transit Officer",
            path: "transitofficer/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Transit Officer",
            path: "transitofficer/purchaseorders"
        },  
        {
            title: "Material Readiness Documents",
            icon: "note_stack",
            role: "Transit Officer",
            path: "transitofficer/materialreadinessdocument"
        },        
        {
            title: "Freight Forwarder Assignment",
            icon: "delivery_truck_speed",
            role: "Transit Officer",
            path: "transitofficer/freightforwarders"
        },        
        {
            title: "Proof Of Collection",
            icon: "inventory",
            role: "Transit Officer",
            path: "transitofficer/proofofcollection"
        },        
        {
            title: "Shipping Documents",
            icon: "home_storage",
            role: "Transit Officer",
            path: "transitofficer/shippingdocuments"
        },
        {
            title: "Local Clearing Agent Assignment",
            icon: "location_home",
            role: "Transit Officer",
            path: "transitofficer/localclearingagents"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Transit Officer",
            path: "transitofficer/modeoftransportationchange"
        },
        {
            title: "User Management",
            icon: "group",
            role: "Transit Officer",
            path: "transitofficer/usermanagement"
        },
        {
            title: "Transit Team Permissions",
            icon: "admin_panel_settings",
            role: "Transit Officer",
            path: "transitofficer/transitteampermissions"
        }, 
        

        // FREIGHT FORWARDER
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Freight Forwarder",
            path: "freightforwarder/dashboard"
        }, 
        {
            title: "Material Readiness Documents",
            icon: "note_stack",
            role: "Freight Forwarder",
            path: "freightforwarder/materialreadinessdocument"
        },
        {
            title: "Proof Of Collection",
            icon: "inventory",
            role: "Freight Forwarder",
            path: "freightforwarder/proofofcollection"
        },
        {
            title: "Consolidated Documents",
            icon: "view_list",
            role: "Freight Forwarder",
            path: "freightforwarder/consolidateddocuments"
        },
        {
            title: "Shipping Documents",
            icon: "home_storage",
            role: "Freight Forwarder",
            path: "freightforwarder/shippingdocuments"
        },

        // ENTITY REPRESENTATIVE
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Entity Representative",
            path: "entityrepresentative/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Entity Representative",
            path: "entityrepresentative/purchaseorders"
        },
        {
            title: "Review Material Attachments",
            icon: "person_check",
            role: "Entity Representative",
            path: "entityrepresentative/reviewmaterialattachments"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Entity Representative",
            path: "entityrepresentative/modeoftransportationchange"
        },

        // ENTITY MANAGER
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Entity Manager",
            path: "entitymanager/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Entity Manager",
            path: "entitymanager/purchaseorders"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Entity Manager",
            path: "entitymanager/modeoftransportationchange"
        },

        // ENTITY GENERAL MANAGER
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Entity General Manager",
            path: "entitygeneralmanager/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Entity General Manager",
            path: "entitygeneralmanager/purchaseorders"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Entity General Manager",
            path: "entitygeneralmanager/modeoftransportationchange"
        },

        // TRANSIT MANAGER
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Transit Manager",
            path: "transitmanager/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Transit Manager",
            path: "transitmanager/purchaseorders"
        },
        {
            title: "Material Readiness Documents",
            icon: "note_stack",
            role: "Transit Manager",
            path: "transitmanager/materialreadinessdocument"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Transit Manager",
            path: "transitmanager/modeoftransportationchange"
        },

        // DGM TLOGISTICS
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Deputy General Manager Technical Logistics",
            path: "deputygeneralmanagertechnicallogistics/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Deputy General Manager Technical Logistics",
            path: "deputygeneralmanagertechnicallogistics/purchaseorders"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Deputy General Manager Technical Logistics",
            path: "deputygeneralmanagertechnicallogistics/modeoftransportationchange"
        },

        // GM TECHLOG
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "General Manager Technical Logistics",
            path: "generalmanagertechnicallogistics/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "General Manager Technical Logistics",
            path: "generalmanagertechnicallogistics/purchaseorders"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "General Manager Technical Logistics",
            path: "generalmanagertechnicallogistics/modeoftransportationchange"
        },

        // ED TECHNCIAL DIRECTORATE
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Executive Director Technical Directorate",
            path: "executivedirectortechnicaldirectorate/dashboard"
        },
        {
            title: "Purchase Orders Tracking",
            icon: "distance",
            role: "Executive Director Technical Directorate",
            path: "executivedirectortechnicaldirectorate/purchaseorders"
        },
        {
            title: "Mode Of Transportation Change",
            icon: "airplanemode_active",
            role: "Executive Director Technical Directorate",
            path: "executivedirectortechnicaldirectorate/modeoftransportationchange"
        },


        // LOCAL CLEARING AGENT
        {
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Local Clearing Agent",
            path: "localclearingagent/dashboard"
        },
        {
            title: "Shipping Documents",
            icon: "home_storage",
            role: "Local Clearing Agent",
            path: "localclearingagent/shippingdocuments"
        },


        // PORT OFFICER
        {   
            title: "Dashboard Analytics",
            icon: "insert_chart",
            role: "Port Officer",
            path: "portofficer/dashboard"
        },
        {
            title: "Shipping Documents",
            icon: "home_storage",
            role: "Port Officer",
            path: "portofficer/shippingdocuments"
        },
    ];

    return (
        <div id="thenavbar" className={isActive ? "sidenav active" : "sidenav"}>
            <div className="menu_btn" onClick={() => setIsActive(!isActive)}>
                <span className="material-symbols-rounded">menu</span>
            </div>
            <img width="45px" src={logo} alt="" />
            <ul>
                {sidebarItems.map((item, index) => {
                    const roleColor = rolesWithColors.find(role => item.role === role.role)?.color || "#F5F5F5"; // Default to white if no color found
                    return (
                        roles?.includes(item.role) && (
                            <li
                                key={index}
                                className={page === item.title && (item.path.split("/")[0] === window.location.pathname.split("/")[1]) ? "nav-item active" : "nav-item"}
                                style={roles.length > 1 ? { backgroundColor: roleColor } : {}}
                                onClick={() => {
                                    navigate("/" + item.path);
                                    dispatch(setPageContext({}));
                                }}
                            >
                                <span className="material-symbols-rounded">{item.icon}</span>
                                <p>{item.title}</p>
                            </li>
                        )
                    );
                })}
            </ul>            
        </div>
    );
} 

export default Sidebar