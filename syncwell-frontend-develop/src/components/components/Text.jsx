import React from "react";
import Typography from "@mui/material/Typography";

function Text({ txt, color, txtsize, fontWeight, style }) {
	return (
		<Typography
			color={color}
			variant={txtsize}
			style={{ fontWeight, ...style }}
		>
			{txt}
		</Typography>
	);
}

export default Text;
