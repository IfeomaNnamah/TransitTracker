import { FormEvent, useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo-2.png"
import { makePostRequest } from "../../request";
import { useDispatch } from "react-redux";
import { setTepngUser } from "../../store/tepngUser";
import { setAccessToken } from "../../store/accessToken";
import { setRoles } from "../../store/roles";

type CustomStyle = {
    [key: string]: string;
};

const customStyle: CustomStyle = {
    textAlign: "left",
    width: "260px",    
    margin: "48px auto",
    marginTop: "48px",
}

const Authentication =  () => {
    // const accessToken:any = useSelector((state: any) => state.accessToken.value);
    const dispatch = useDispatch()
    const [iconChange, setIconChange] = useState(false)
    const [isTokenSent, setIsTokenSent] = useState(false)

    const queryParams = new URLSearchParams(window.location.search); 
    const [formData, setFormData] = useState<Record<string, string>>({
        email: queryParams.get("email") ? String(queryParams.get("email")) : "",
        password: queryParams.get("password") ? String(queryParams.get("password")) : ""
    })
    const navigate = useNavigate()

    const togglePassword = (inputId:string) => {
        var userPassInput:any = document.getElementById(inputId);
      
        if (userPassInput.type === "password") {
          userPassInput.type = "text";
          setIconChange(true)
        } else {
          userPassInput.type = "password";
          setIconChange(false)
        }
    }

    const handleChange = (event: any) => {        
        const { name, value } = event.target //get data form each input on change
        setFormData(values => ({...formData, [name]: value})) //set retrieved values to "formData" object  
    }

    const [isLoading, setIsLoading] = useState(false)
    const SendLoginOTP = (event: FormEvent) => {
        setIsLoading(true)
        event.preventDefault()
        var request:Record<string, any> = {
            what: "LoginThirdPartyUser",
            data: formData
        }; 
        makePostRequest(request)
            .then((res:any) => {                  
                setIsLoading(false)
                toast.success("A verification code has been sent to your email")
                if(res.status) setIsTokenSent(true)
            })
            .catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }

    const LoginUser = (event: FormEvent) => {
        setIsLoading(true)
        event.preventDefault()
        var request:Record<string, any> = {
            what: "ThirdPartyUserLogin2FA",
            data: {
                email: !!queryParams.get("email") ? queryParams.get("email") : formData.email,
                otp: !!queryParams.get("code") ? queryParams.get("code") : formData.otp
            }
        }; 
        makePostRequest(request)
            .then((res:any) => {                  
                setIsLoading(false)
                toast.success(res.msg)
                const response = res.data.data
                dispatch(setTepngUser(response.user))                
                dispatch(setRoles(response.roles))
                
                // Prompt user to change password if isPasswordUpdated = true
                if(!response.user.isPasswordUpdated) navigate(`/changepassword?email=${formData.email}`)
                else {
                    dispatch(setAccessToken(response.accessToken)) // set access token
                    // var joinRole = response.roles.join("")
                    // var role = joinRole.toLowerCase().replace(" ","")

                    //Redirect user after login
                    const redirectURL = sessionStorage.getItem("redirectURL")
                    if(redirectURL !== null) window.location.replace(redirectURL)
                    else {
                        // if(response.roles.length.length > 1) navigate("/validaterole")
                        // else 
                        // navigate user to the first assigned role
                        navigate(`/${response.roles[0].toLowerCase().replaceAll(" ","")}/dashboard`)
                    }
                    sessionStorage.removeItem("redirectURL")               
                }
            })
            .catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
    }

    const isEmailEntered = () => {
        if(!formData.email) return "/resetpassword"
        else return `/resetpassword?email=${formData.email}`
    }

    useEffect(() => {
        if(!!queryParams.get("redirect")) setIsTokenSent(true)
        if(!!queryParams.get("code")) setFormData({...formData, otp: String(queryParams.get("code"))})
        // eslint-disable-next-line
    }, [])

    return (
        <div className="authentication-container">
            <div className="authentication-modal">
                <div className="inner">
                    <img width="50px" src={logo} alt="" />
                    <h3>Transit Tracker System</h3>
                    {!isTokenSent && // if false                   
                    <form onSubmit={SendLoginOTP}> 
                        <div style={customStyle}>
                            <p className="header-text">Login</p>
                            <p className="small-text">Enter your credentials and check your email for the sent token.</p>
                            <input name="email" value={formData.email} className="custom-input" type="email" placeholder="Email Address" onChange={handleChange} required />
                            <div className="password-container mt-1">                            
                                <input id="password1" type="password" name="password" 
                                    value={formData.password} 
                                    placeholder="Password" 
                                    onChange={handleChange} 
                                    minLength={8} 
                                    required/>
                                {iconChange && <span onClick={() => togglePassword("password1")} className="material-symbols-rounded">visibility</span>}
                                {!iconChange && <span onClick={() => togglePassword("password1")} className="material-symbols-rounded">visibility_off</span>}
                            </div>                        
                        </div>
                        {/* Check for strong password */}
                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Login"}</button> 
                        <div className="d-flex mt-2 auth-button">
                            <Link to={"/"} className="link-text">Back</Link>
                            <Link to={isEmailEntered()} className="link-text">Forgot Password?</Link>
                        </div>
                    </form>}

                    {isTokenSent && // if true
                    <>
                        <form onSubmit={LoginUser}> 
                            <div style={customStyle}>
                                <p className="header-text">Two Factor Authentication</p>
                                <p className="small-text">A verification code has been sent to your email. This code would be valid for 10mins.</p>
                                <input className="custom-input" type="type" 
                                    name="otp"
                                    value={formData.otp}
                                    placeholder="Enter Code" 
                                    onChange={handleChange}
                                    required />                      
                            </div>
                            
                            <button disabled={isLoading} type="submit" className="auth-button">{isLoading ? "Verifying..." : "Verify" }</button>
                        </form>
                        
                        <Link className="link-text" to="/">Back to Login</Link>
                    </>
                    }  
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Authentication