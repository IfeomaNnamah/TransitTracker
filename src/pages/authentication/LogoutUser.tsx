import image from "../../assets/images/success-icon.png"

const LogoutUser = () => {
    return (
        <>
            <div className="blocked-container">
                <div>
                    <img src={image} alt="unauthorized" width="65px" />
                    <h3>You have been logged out</h3>
                    <a style={{fontSize: "12px"}} href="/">Return to Homepage</a>
                    {/* <p>Click <a href="/">here</a> to log into the application</p> */}
                </div>
            </div>        
        </>
    )
}

export default LogoutUser