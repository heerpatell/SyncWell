import React from "react";
import Text from "../../components/Text";

function TimeBorder({ time, selected, onClick }) {
	return (
		<div
			style={{
				border: "2px solid #1F8B8B",
				width: "50%",
				padding: "0.4rem",
				textAlign: "center",
				borderRadius: "0.3rem",
				margin: "1rem 0",
				cursor: "pointer",
				backgroundColor: selected ? "#1F8B8B" : "transparent",
				color: selected ? "#FFFFFF" : "#1F8B8B",
			}}
			onClick={onClick}
		>
			<Text txt={time} txtsize={"body2"} />
		</div>
	);
}

export default TimeBorder;
