import { useState } from "react";
import logo from "../../assets/images/logo-2.png"
import loading from "../../assets/images/loading.gif"
import { authenticateLocally } from "../../request";
import { loginTepngUser } from "../../request";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTepngUser } from "../../store/tepngUser";
import { setAccessToken } from "../../store/accessToken";
import { setRoles } from "../../store/roles";
import { RefreshToken } from "../../request";
import { useEffect } from 'react';
import { setPermissions } from "store/permissions";

const customStyle = {
    marginTop: "48px"
}

const Authentication =  () => {
    const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const dev = false // toggle between TestLogin and ADLogin
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()   
    const dispatch = useDispatch()

    const redirectUser = (roles: any) => {
        //Redirect user after login        
        const redirectURL = sessionStorage.getItem("redirectURL")
        if(redirectURL !== null) window.location.replace(redirectURL)
        else navigate(`/${roles[0].toLowerCase().replaceAll(" ","")}/dashboard`)
        sessionStorage.removeItem("redirectURL")
    }

    const TpengLogin = () => {
        setIsLoading(true)
        if(dev){
            authenticateLocally().then((res: any) => {
                if(res) {
                    dispatch(setTepngUser(res.userDetails))
                    dispatch(setAccessToken(res.accessToken))
                    dispatch(setRoles(res.roles))
                    dispatch(setPermissions(res.permissions))
                    redirectUser(res.roles)
                } 
            }) 
        }else{
            loginTepngUser().then((res: any) => {
                if(res) {
                    dispatch(setTepngUser(res.userDetails))
                    dispatch(setAccessToken(res.accessToken))
                    dispatch(setRoles(res.roles))
                    redirectUser(res.roles)
                } 
            })  
        }  
    }

    useEffect(() => {
        if(accessToken == null || new Date(accessToken?.expiration) < new Date()) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("azureauthredirect") === '1') {
                TpengLogin()
            }else {
                RefreshToken(dispatch)
                    ?.then((res:any) => redirectUser(res.roles))
                    .catch((error:any) => console.log("error: ",error));
            }    
        } // eslint-disable-next-line
    }, [])

    return (
        <div className="authentication-container">
            <div className="authentication-modal">
                <div className="inner">
                    <img width="50px" src={logo} alt="" />
                    <h3>Transit Tracker System</h3>                   

                    {!isLoading && <div style={customStyle}>
                        <p className="line-text">Login as</p>
                        <button onClick={() => TpengLogin()}>TotalEnergies Staff</button>
                        <button onClick={() => navigate("/login")}>Third-Party User</button>
                    </div>}

                    {isLoading && <div style={customStyle}>
                        <img width="60px" src={loading} alt="" />
                        <p className="small-text">Checking your Microsoft AD credentials to access the application</p>
                    </div>}
                </div>
            </div>
        </div>
    )
}

export default Authentication