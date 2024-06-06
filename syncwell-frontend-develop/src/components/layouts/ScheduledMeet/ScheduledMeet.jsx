import React, { useState } from "react";
import "./scheduledmeet.scss";
import Text from "../../components/Text";
import { LightPurple } from "../../components/Color";
import { ScheduledMeetContent } from "./ScheduledMeetContent";

function ScheduledMeet({
	name,
	email,
	ename,
	dateTime,
	mode,
	avatar,
	cursorAction,
	mediumID,
	place,
}) {
	const [openDialog, setOpenDialog] = useState(false);

	const handleOpenDialog = () => {
		setOpenDialog(true);
	};
	const handleCloseDialog = () => {
		setOpenDialog(false);
	};

	const containerClassName =
		cursorAction === "disabled" ? "outerMeetDisabled" : "outerMeet";
	return (
		<>
			<div className={containerClassName} onClick={handleOpenDialog}>
				<div className="innerMeet-fc">
					<Text txt={dateTime} />
				</div>
				<div className="innerMeet-sc">
					<div>{avatar}</div>
					<div>
						<Text txt={name} />
						<a
							href={`mailto:${email}`}
							style={{
								color: "#888",
								textDecorationStyle: "dashed",
								textUnderlinePosition: "under",
							}}
						>
							<Text txt={email} txtsize="caption" />
						</a>
					</div>
				</div>
				<div className="innerMeet-tc">
					<Text txt={ename} />
				</div>
				<div className="innerMeet-fc">{mode}</div>
			</div>
			<hr color={LightPurple} />
			<ScheduledMeetContent
				open={openDialog}
				onClose={handleCloseDialog}
				dateTime={dateTime}
				ename={ename}
				name={name}
				avatar={avatar}
				email={email}
				mode={mode}
				mediumID={mediumID}
				place={place}
			/>
		</>
	);
}

export default ScheduledMeet;
