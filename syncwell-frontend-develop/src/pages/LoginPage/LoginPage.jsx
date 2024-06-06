import React, { useState } from "react";
import Footer from "../../components/sections/Footer/Footer";
import Text from "../../components/components/Text";
import LogoWithText from "../../components/layouts/LogoWtext/LogoWithText";
import { ReactComponent as Logosvg } from "../../images/logo.svg";
import { ReactComponent as LandingImg } from "../../images/landing-page-graphic.svg";
import { useNavigate } from "react-router";
import { Button, Icon } from "@mui/material";
import { RiLoader4Line } from "react-icons/ri";
import { sendRequest } from "../../util";
import { ToastContext } from "../../context/Toast";
import { Icon as Iconify } from '@iconify/react';

function LandingPage() {
	let navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [loggedIn, setLoggesIn] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isResendDisabled, setIsResendDisabled] = useState(true);

	const ToastCtx = React.useContext(ToastContext);

	const loginHandled = () => {
		setIsLoading(true);

		sendRequest("auth/request-otp", "post", { email }).then((res) => {
			if (!res) {
				ToastCtx.setMsg(
					"Something went wrong, please try again later.",
				);
				return;
			}
			setIsLoading(false);
			setLoggesIn(true);
			ToastCtx.setMsg(
				"An OTP has been sent to your email. Please enter the OTP to continue.",
			);
			setTimeout(() => {
				setIsResendDisabled(false);
			}, 5000);
		});
	};

	const handleOtp = () => {
		setIsLoading(true);
		sendRequest("/auth/verify-otp", "post", { email, otpNum: otp })
			.then((res) => {
				localStorage.setItem("token", res.token || "");
				localStorage.setItem("userID", res?.user?.userID ?? "");
				console.log(50, res.user);
				if (!res.user.firstName) {
					navigate("/profile");
					return;
				}
				navigate("/dashboard");
			})
			.catch(() => {
				ToastCtx.setMsg("Invalid OTP. Please try again.");
			});
		setIsLoading(false);
	};

	const loginWithGoogle = async () => {
		await sendRequest("auth/google", "post").then((resp) => {
			if (!resp.url) {
				console.log("Unable to authorize");
				return;
			}
			window.open(resp.url, "oauthWindow", "width=600,height=800");

			window.addEventListener("message", (event) => {
				if (
					event.origin !== window.location.origin ||
					event?.data?.type !== "child-callback"
				)
					return;
				sendRequest("auth/google/login", "post", {
					code: event?.data?.payload?.code,
					state: event?.data?.payload?.state,
				}).then((resp) => {
					console.log(85, resp);
					if (!resp.token) throw new Error();
					localStorage.setItem("token", resp.token);
					navigate("/profile");
				}).catch(err => {
					console.log(89, err);
					ToastCtx.setMsg("Unable to login. Please try again later.");
				});
			});
		});
	};

	return (
		<>
			<div style={{ height: "100vh", position: "relative" }}>
				<div style={{ marginTop: "1.5rem" }}>
					<LogoWithText
						txt="SyncWell"
						txtsize={"h6"}
						logo={Logosvg}
						imgsize={40}
						fontWeight="bold"
					/>
					<hr color="#E1E1E1" style={{ marginTop: "1rem" }} />
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-around",
						margin: "6rem",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							// justifyContent: "space-around",
							width: "34rem",
							gap: "40px",
						}}
					>
						<Text
							txt={"Let's get started"}
							fontWeight={"bold"}
							txtsize={"h2"}
						/>
						<div>
							<Text
								style={{
									width: "500px",
								}}
								txt={
									"Log into your account to access your one-stop solution to schedule meetings."
								}
							/>
						</div>
						{loggedIn ? (
							<div
								style={{
									position: "relative",
								}}
							>
								<div
									style={{
										display: "flex",
										border: "2px solid #BBBBBB",
										width: "28rem",
										borderRadius: "0.5rem",
									}}
								>
									<div>
										<input
											style={{
												padding: "1rem",
												width: "20rem",
												border: "none",
												outline: "none",
												fontSize: "1.2rem",
												borderRadius: "0.3rem",
												fontFamily: "Montserrat",
												letterSpacing: "4px",
											}}
											value={otp}
											placeholder="OTP"
											onChange={(e) =>
												setOtp(e.target.value)
											}
										/>
									</div>
									<Button
										style={{
											backgroundColor: "#1F8A8B",
											width: "7rem",
											borderRadius: "0.3rem",
											textAlign: "center",
											padding: "0.6rem",
											margin: "0.4rem",
											float: "right",
											cursor: "pointer",
											color: "white",
										}}
										onClick={handleOtp}
									>
										{isLoading ? (
											<Icon
												style={{ display: "flex" }}
												className="loading-animation"
											>
												<RiLoader4Line />
											</Icon>
										) : (
											"Verify"
										)}
									</Button>
								</div>
								<div
									style={{
										position: "absolute",
										bottom: "-45px",
										marginTop: "0.7rem",
										display: "flex",
										justifyContent: "space-between",
										width: "28rem",
										alignItems: "center",
									}}
								>
									<Text
										txt={`An otp is sent to ${email}`}
										color={"#888888"}
										txtsize={"body2"}
									/>
									<Button
										variant="text"
										disabled={isResendDisabled}
									>
										Resend
									</Button>
								</div>
							</div>
						) : (
							<div
								style={{
									display: "flex",
									border: "2px solid #BBBBBB",
									width: "28rem",
									borderRadius: "0.5rem",
								}}
							>
								<div style={{}}>
									<input
										style={{
											padding: "1rem",
											borderRadius: "0.5rem",
											width: "20rem",
											border: "none",
											outline: "none",
											fontSize: "1.2rem",
											fontFamily: "Montserrat",
										}}
										value={email}
										placeholder="Email address"
										onChange={(e) =>
											setEmail(e.target.value)
										}
									/>
								</div>
								<Button
									style={{
										backgroundColor: "#1F8A8B",
										width: "7rem",
										borderRadius: "0.3rem",
										textAlign: "center",
										padding: "0.6rem",
										margin: "0.4rem",
										float: "right",
										cursor: "pointer",
										color: "white",
									}}
									onClick={loginHandled}
								>
									{isLoading ? (
										<Icon
											style={{ display: "flex" }}
											className="loading-animation"
										>
											<RiLoader4Line />
										</Icon>
									) : (
										"Login"
									)}
								</Button>
							</div>
						)}
						<hr style={{
							border: '1px solid #EEE',
							margin: '20px 0'
						}} />
						<div>
							<Button
								color='secondary'
								style={{
									background: 'white',
									padding: '12px 20px',
									textTransform: 'none'
								}}
								variant="outlined"
								startIcon={<Iconify icon='flat-color-icons:google' style={{ fontSize: '30px' }} />}
								onClick={loginWithGoogle}
							>
								Sign in with Google
							</Button>
						</div>
					</div>
					<div>
						<LandingImg />
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
