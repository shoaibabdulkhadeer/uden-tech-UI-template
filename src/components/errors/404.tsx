import { Button } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react'
import "./errorpage.css"
import { TiArrowBack } from "react-icons/ti";
import {Link} from "react-router-dom";


function NotFound() {
	const navigate = useNavigate();

	useMemo(() => sessionStorage.clear(), []);

	return (
		<>
		<div className='errormain'>

			<div className='errorCard'>

			<div style={{width:"330px",paddingLeft:"20px"}}>
				  <h1 className='errorPageheading'>404 Page Not 
				  Found</h1>

<p>Sorry, but the page you're looking for seems to have gone on vacation. It's either been moved, deleted, or it might have never existed in the first place.</p>
				{/* <Link to="/">

				  <Button type="primary" className="gx-btn-block" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
					<TiArrowBack size={25}/>
					Back to Login
				 </Button>
										 
				</Link> */}
			</div>
			 <div className='rightdiv'>
			 <img src="/assets/images/404img.png" className='errorimg' alt="" width={450} />
			 </div>
			</div>

		</div>
	</>
	);
}

export default NotFound;
