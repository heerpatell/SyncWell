import React from "react";
import Text from "../../components/Text";
import { Avatar } from "@mui/material";
import Stack from "@mui/material/Stack";
import { stringAvatar } from "../../../util";
import { LightGray } from "../../components/Color";

function NameWithAvatar({ txt, color, txtsize, email }) {
	return (
		<Stack
			direction="row"
			spacing={2}
			alignItems="center"
			style={{ padding: "15px", backgroundColor: "#FFFFFF" }}
		>
			<Avatar { ...stringAvatar(txt) } />
			<div style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				// alignItems: "center",
				// rowGap: '5px'
			}}>
				<Text txt={txt} txtsize={txtsize} color={color} />
				{
					email ? <Text txt={email} txtsize={'caption'} color={LightGray} /> : null
				}
			</div>
		</Stack>
	);
}

export default NameWithAvatar;
