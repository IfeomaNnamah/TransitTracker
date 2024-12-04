import { FormEvent, useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo-2.png"
import { makePostRequest } from "../../request";

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
    // const params = useLocation()    
    const navigate = useNavigate()
    const queryParams = new URLSearchParams(window.location.search); 
    const [isLoading, setIsLoading] = useState(false)
    // const email = params.search.substring(7,)
    const [formData, setFormData] = useState<Record<string, any>>({
        email: queryParams.get("email") ? queryParams.get("email") : "",
        token: queryParams.get("token") ? queryParams.get("token") : "",
        password: "",
        confirmPassword: ""
    })
    const [errorData, setErrorData] = useState<Record<string, any>>({
        password: "",
        confirmPassword: ""
    })
    const [isSentResetToken, setIsSentResetToken] = useState(queryParams.get("redirect") ? true : false )
    const [iconChange, setIconChange] = useState(false)
    const [iconChange2, setIconChange2] = useState(false)

    const togglePassword = (inputId:string) => {
        var userPassInput:any = document.getElementById(inputId);
      
        if (userPassInput.type === "password") {
          userPassInput.type = "text";
          inputId === "password2" ? setIconChange(true) : setIconChange2(true)
        } else {
          userPassInput.type = "password";
          inputId === "password2" ? setIconChange(false) : setIconChange2(false)
        }
    }

    const isValidPassword = (password: string) => {
        // Define a regular expression pattern for the password conditions
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_=+{};:,<.>/?]).{8,}$/;
      
        // Test the password against the pattern
        return passwordPattern.test(password);
    }    

    const handleChange = (event: any) => {        
        const { name, value } = event.target //get data form each input on change
        setFormData(values => ({...formData, [name]: value}))      
    }

    const checkPassword = (event: any) => {
        const {name, value} = event.target   
        if(value.length >= 8 ){            
            if(!isValidPassword(value)) {
                switch(name){
                    case "password":
                        setErrorData({ ...errorData, password: 'Password is not valid' })
                        break;

                    case "confirmPassword":
                        setErrorData({ ...errorData, confirmPassword: 'Password is not valid' })
                        break;
                }
            }
            else {
                switch(name){
                    case "password":
                        setErrorData({ ...errorData, password: '' })
                        break;

                    case "confirmPassword":
                        setErrorData({ ...errorData, confirmPassword: '' })
                        break;
                }
            }
           
        }
    } 

    const SendResetToken = (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "SendResetToken",
            data: {
                email: formData.email
            }
        }; 
        makePostRequest(request)
            .then((res:any) => {   
                setIsLoading(false)    
                setIsSentResetToken(true)
                toast.success(res.msg)                 
            })
            .catch((error:any) => {toast.error(error.msg); setIsLoading(false)});        
    }

    const HandleResetPassword = (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)
        var request:Record<string, any> = {
            what: "ThirdPartyResetCreds",
            data: formData
        }; 
        if(formData.password === formData.confirmPassword) setErrorData({ ...errorData, confirmPassword: '' }); setIsLoading(false)
        if(!errorData.confirmPassword && !errorData.password){            
            makePostRequest(request)
                .then((res:any) => {       
                    setIsSentResetToken(true)
                    setIsLoading(false)
                    toast.success(res.msg+ ". You'll be redirected to login shortly")
                    setTimeout(() => {
                        navigate("/login")
                    }, 2000);                    
                })
                .catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
        }
    }

    useEffect(() => {
        if(formData.password !== formData.confirmPassword && formData.confirmPassword !== "") setErrorData({ ...errorData, confirmPassword: 'Password is not similar to the new password' })
        else setErrorData({ ...errorData, confirmPassword: '' })// eslint-disable-next-line
    }, [formData])

    return (
        <div className="authentication-container">
            <div className="authentication-modal">
                <div className="inner">
                    <img width="50px" src={logo} alt="" />
                    <h3>Transit Tracker System</h3>      
                    {/* Trigger Token generation              */}
                    {!isSentResetToken && // if false
                    <form onSubmit={SendResetToken}> 
                        <div style={customStyle}>
                            <p className="header-text">Reset Password</p>
                            <p className="small-text">Enter your email address for token verification</p>
                            <input className="custom-input" type="email" 
                                name="email"
                                value={formData.email}
                                placeholder="Email Address" 
                                onChange={handleChange}
                                required />                      
                        </div>
                        
                        <button disabled={isLoading} type="submit" className="auth-button">{isLoading ? "Sending..." : "Send Token" }</button>
                    </form>}   
                    {/* Verify entered ResetToken */}
                    {isSentResetToken && // if true
                    <form onSubmit={HandleResetPassword}> 
                        <div style={customStyle}>
                            <p className="header-text">Reset Password</p>
                            <p className="small-text">Enter token sent to your mail and your password</p>
                            <textarea className="password-container"
                                name="token"
                                value={formData.token}
                                onChange={handleChange}
                                placeholder="Token" 
                                rows={5}
                                required /> 
                            {/* Check for strong password */}
                            <div className="password-container mt-1">                            
                                <input id="password2" type="password" placeholder="New Password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={checkPassword}
                                    minLength={8}
                                    required/>
                                {iconChange && <span onClick={() => togglePassword("password2")} className="material-symbols-rounded">visibility</span>}
                                {!iconChange && <span onClick={() => togglePassword("password2")} className="material-symbols-rounded">visibility_off</span>}
                            </div>     
                            <p className="error">{ errorData.password }</p>
                            <div className="password-container mt-1">                            
                                <input id="password3" type="password" placeholder="Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={checkPassword}
                                    minLength={8}
                                    required/>
                                {iconChange2 && <span onClick={() => togglePassword("password3")} className="material-symbols-rounded">visibility</span>}
                                {!iconChange2 && <span onClick={() => togglePassword("password3")} className="material-symbols-rounded">visibility_off</span>}
                            </div>   
                            <p className="error">{ errorData.confirmPassword }</p>             
                        </div>
                        
                        <button type="submit" disabled={isLoading} className="auth-button">{isLoading ? "Resetting userPassInput..." : "Reset Password"}</button>
                    </form>} 

                    <Link to={"/login"} className="link-text">Back to Login</Link>

                </div>                
            </div>
            <ToastContainer />
        </div>
    )
}

export default Authentication