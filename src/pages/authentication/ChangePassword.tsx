import { FormEvent, useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const ChangePassword =  () => {
    const params = useLocation()
    const email = params.search.substring(7,)
    const [formData, setFormData] = useState<Record<string, any>>({
        email: email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [errorData, setErrorData] = useState<Record<string, any>>({})

    const [iconChange, setIconChange] = useState(false)
    const [iconChange2, setIconChange2] = useState(false)
    const [iconChange3, setIconChange3] = useState(false)
    const navigate = useNavigate()

    const togglePassword = (inputId:string) => {
        var userPassInput:any = document.getElementById(inputId);
      
        if (userPassInput.type === "password") {
          userPassInput.type = "text";
          switch(inputId){
            case "password4":
                setIconChange(true)
                break

            case "password5":
                setIconChange2(true)
                break

            case "password6":
                setIconChange3(true)
                break
          }
        //   inputId === "password4" ? setIconChange(true) : setIconChange2(true)
        } else {
          userPassInput.type = "password";
          switch(inputId){
            case "password4":
                setIconChange(false)
                break

            case "password5":
                setIconChange2(false)
                break

            case "password6":
                setIconChange3(false)
                break
          }
        //   inputId === "password4" ? setIconChange(false) : setIconChange2(false)          
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
                    case "currentPassword":
                        setErrorData({ ...errorData, currentPassword: 'Password is not valid' })
                        break;

                    case "newPassword":
                        setErrorData({ ...errorData, newPassword: 'Password is not valid' })
                        break;

                    case "confirmPassword":
                        setErrorData({ ...errorData, confirmPassword: 'Password is not valid' })
                        break;
                }
            }else {
                switch(name){
                    case "currentPassword":
                        setErrorData({ ...errorData, currentPassword: '' })
                        break;

                    case "newPassword":
                        setErrorData({ ...errorData, newPassword: '' })
                        break;

                    case "confirmPassword":
                        setErrorData({ ...errorData, confirmPassword: '' })
                        break;
                }
            }

            if(formData.newPassword !== formData.confirmPassword) setErrorData({ ...errorData, confirmPassword: 'Password is not similar to the new password' })
            else setErrorData({ ...errorData, confirmPassword: '' })
        }
    }    

    const [isLoading, setIsLoading] = useState(false)
    const HandleChangePassword = (event: FormEvent) => {
        event.preventDefault()
        var request:Record<string, any> = {
            what: "ThirdPartyChangeUserCreds",
            data: formData
        }; 
        if(formData.newPassword === formData.confirmPassword) setErrorData({ ...errorData, confirmPassword: '' })
        if(!errorData.confirmPassword){
            setIsLoading(true)
            makePostRequest(request)
                .then((res:any) => {  
                    setIsLoading(false)
                    toast.success(res.msg+ ". You'll be redirected shortly to login with the new password.")
                    setTimeout(() => {
                        // navigate user to the login page
                        navigate("/login")
                    }, 1500);                   
                    
                    //issue cause of access token not setting before redirect                    
                })
                .catch((error:any) => {toast.error(error.msg); setIsLoading(false)});
        }
    }

    useEffect(() => {
        if(!email) navigate("/") // eslint-disable-next-line
    }, [])

    return (
        <div className="authentication-container">
            <div className="authentication-modal">
                <div className="inner">
                    <img width="50px" src={logo} alt="" />
                    <h3>Transit Tracker System</h3>      
                    
                    <form onSubmit={HandleChangePassword}> 
                        <div style={customStyle}>
                            <p className="header-text">Change Password</p>
                            <p className="small-text">Replace the system generated password</p>
                            <p className='alert-warning'>The password must have a minimun of eight characters, including uppercase, lowercase, special characters, and a number.</p>
                            {/* Check for strong password */}
                            <div className="password-container mt-1">                            
                                <input id="password4" type="password" placeholder="Current Password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    onBlur={checkPassword}
                                    minLength={8}
                                    required/>
                                {iconChange && <span onClick={() => togglePassword("password4")} className="material-symbols-rounded">visibility</span>}
                                {!iconChange && <span onClick={() => togglePassword("password4")} className="material-symbols-rounded">visibility_off</span>}
                            </div>     
                            <p className="error">{ errorData.currentPassword }</p>  
                            <div className="password-container mt-1">                            
                                <input id="password5" type="password" placeholder="New Password" 
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    onBlur={checkPassword}
                                    minLength={8}
                                    required/>
                                {iconChange2 && <span onClick={() => togglePassword("password5")} className="material-symbols-rounded">visibility</span>}
                                {!iconChange2 && <span onClick={() => togglePassword("password5")} className="material-symbols-rounded">visibility_off</span>}
                            </div>
                            <p className="error">{ errorData.newPassword }</p>    
                            <div className="password-container mt-1">                            
                                <input id="password6" type="password" placeholder="Confirm Password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={checkPassword}
                                    minLength={8}
                                    required/>
                                {iconChange3 && <span onClick={() => togglePassword("password6")} className="material-symbols-rounded">visibility</span>}
                                {!iconChange3 && <span onClick={() => togglePassword("password6")} className="material-symbols-rounded">visibility_off</span>}
                            </div> 
                            <p className="error">{ errorData.confirmPassword }</p>             
                        </div>
                        
                        <button type="submit" className="auth-button"
                            disabled={isLoading}
                            >{isLoading ? "Please wait..." : "Change Password"}</button>
                    </form>

                    <Link to={"/login"} className="link-text">Back to Login</Link>

                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default ChangePassword