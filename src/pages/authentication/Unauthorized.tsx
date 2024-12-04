import { useNavigate } from "react-router-dom"
import image from "../../assets/images/unauthorized.png"
import { logoutTepngUser } from "../../request"

const Unauthorized = () => {
    const navigate = useNavigate()
    return (
        <>
            <div className="blocked-container">
                <div>
                    <img src={image} alt="unauthorized" width="50px" />
                    <h3>401 Unauthorized Access</h3>
                    <p>You are not authorized to access this page. Please check your login<br/> credentials or contact the administrator for access.</p>

                    <button onClick={() => logoutTepngUser().then(res => {if(res) navigate('/logout')}) } className="custom-button orange" style={{padding: "12px 16px", margin: "32px auto"}}>Logout</button>
                    {/* <p>You do not have the permission to view this directory<br /> using the supplied credentials.</p> */}
                </div>
            </div>        
        </>
    )
}

export default Unauthorized