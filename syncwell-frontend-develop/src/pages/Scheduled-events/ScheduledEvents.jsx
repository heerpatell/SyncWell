import React, { useEffect, useState } from "react";
import "./scheduledEvents.scss";
import Sidebar from "../../components/sections/Sidebar/Sidebar";
import Text from "../../components/components/Text";
import ScheduledMeet from "../../components/layouts/ScheduledMeet/ScheduledMeet";
import { LightPurple } from "../../components/components/Color";
import { getFormattedDateTime, sendRequest, stringAvatar } from "../../util";
import { Avatar, Button, Skeleton } from "@mui/material";
import { ToastContext } from "../../context/Toast";
import ScheduledMeetHeader from "../../components/layouts/ScheduledMeet/ScheduledMeetHeader";
import { Icon } from "@iconify/react";

function ScheduledEvents() {
	const [selectedTab, setSelectedTab] = useState("host");

	const [dataState, setDataState] = useState({
		isLoading: true,
		isError: false,
		data: [],
	});

	const ToastCtx = React.useContext(ToastContext);

	const [option, setOption] = useState("scheduled");
	const handleTabClick = (tab) => {
		if (tab === "attendee") {
			setSelectedTab("attendee");
		} else {
			setSelectedTab("host");
		}
	};
	const handleOption = (o) => {
		if (o == "scheduled") {
			setOption("scheduled");
		} else {
			setOption("past");
		}
	};

	useEffect(() => {
		console.log(41, selectedTab, option);
		setDataState({
			...dataState,
			isLoading: true,
		});
		sendRequest(`meets/users/list?as=${selectedTab}`, "get")
			.then((res) => {
				console.log(42, res, res.list);
				if (!(res?.list?.past || res?.list?.scheduled)) {
					throw new Error("Unable to fetch data.");
				}
				setDataState({
					...dataState,
					isError: false,
					isLoading: false,
					data: res.list,
				});
			})
			.catch(() => {
				ToastCtx.setMsg(
					"Something went wrong, please try again later.",
				);
				setDataState({
					...dataState,
					data: [],
					isLoading: false,
					isError: true,
				});
			});
	}, [selectedTab]);

	const getLocation = (mediumID, place) => (
		<a
			target={mediumID === 2 ? "_blank" : ""}
			rel="noreferrer"
			href={mediumID === 1 ? `tel:${place}` : place}
			style={{ color: "#444" }}
			onClick={(e) => {
				e.stopPropagation();
			}}
		>
			<Icon
				icon={
					mediumID === 1
						? "ic:baseline-phone"
						: "logos:google-calendar"
				}
				fontSize="1.7rem"
				style={{ color: mediumID === 2 ? "inherit" : "#444" }}
			/>
		</a>
	);

	return (
		<>
			<div className="scheduledEvents-mainOuter">
				<div className="sevents-left">
					<Sidebar />
				</div>
				<div className="sevents-rest">
					<div className="sevents-header">
						<Text
							txt={"Scheduled Meets"}
							txtsize={"h5"}
							style={{
								alignSelf: "center",
							}}
						/>
						<div className="orgAttenToggle">
							<Button
								className={`asOrgT ${selectedTab === "host" ? "selected" : ""}`}
								onClick={() => handleTabClick("host")}
								style={{
									textTransform: "none",
									color:
										selectedTab === "host"
											? "white"
											: "#444",
									borderRadius: "5px 0 0 5px",
								}}
							>
								As Host
							</Button>
							<Button
								className={`asAttenT ${selectedTab === "attendee" ? "selected" : ""}`}
								onClick={() => handleTabClick("attendee")}
								style={{
									textTransform: "none",
									color:
										selectedTab === "attendee"
											? "white"
											: "#444",
									borderRadius: "0 5px 5px 0",
								}}
							>
								As Attendee
							</Button>
						</div>
					</div>
					<hr color={LightPurple} style={{ margin: "1rem 0" }} />

					{dataState.isLoading ? (
						<div
							className="scheudled-box"
							style={{
								display: "flex",
								flexDirection: "column",
								rowGap: "10px",
								background: "transparent",
							}}
						>
							<Skeleton
								variant="rectangular"
								style={{
									borderRadius: "5px",
								}}
								width={"100%"}
								height={60}
							/>
							<Skeleton
								variant="rectangular"
								style={{
									borderRadius: "5px",
								}}
								width={"100%"}
								height={120}
							/>
						</div>
					) : (
						<div className="scheudled-box">
							<div className="sbox-first-row">
								<div className="sbox-first-row-left">
									<div
										className={`sbox-fr-upcoming ${option === "scheduled" ? "selectedoption" : "notselectedoption"}`}
										onClick={() =>
											handleOption("scheduled")
										}
									>
										<Text
											txt={`Upcoming (${dataState?.data?.scheduled?.length ?? 0})`}
											txtsize={"subtitle1"}
											fontWeight={"bold"}
										/>
									</div>
									<div
										className={`sbox-fr-past ${option === "past" ? "selectedoption" : "notselectedoption"}`}
										onClick={() => handleOption("past")}
									>
										<Text
											txt={`Past (${dataState?.data?.past?.length ?? 0})`}
											txtsize={"subtitle1"}
											fontWeight={"bold"}
										/>
									</div>
								</div>
								{/* <div className="sbox-first-row-right"></div> */}
							</div>
							<div className="sbox-second-row">
								<ScheduledMeetHeader
									dateTime={"Date & Time"}
									name={"Name"}
									ename={"Meeting Title"}
									mode={" "}
									cursorAction={"disabled"}
								/>
							</div>
							<div className="sbox-rest-rows">
								{!dataState.isLoading && !dataState.isError ? (
									dataState.data[option].length ? (
										dataState.data[option].map((meet) => (
											<ScheduledMeet
												key={meet?.meetID}
												dateTime={`${getFormattedDateTime(new Date(`${meet?.schedule?.date}, ${meet?.schedule?.time}`))}`}
												name={`${meet?.invitee?.firstName} ${meet?.invitee?.lastName}`}
												email={`${meet?.invitee?.email}`}
												ename={`${meet?.meetTitle}`}
												mode={getLocation(
													meet?.schedule?.mediumID,
													meet?.schedule?.place,
												)}
												mediumID={
													meet?.schedule?.mediumID
												}
												place={meet?.schedule?.place}
												avatar={
													<Avatar
														{...stringAvatar(
															`${meet?.invitee?.firstName} ${meet?.invitee?.lastName}`,
														)}
													/>
												}
											/>
										))
									) : (
										<div
											style={{
												width: "100%",
												display: "flex",
												justifyContent: "center",
											}}
										>
											<Text
												txt={"No meets found."}
												txtsize={"subtitle1"}
												style={{
													padding: "20px",
													color: "#888",
													fontStyle: "italic",
													fontSize: "14px",
												}}
											/>
										</div>
									)
								) : (
									<div
										style={{
											width: "100%",
											display: "flex",
											justifyContent: "center",
										}}
									>
										<Text
											txt={"No meets found."}
											txtsize={"subtitle1"}
											style={{
												padding: "20px",
												color: "#888",
												fontStyle: "italic",
												fontSize: "14px",
											}}
										/>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default ScheduledEvents;
