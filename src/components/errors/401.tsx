import { Button } from 'antd';
import React from 'react';
import './errorpage.css';
import { TiArrowBack } from 'react-icons/ti';
import { Link } from 'react-router-dom';

function UnAuthorized() {
	return (
		<>
			<div className="errormain">
				<div className="errorCard">
					<div style={{ width: '330px', paddingLeft: '20px' }}>
						<h1 className="errorPageheading">401 Unauthorized</h1>

						<p>
                        Looks like you need to be signed in to access this page. No worries, we'll help you get right back on track.
						</p>
						{/* <Link to="/">
							<Button type="primary" className="gx-btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
								<TiArrowBack size={25} />
								Back to Login
							</Button>
						</Link> */}
					</div>
					<div className="rightdiv">
						<img src="/assets/images/401img.png" className="errorimg" alt="" width={450} />
					</div>
				</div>
			</div>
		</>
	);
}

export default UnAuthorized;
