import React from "react";
import Text from "../../components/Text";
import { AiOutlineCopyright } from "react-icons/ai";
import "./footer.scss";

function Footer() {
	return (
		<>
			<div className="footer-main">
				<div className="footer-left">
					<div className="footer-txt">
						<Text
							txt={"About"}
							color={"#888888"}
							txtsize={"body2"}
						/>
					</div>
					<div className="footer-txt">
						<Text
							txt={"Services"}
							color={"#888888"}
							txtsize={"body2"}
						/>
					</div>
					<div className="footer-txt">
						<Text
							txt={"Contact"}
							color={"#888888"}
							txtsize={"body2"}
						/>
					</div>
				</div>
				<div className="footer-middle">
					<div className="footer-txt">
						<AiOutlineCopyright />
					</div>
					<div className="footer-txt">
						<Text
							txt={"SyncWell - 2024"}
							color={"#888888"}
							txtsize={"body2"}
						/>
					</div>
				</div>
				<div className="footer-right">
					<div className="footer-txt">
						<Text
							txt={"Privacy Policy"}
							color={"#888888"}
							txtsize={"body2"}
						/>
					</div>
					<div className="footer-txt">
						<Text
							txt={"Terms of use"}
							color={"#888888"}
							txtsize={"body2"}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default Footer;
