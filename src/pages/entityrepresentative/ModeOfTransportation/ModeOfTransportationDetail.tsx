import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../Layout";
import PdfGenerator from "../../pdftemplates/generateModeOfTransportation";
import {FormEvent, useState} from "react"
import Modal from "react-modal"
import { makeGetRequest, makePatchRequest } from "../../../request";
import { ToastContainer, toast } from 'react-toastify';
import { customStyles, formatDateTime } from 'helpers';
import loading from "../../../assets/images/loading.gif"
import { useSelector } from 'react-redux';

const ModeOfTransportationDetail =  () => {
    const page = "Mode Of Transportation Change"
    const params: any = useParams()
    const navigate = useNavigate()
    const [openChatHistory, setOpenChatHistory] = useState(false)
    const user = useSelector((state: any) => state.tepngUser.value);
    // const accessToken = useSelector((state: any) => state.accessToken.value);
    const [chats, setChats] = useState<Record <string, any>>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chatData, setChatData] = useState({
        modeOfTransportationId: "", 
        entityRepresentativeId: "", 
        receiver: "",
        comment: "",
    })
    const clearChatData = () => {
        setChatData({
            modeOfTransportationId: "", 
            entityRepresentativeId: "", 
            receiver: "",
            comment: "",
        })
    }
    const handleSendChat = (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        var request = {
            what: "AddCommentForModeOfTransportation",
            data: {
                modeOfTransportationId: chatData.modeOfTransportationId,
                comment: chatData.comment,
                sender: user?.id,
                senderRole: "Entity Representative",
                receiver: "Approvers"
            }
        };
        
        makePatchRequest(request)
            .then(() => {
                setIsSubmitting(false)
                clearChatData()
                toast.success("Response Sent Successfully!")
                setOpenChatHistory(false)
                navigate("/entityrepresentative/modeoftransportationchange")
            })
            .catch((error) => 
                {toast.error(error); setIsSubmitting(false)}
            );
    } 

    const getMotChatHistory = (modeOfTransportationId: string) => {
        setIsChatLoading(true)
        var request = {
            what: "ModeOfTransportationChatHistory",
            params: {
                modeOfTransportationId: modeOfTransportationId,
                orderBy: 1
            }
        };
        
        makeGetRequest(request)
            .then((response: any) => {
                setIsChatLoading(false)
                const res = response.data.data
                setChats(res.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()))
            })
            .catch((error) => 
                {toast.error(error.msg); setIsChatLoading(false)}
            );
    }

    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <div className="main-inner mt-2">                  
                        <div className="detail-top-section">
                            <div className='d-flex'>
                            <Link to="/entityrepresentative/modeoftransportationchange" className="actions">
                                <p><span className="material-symbols-rounded">arrow_back</span> Back to Mode of Transportation</p>
                            </Link>

                            <button 
                                className='actions'
                                onClick={() => {
                                    setOpenChatHistory(true); 
                                    getMotChatHistory(params?.id);
                                    setChatData({...chatData, modeOfTransportationId: params.id})}}
                                ><p><span className="material-symbols-outlined">forum</span>Send | View Chats</p>
                            </button> 
                            </div>
                            <div className="tab">
                                <div className="tab-item active">
                                    <span className="material-symbols-rounded">description</span>
                                    <p>Preview Mode Of Transportation Document</p>
                                </div>    
                            </div>                      
                        </div>
                    </div> 

                    <div className="main-inner mt-1" style={{minHeight: "500px"}}><PdfGenerator role="Entity Representative" /></div>
                </div>
            </div>
            <Modal isOpen={openChatHistory} style={customStyles} className="modal modal-7" ariaHideApp={false}>
                <div className="modal-header">
                    <h3>Chats</h3>
                    <span className="material-symbols-rounded close"
                        onClick={() => {setOpenChatHistory(false); clearChatData()} }>close</span>
                </div>        
                <div className="modal-body" style={{ minHeight: "200px"}}>
                    {(!isChatLoading && !chats.length) && <p>No Chats Found.</p>}

                    {!isChatLoading && 
                    <div className='chat-container'>
                        {chats.map((chat: any, index: number) => {
                            return (
                                <div key={index} className={`chat-dialog ${chat.sender === user?.id ? "right" : "left"}`}>
                                    <label className='title'>{chat.sender === "Approvers" ? chat?.senderRole : "Entity Representative"}</label>
                                    <p>{chat.message}</p>
                                    <span className='date'>{formatDateTime(chat.createdDate)}</span>
                                </div>
                            )
                        })}
                    </div>}

                    {isChatLoading && 
                    <div className="loader">
                        <img src={loading} alt="loading" />
                        <p className="d-flex-center">Loading Chats...</p>
                    </div>}
                </div>
                <form onSubmit={handleSendChat}>
                <div className="modal-footer">
                    <textarea 
                        name="comment" 
                        placeholder="Message for Entity Representative..." 
                        rows={4} 
                        maxLength={300}
                        onChange={(event) => setChatData({...chatData, comment: event.target.value})}
                        value={chatData.comment} 
                        required >
                    </textarea>
                    <button type="submit" 
                    disabled={isSubmitting || !chatData.comment}
                    className="custom-button orange">{isSubmitting ? "Loading..." : "Send"}</button>
                </div>
                <small style={{fontSize: "10px"}} className={chatData.comment.length >= 300 ? "mt-1 error" : "mt-1"}>{chatData.comment.length}/300 Characters</small>    
                </form>
            </Modal>
            <ToastContainer />
        </Layout>
    )
}

export default ModeOfTransportationDetail