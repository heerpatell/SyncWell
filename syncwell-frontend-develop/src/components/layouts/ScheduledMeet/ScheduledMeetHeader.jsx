import React from "react";
import "./scheduledmeet.scss";
import Text from "../../components/Text";
// import { LightPurple } from "../../components/Color";

function ScheduledMeetHeader() {
	// const containerClassName =
	// 	cursorAction === "disabled" ? "outerMeetDisabled" : "outerMeet";
	return (
		<div
			className={"outerMeet"}
			style={{
				pointerEvents: "none",
			}}
		>
			<Text className="innerMeet-fc" txt={"Date & Time"} />
			<Text className="innerMeet-sc" txt={"Name"} />
			<Text className="innerMeet-tc" txt={"Meeting Title"} />
			<Text className="innerMeet-fc" txt={""} />
		</div>
	);
}

export default ScheduledMeetHeader;
