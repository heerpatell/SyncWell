import React from "react";
import "./dashboard.scss";
import Sidebar from "../../components/sections/Sidebar/Sidebar";
import Text from "../../components/components/Text";
// import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TxtDayTimeSchedule from "../../components/layouts/TxtDayTimeSchedule/TxtDayTimeSchedule";
import {
	DarkGray,
	GreenDark,
	LightBlue,
	LightGray,
	LightPurple,
	ShadyBlack,
	// LightGray02,
	// LightGray03,
	// LightGray04,
	// LightGray05,
} from "../../components/components/Color";
import {
	convert24hrTo12hr,
	getFormattedDateTime,
	getFieldFromHostOrInvitee,
	sendRequest,
	stringAvatar,
} from "../../util";
import { Avatar, Skeleton } from "@mui/material";
import { ScheduledMeetContent } from "../../components/layouts/ScheduledMeet/ScheduledMeetContent";
import { Link } from "react-router-dom";
// import { Link } from "react-router-dom";

function Dashboard() {
	const [dataState, setDataState] = React.useState({
		isLoading: false,
		isError: false,
		data: [],
	});
	React.useEffect(() => {
		setDataState({
			...dataState,
			isLoading: true,
		});
		sendRequest("/meets/users/list?as=both&limit=3", "get")
			.then((res) => {
				if (res?.list?.scheduled) {
					setDataState({
						...dataState,
						isLoading: false,
						isError: false,
						data: res.list.scheduled,
					});
				}
			})
			.catch(() => {
				setDataState({
					...dataState,
					isLoading: false,
					isError: true,
					data: [],
				});
			});
	}, []);

	const getFormattedDate = (date) => {
		const d = new Date(date + "T00:00:00");
		const currDate = new Date();
		const tmrwDate = new Date();
		tmrwDate.setDate(tmrwDate.getDate() + 1);
		if (d.toDateString() === currDate.toDateString()) {
			return "Today";
		} else if (tmrwDate.toDateString() === d.toDateString()) {
			return "Tomorrow";
		}
		return d.toDateString().split(" ").slice(1, -1).join(" ");
	};

	const [meetInfoState, setMeetInfoState] = React.useState({
		data: {},
		open: false,
	});

	const closeMeetInfo = () =>
		setMeetInfoState({
			...meetInfoState,
			open: false,
		});

	const openMeetInfo = (item) => {
		setMeetInfoState({
			...meetInfoState,
			data: item,
			open: true,
		});
	};

	return (
		<>
			<div className="mainouterdash">
				<div className="dash-left">
					<Sidebar />
				</div>

				<div className="dash-middle">
					<div className="dashboard-header">
						<Text
							txt={"Dashboard"}
							color={GreenDark}
							txtsize={"h5"}
						/>
						<hr color={LightPurple} style={{ margin: "1rem 0" }} />
					</div>
					<div className="dash-middle-content">
						<div className="dash-middle-content-firstRow">
							<div style={{
								padding: '20px'
							}}>
								<Text txt='Peak Hours Per Day' style={{
									fontSize: '18px',
									fontWeight: 'bold',
									color: '#222'
								}} />
								<div style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
									marginTop: '40px'
								}}>
									<Text txt="You have not scheduled enough meetings yet so that we can analyze data for you." style={{
										color: LightGray,
										fontSize: '14px',
										marginTop: '20px',
										width: '400px',
										textAlign: 'center'
									}} />
								</div>
							</div>
						</div>
						<div className="dash-middle-content-secondRow">
							<div className="dash-middle-content-secondRow-div">
								<div style={{
									padding: '20px'
								}}>
									<Text txt='Ratio of cancelled meetings' style={{
										fontSize: '18px',
										fontWeight: 'bold',
										color: '#222'
									}} />
									<div style={{
										width: '100%',
										display: 'flex',
										justifyContent: 'center',
										marginTop: '60px'
									}}>
										<Text txt="You have not scheduled enough meetings yet so that we can analyze data for you." style={{
											color: LightGray,
											fontSize: '14px',
											marginTop: '20px',
											width: '400px',
											textAlign: 'center'
										}} />
									</div>
								</div>
							</div>
							<div className="dash-middle-content-secondRow-div">
								<div style={{
									padding: '20px'
								}}>
									<Text txt='Average Meeting Hours' style={{
										fontSize: '18px',
										fontWeight: 'bold',
										color: '#222'
									}} />
									<div style={{
										width: '100%',
										display: 'flex',
										justifyContent: 'center',
										marginTop: '60px'
									}}>
										<Text txt="You have not scheduled enough meetings yet so that we can analyze data for you." style={{
											color: LightGray,
											fontSize: '14px',
											marginTop: '20px',
											width: '400px',
											textAlign: 'center'
										}} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="dash-right">
					<div className="dash-schedules">
						<div className="dash-schedules-header">
							<Text
								txt={"Schedule"}
								color={DarkGray}
								txtsize={"h5"}
								fontWeight="bold"
							/>
						</div>
						<div className="dash-schedules-schedulelist">
							{dataState.isLoading ? (
								<>
									<Skeleton
										variant="rectangular"
										style={{ borderRadius: "5px" }}
										width={"100%"}
										height={54}
									/>
									<Skeleton
										variant="rectangular"
										style={{ borderRadius: "5px" }}
										width={"100%"}
										height={54}
									/>
									<Skeleton
										variant="rectangular"
										style={{ borderRadius: "5px" }}
										width={"100%"}
										height={54}
									/>
								</>
							) : dataState.isError ? (
								<Text
									txt="Oops! Unable to find records."
									color="red"
								/>
							) : !dataState.data.length ? (
								<Text
									txt="No scheduled meets found."
									color={LightGray}
								/>
							) : (
								dataState.data.map((item) => (
									<div
										key={item.meetID}
										onClick={() => openMeetInfo(item)}
										style={{
											cursor: "pointer",
										}}
										className="list-item"
									>
										<TxtDayTimeSchedule
											day={getFormattedDate(
												item.schedule.date,
											)}
											time={convert24hrTo12hr(
												item.schedule.time,
											)}
											name={getFieldFromHostOrInvitee(
												item,
												"name",
											)}
											txtsize={"body2"}
											colorheading={ShadyBlack}
											colorsubhead={LightGray}
											avatar={
												<Avatar
													{...stringAvatar(
														getFieldFromHostOrInvitee(
															item,
															"name",
														),
													)}
												/>
											}
										/>
									</div>
								))
							)}
						</div>
						<div style={{ marginTop: "1rem" }}>
							<Link
								to="/scheduled-events"
								style={{
									textDecoration: "none",
								}}
							>
								<Text
									txt={"View all"}
									color={LightBlue}
									txtsize={"caption"}
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>
			{meetInfoState.open && (
				<ScheduledMeetContent
					open={meetInfoState.open}
					onClose={closeMeetInfo}
					dateTime={getFormattedDateTime(
						new Date(
							`${meetInfoState.data.schedule.date}, ${meetInfoState.data.schedule.time}`,
						),
					)}
					ename={meetInfoState.data.meetTitle}
					name={getFieldFromHostOrInvitee(meetInfoState.data, "name")}
					avatar={
						<Avatar
							{...stringAvatar(
								getFieldFromHostOrInvitee(
									meetInfoState.data,
									"name",
								),
							)}
						/>
					}
					email={getFieldFromHostOrInvitee(
						meetInfoState.data,
						"email",
					)}
					// mode={getLocation(
					// 	meet?.schedule?.mediumID,
					// 	meet?.schedule?.place,
					// )}
					mediumID={meetInfoState.data.schedule.mediumID}
					place={meetInfoState.data.schedule.place}
				/>
			)}
		</>
	);
}

export default Dashboard;
