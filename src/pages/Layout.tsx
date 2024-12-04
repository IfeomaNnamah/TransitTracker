import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { ReactProps } from "../interfaces/index.interface"
import { useDispatch, useSelector } from "react-redux";
import { makeGetRequest, RefreshToken } from "../request";
import { useEffect } from 'react';
import { setUnreadCount } from "store/unreadCount";

const Layout  = ({children, title}: ReactProps) => {
    const dispatch = useDispatch()    
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const role = window.location.pathname.split('/')[1]
    
    const getUnreadNotificationsCount = () => {
        let apiCallParameters = {
            endpoint: "",
            receiver: ""
        }
        if(role === "supplier") apiCallParameters.endpoint = "getUnreadMaterialReadinessDocumentNotifications"
        else if(["transitofficer", "freightforwarder", "localclearingagent"].includes(role)) apiCallParameters.endpoint = "getUnreadShippingDocumentNotifications"

        if(role === "transitofficer") apiCallParameters.receiver = "TransitOfficer"
        else apiCallParameters.receiver = user?.id

        var request: Record<string, any> = {
            what: apiCallParameters.endpoint,
            params: {
                Receiver: apiCallParameters.receiver,
            }
        };
        
        if(Object.values(apiCallParameters).every(value => value !== "")) {
            makeGetRequest(request)
            .then((response: any) => {
                const res = response.data.data
                // setUnreadCount(3)
                dispatch(setUnreadCount(res.length))

            })
        }
    }

    useEffect(() => {        
        if(accessToken?.token) getUnreadNotificationsCount();
        //eslint-disable-next-line
    }, [window.location]);

    useEffect(() => {
        if(!accessToken || new Date(accessToken?.expiration) < new Date()) {
            RefreshToken(dispatch)
            ?.then((res:any) => {
                const currentPagePath = window.location.pathname.split("/")[1]
                const fRoles = res.roles.map((role: string) => role.toLowerCase().replaceAll(" ", ""))

                // Validate if user assigned roles is equal to the path tried to access
                if(!fRoles.includes(currentPagePath)){
                    sessionStorage.setItem("token", res.accessToken.token)
                    window.location.replace(window.location.origin + "/unauthorized")                        
                }

                //Redirect user after login
                const redirectURL = sessionStorage.getItem("redirectURL")                
                if(redirectURL !== null) window.location.replace(redirectURL)
                // else navigate(`/${res.roles[0].toLowerCase().replaceAll(" ","")}/dashboard`)
                sessionStorage.removeItem("redirectURL")
            })
            .catch((error:any) => console.log("error: ",error));
        }
        //eslint-disable-next-line
    }, [])

    // const header = document.getElementsByTagName("nav")[0] as HTMLElement; // Get the first <nav> element
    // const main = document.getElementsByClassName("main")[0] as HTMLElement; // Get the first element with the "main" class

    // if (header && main) {
    //     const headerHeight = header.offsetHeight || 0; // Get height dynamically
    //     main.style.top = `${headerHeight}px`; // Set the top style dynamically
    // }
    
    return (
        <>
            {accessToken && <>
                <Header page={title} />
                <Sidebar page={title} />
                <div>{ children }</div>
            </>}
        </>
    )
}

export default Layout