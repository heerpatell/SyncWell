import React from "react";
import LogoWithText from "../../layouts/LogoWtext/LogoWithText";
import Text from "../../components/Text";
import { ReactComponent as Logosvg } from "../../../images/logo.svg";
import "./navbar.scss";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

function Navbar() {
	return (
		<>
			<div className="navbar-outer">
				<div className="nav-left">
					<LogoWithText
						txt="SyncWell"
						txtsize={"h6"}
						logo={Logosvg}
						imgsize={40}
						fontWeight={"bold"}
					/>
				</div>
				<div className="nav-right">
					<div className="nav-right-login">
						<Link to="/login" style={{ textDecoration: "none" }}>
							<Button style={{
								color: '#1098D3',
								textTransform: 'none',
							}}>
								Login
							</Button>
						</Link>
					</div>
					<div className="nav-right-signup">
						<Link to="/login" style={{ textDecoration: "none" }}>
							<Button variant='contained' style={{
								textTransform: 'none',
							}}>
								Get Started
								</Button>
						</Link>
					</div>
					<div></div>
				</div>
			</div>
		</>
	);
}

export default Navbar;
