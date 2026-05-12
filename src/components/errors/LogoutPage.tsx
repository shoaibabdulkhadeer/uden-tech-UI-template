import React, { useEffect } from 'react'
import { Button } from 'antd';
import './errorpage.css';
import { TiArrowBack } from 'react-icons/ti';
import { Link } from 'react-router-dom';

const LogoutPage = () => {

    useEffect(() => {
        sessionStorage.clear();
    },[])
  return (
    <>
    <div className="errormain">
        <div className="errorCard" style={{width:"800px"}}>
            <div style={{ width: '380px', paddingLeft: '20px' }}>
                <h1 className="errorPageheading">Your Session has Expired</h1>

                <p>
                Your session has expired. Please log in again to continue using the application.
                </p>
                {/* <Link to="/">
                    <Button type="primary" className="gx-btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <TiArrowBack size={25} />
                        Back to Login
                    </Button>
                </Link> */}
            </div>
            <div className="rightdiv">
                <img src="/assets/images/expired.jpeg" className="errorimg" alt="" width={250} />
            </div>
        </div>
    </div>
</>
  )
}

export default LogoutPage