import React from "react";
import Text from "../../components/Text";
import "./txtdaytimeschedule.scss";
import { LuDot } from "react-icons/lu";

function TxtDayTimeSchedule({
	name,
	day,
	time,
	avatar,
	txtsize,
	colorheading,
	colorsubhead,
}) {
	return (
		<div className="mainOuterTxtDayTimeSchedule">
			<div>{avatar}</div>
			<div className="outerContentForDayTimeSchedule">
				<div>
					<Text txt={name} txtsize={txtsize} color={colorheading} />
				</div>
				<div
					className="outerForDayTimeSchedule"
					style={{
						display: "flex",
						alignItems: "center",
					}}
				>
					<div>
						<Text
							txt={day}
							txtsize={txtsize}
							color={colorsubhead}
						/>
					</div>
					<LuDot
						style={{
							color: "#CCC",
						}}
					/>
					&nbsp;
					<div>
						<Text
							txt={time}
							txtsize={txtsize}
							color={colorsubhead}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TxtDayTimeSchedule;
