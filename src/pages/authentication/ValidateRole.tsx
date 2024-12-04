import { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo-2.png"
import { useSelector } from "react-redux";

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
    const navigate = useNavigate()
    const [role, setRole] = useState("")
    const roles:any = useSelector((state: any) => state.roles.value); 

    useEffect(() => {
        if(!roles) navigate("/") // eslint-disable-next-line
    }, [])

    return (
        <div className="authentication-container">
            <div className="authentication-modal">
                <div className="inner">
                    <img width="50px" src={logo} alt="" />
                    <h3>Transit Tracker System</h3>                   
                    <div style={customStyle}>
                        <p className="header-text">User Roles</p>
                        <p className="small-text">Select the role you wish to use to log in</p>
                        {
                            roles?.map((role:string, i:number) => {
                                return (
                                    <>
                                        <input
                                            name="role"
                                            type="radio"
                                            className="mt-2"
                                            value={role}
                                            key={i}
                                            onChange={(e) => setRole(e.target.value)}
                                        /> <label style={{fontSize: "12px"}}>{role}</label>
                                        <br />                    
                                    </>
                                )
                            })
                        }                       
                    </div>
                    
                    <button type="submit" className="auth-button"
                    onClick={() => role ? navigate(`/${role.toLowerCase().replace(" ", "")}/dashboard`) : toast.error("Kindly select a role")}>Continue</button>
                    {/* onClick={() => role ? navigate("/dashboard") : toast.error("Kindly select a role")}>Continue</button> */}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Authentication