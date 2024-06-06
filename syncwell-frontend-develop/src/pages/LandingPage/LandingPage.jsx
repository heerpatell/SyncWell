import React from "react";
import Footer from "../../components/sections/Footer/Footer";
import Navbar from "../../components/sections/Navbar/Navbar";
import Text from "../../components/components/Text";
import { ReactComponent as TopRightImg } from "../../images/topRight_img.svg";
import { ReactComponent as BootomLeftImg } from "../../images/bottomLeft_img.svg";
import { ReactComponent as TeamImg } from "../../images/team_img.svg";
import { ReactComponent as BottomRightImg } from "../../images/bottomRight_img.svg";

function LandingPage() {
	return (
		<>
			<div>
				<div>
					<Navbar />
				</div>
				<hr color="#E1E1E1" />
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "0.4rem",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							margin: "0 5rem",
							marginTop: "1.4rem",
						}}
					>
						<div>
							<TeamImg
								style={{
									width: "100%",
								}}
							/>
							</div>
						<div>
						<TopRightImg
							width={"100%"}
							style={{
								maxWidth: "300px",
							}}
						/>
						</div>
					</div>
					<div style={{ textAlign: "center" }}>
						<div style={{ marginBottom: "1rem" }}>
							<Text
								txt={"Collaborate Remotely"}
								color={"#1F8B8B"}
								txtsize={"h2"}
								fontWeight={"bold"}
							/>
						</div>
						<Text
							txt={"With anyone, at your convenience"}
							color={"#1098D3"}
							txtsize={"h5"}
						/>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							margin: "0 5rem",
							alignItems: "flex-start",
						}}
					>
						<div>
						<BootomLeftImg
							width="100%"
							style={{
								maxWidth: "450px",
							}}
						/></div><div>
						<BottomRightImg
							width="100%"
							style={{
								maxWidth: "450px",
							}}
						/></div>
					</div>
				</div>
				<div style={{ position: "fixed", bottom: "0", width: "100%" }}>
					<Footer />
				</div>
			</div>
		</>
	);
}

export default LandingPage;
