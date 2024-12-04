import { ToastContainer } from 'react-toastify';
import loading from '../../src/assets/images/loading.gif'
import { useLocation, useNavigate } from "react-router-dom";
import { logoutTepngUser } from '../request';
import Modal from "react-modal"
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { customStyles, formatWithCommas, rolesWithColors, truncateText } from 'helpers';
import { PageProps } from 'interfaces/index.interface';

const Header = (props: PageProps) => {
    const { page } = props  
    const location = useLocation()
    const navigate = useNavigate();   
    const user:any = useSelector((state: any) => state.tepngUser.value);
    const roles:any = useSelector((state: any) => state.roles.value);    
    const unreadCount:number = useSelector((state: any) => state.unreadCount.value);    
    const [isLoading, setIsLoading] = useState(false)
    
    const logout = () => {
        setIsLoading(true)
        logoutTepngUser().then(res => {
            if(res) navigate('/logout'); setIsLoading(false)
        }) 
    }

    const role = window.location.pathname.split('/')[1]
    const AllowedToViewNotifications = [
        "transitofficer",
        "freightforwarder",
        "localclearingagent",
        "supplier"
    ]   
    const [isShowRoleBox, setIsShowRoleBox] = useState(false)

    //close role-box on window scroll
    window.addEventListener('scroll', () => {
        setIsShowRoleBox(false)
    })

    // const elelemnt = document.getElementById("role-box-trigger")
    // elelemnt?.addEventListener('mouseover', () => setIsShowRoleBox(true))
    // elelemnt?.addEventListener('mouseout', () => setIsShowRoleBox(false))

    return (
        <>
            <nav>
                <div className='nav-left'>
                    <div onClick={() => (document.getElementById("thenavbar") as HTMLElement)?.classList.toggle("active")} className="menu_btn"><span className="material-symbols-rounded" style={{color:"white"}}>menu</span></div>
                    <h4>{ page }</h4>
                </div>
               
                <div className='nav-right'>
                    <div id="role-box-trigger">
                        <p className='capitalize'>{user?.firstName} {user?.lastName}</p>
                        <p className='uppercase' style={{fontSize: "10px", cursor: "pointer"}} 
                        // title={roles?.join(", ")}
                        onClick={() => setIsShowRoleBox(!isShowRoleBox)}
                        >{truncateText(roles?.join(", "), 70)}
                        </p>
                    </div> 
                    <div className='user-manual'
                        title='Click to view user manual'>
                        User Manual
                    </div>
                    {AllowedToViewNotifications.includes(role) && <button type="button" className="icon-button" style={{borderLeft: "1px solid white", padding: "0 16px"}}  onClick={() => navigate(`/${location.pathname.split('/')[1]}/notifications`)}>
                        <span className="material-symbols-rounded">notifications</span>
                        {unreadCount > 0 && <span className="icon-button__badge">{formatWithCommas(unreadCount)}</span>}
                    </button>}
                    <button className='white-text' style={{borderLeft: "1px solid white", paddingLeft: "16px", height: "30px"}} 
                        onClick={() => logout()}>Logout</button>
                </div>
            </nav>
            {isShowRoleBox && <div id="role-box" style={{
                position: "absolute",
                top: "58px",
                right: "0",
                marginRight: "165px",
                width: "200px",
                height: "fit-content",
                backgroundColor: "white",
                zIndex: "1",
                borderRadius: "6px",
                boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.2)"
            }}
            onClick={() => setIsShowRoleBox(false)}
            >
                {
                    roles.map((role: string) => {
                        return (
                            <div style={{padding: "8px", fontSize: '11px', borderBottom: "1px solid #D9D9D9", display: "flex", gap: "8px", alignItems: "center"}}>
                                <div style={{height: "10px", width: "10px", backgroundColor: `${rolesWithColors.find((data: any) => data.role === role)?.color}`}}></div>
                                <span>{role}</span>
                            </div>
                        )
                    })
                }
            </div>}
            <ToastContainer />
            <Modal isOpen={isLoading} style={customStyles} className="modal modal-sm" ariaHideApp={false}>
                <div className="loader">
                    <img src={loading} alt="loading" />
                    <p>Loading data...</p>
                </div>
            </Modal> 
        </>
    )
}

export default Header