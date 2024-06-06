import React from "react";
import { IconButton, Snackbar } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function ToastMessage(props) {
	const { setOpenState, openState } = props;

	const handleToastClose = () => {
		setOpenState(false);
	};

	return (
		<Snackbar
			anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			open={openState}
			autoHideDuration={600000}
			onClose={handleToastClose}
			message={props.message}
			ContentProps={{
				style: {
					fontFamily: "inherit",
				},
			}}
			style={{
				fontFamily: "Montserrat",
			}}
			action={
				<React.Fragment>
					{props.action}
					<IconButton
						aria-label="close"
						color="inherit"
						onClick={handleToastClose}
					>
						<Close />
					</IconButton>
				</React.Fragment>
			}
		/>
	);
}
