import React, { useState } from "react";
import "./availability.scss";
import Sidebar from "../../components/sections/Sidebar/Sidebar";
import Text from "../../components/components/Text";
import { LightBlue, LightPurple } from "../../components/components/Color";
// import { SlCalender } from "react-icons/sl";
// import { FaAngleLeft } from "react-icons/fa6";
// import { FaAngleRight } from "react-icons/fa6";
import Weeklyhours from "../../components/sections/WeeklyHours/Weeklyhours";
import DateSpecificHours from "../../components/sections/DateSpecificHours/DateSpecificHours";
import { ToastContext } from "../../context/Toast";
import { sendRequest } from "../../util";
import { Link } from "react-router-dom";

function Availability() {
	const ToastCtx = React.useContext(ToastContext);
	const [timezone, setTimezone] = useState("");

	const [slotsState, setSlotsState] = React.useState({
		sun: {
			isEnabled: false,
			data: [],
		},
		mon: {
			isEnabled: false,
			data: [],
		},
		tue: {
			isEnabled: false,
			data: [],
		},
		wed: {
			isEnabled: false,
			data: [],
		},
		thu: {
			isEnabled: false,
			data: [],
		},
		fri: {
			isEnabled: false,
			data: [],
		},
		sat: {
			isEnabled: false,
			data: [],
		},
		dates: [],
	});

	const originalData = React.useRef();

	const getState = (obj) => ({
		sun: {
			isEnabled: obj.sun.length > 0,
			data: obj.sun,
		},
		mon: {
			isEnabled: obj.mon.length > 0,
			data: obj.mon,
		},
		tue: {
			isEnabled: obj.tue.length > 0,
			data: obj.tue,
		},
		wed: {
			isEnabled: obj.wed.length > 0,
			data: obj.wed,
		},
		thu: {
			isEnabled: obj.thu.length > 0,
			data: obj.thu,
		},
		fri: {
			isEnabled: obj.fri.length > 0,
			data: obj.fri,
		},
		sat: {
			isEnabled: obj.sat.length > 0,
			data: obj.sat,
		},
		dates: obj.dates,
	});

	const [needToRequestAgain, setNeedToRequestAgain] = React.useState(false);

	React.useEffect(() => {
		sendRequest("/availability", "get")
			.then((res) => {
				setNeedToRequestAgain(false);
				console.log(192, res);
				if (!res.availability) {
					throw new Error("No availability data found.");
				}
				originalData.current = res.availability;
				setSlotsState(getState(res.availability));
			})
			.catch((err) => {
				console.log(218, err);
				ToastCtx.setMsg(
					"Failed to fetch availability. Try again later.",
				);
			});
	}, [needToRequestAgain]);

	React.useMemo(() => {
		const user = JSON.parse(localStorage.getItem("user") || `{}`);
		if (!user.timezone) {
			sendRequest('/users/my-profile', 'get').then(res => {
				if (res?.timezone) {
					setTimezone(res.timezone);
				}
			});
		} else setTimezone(user.timezone);
	}, []);

	const resetData = () => {
		setSlotsState(getState(originalData.current));
	};

	return (
		<>
			<div className="outer-availability">
				<div className="availability-left">
					<Sidebar />
				</div>
				<div className="availability-rest">
					<Text
						txt={"Availability"}
						color={"#1F8B8B"}
						txtsize={"h5"}
						fontWeight={"bold"}
					/>
					<hr color={LightPurple} style={{ margin: "1rem 0" }} />
					<div className="availability-upper-box">
						<div className="availability-upper-box-fr">
							<div className="availability-upper-box-fr-left">
								<Text
									txt={"Timezone"}
									style={{
										fontSize: "14px",
										color: "#888",
									}}
								/>
								<Text
									txt={timezone}
									style={{
										marginTop: "6px",
										fontSize: "18px",
									}}
								/>
								<Link to='/profile' style={{
									marginTop: "6px",
									textDecoration: 'none',
									position: 'absolute',
								}}><Text txt='Change' txtsize='caption' color={LightBlue} /></Link>
							</div>
						</div>
					</div>

					<div className="avaiability-below-box">
						<div className="avaiability-below-box-list-view">
							<Weeklyhours
								slots={slotsState}
								setSlots={setSlotsState}
								data-testid="weekly-hours-component"
							/>
							<DateSpecificHours
								originalSlots={originalData.current}
								resetData={resetData}
								slots={slotsState}
								setSlots={setSlotsState}
								setNeedToRequestAgain={setNeedToRequestAgain}
								data-testid="date-specific-hours-component"
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Availability;
