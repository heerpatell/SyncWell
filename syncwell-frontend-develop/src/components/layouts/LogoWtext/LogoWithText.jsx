import React from "react";
import Text from "../../components/Text";
import "./logowithtext.scss";

function LogoWithText({ txt, txtsize, imgsize, logo: Logo, fontWeight }) {
	return (
		<>
			<div className="mainouterlogowithtext">
				{Logo && (
					<Logo
						className="logostyle"
						width={imgsize}
						height={imgsize}
					/>
				)}
				{/* <img src={image} alt="Logo" className='logostyle' width={imgsize} height={imgsize}/> */}
				<Text
					txt={txt}
					color={"#1F8B8B"}
					txtsize={txtsize}
					fontWeight={fontWeight}
				/>
			</div>
		</>
	);
}

export default LogoWithText;
