import { Button } from 'antd'
import React from 'react'
import "./errorpage.css"
import { TiArrowBack } from "react-icons/ti";
import {Link} from "react-router-dom";

function Forbidden() {
    return (
        <>
 <div className='errormain'>

<div className='errorCard'>

<div style={{width:"330px",paddingLeft:"20px"}}>
      <h1 className='errorPageheading'>403
      Forbidden</h1>

      <p>
Oops! It looks like you've hit a roadblock. Unfortunately, you don't have permission to access this page or resource.</p>
     
     {/* <Link to="/">
      <Button type="primary" className="gx-btn-block" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
        <TiArrowBack size={25}/>
        Back to Login
     </Button>
          
     </Link> */}
</div>
 <div className='rightdiv'>
 <img src="/assets/images/403img.png" className='errorimg' alt="" width={450} />
 </div>
</div>

</div>        </>
    )
}

export default Forbidden