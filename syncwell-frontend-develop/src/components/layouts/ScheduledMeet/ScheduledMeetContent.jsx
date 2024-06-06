import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import { CiCalendarDate } from "react-icons/ci";
import { MdAlternateEmail } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";
import { ToastContext } from "../../../context/Toast";
import { Icon } from "@iconify/react";
import Text from "../../components/Text";

export function ScheduledMeetContent({
	open,
	onClose,
	ename,
	name,
	email,
	dateTime,
	avatar,
	mode,
	mediumID,
	place,
}) {
	// const [description, setDescription] = useState("");
	// const handleDescriptionChange = (event) => {
	// 	setDescription(event.target.value);
	// };

	const handleSubmit = () => {
		onClose();
	};

	const ToastCtx = React.useContext(ToastContext);

	function copyToClipboard(text, mediumID) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				ToastCtx.setMsg(
					`${mediumID === 1 ? "Phone number" : "Google Meet link"} is copied.`,
				);
			})
			.catch(() => {
				ToastCtx.setMsg("Unable to copy to clipboard.");
			});
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			className="outer-scheduledmeetcontent"
			maxWidth="md"
		>
			<DialogTitle>
				<Text txt={ename} fontWeight={"bold"} />
			</DialogTitle>
			<DialogContent
				style={{
					display: "flex",
					flexDirection: "column",
					rowGap: "24px",
				}}
			>
				<div
					className="dateandtime-txt"
					style={{
						marginTop: "20px",
					}}
				>
					<CiCalendarDate size={30} />
					<Text txt={dateTime} txtsize={"body1"} />
				</div>
				<div className="avatarname-txt">
					{avatar}
					<Text txt={name} txtsize={"body1"} />
				</div>
				<div className="email-txt">
					<MdAlternateEmail size={30} />
					<a
						href={`mailto:${email}`}
						style={{
							color: "#000",
							textDecorationStyle: "dashed",
							textUnderlinePosition: "under",
						}}
					>
						<Text txt={email} txtsize="body1" />
					</a>
				</div>

				{/* <TextField
					sx={{ mt: 4 }}
					fullWidth
					value={description}
					onChange={handleDescriptionChange}
					margin="normal"
					multiline
					rows={4}
					style={{
						backgroundColor: "#F1F1F1",
					}}
				/> */}
				<div className="callMedium">
					<div>{mode}</div>
					<Text
						txt={mediumID === "1" ? "Phone Call" : "Google Meet"}
						txtsize="subtitle1"
					/>
					<Icon
						icon="mdi:dot"
						style={{
							color: "#CCC",
						}}
					/>
					<a
						target={mediumID === 2 ? "_blank" : ""}
						rel="noreferrer"
						href={mediumID === 1 ? `tel:${place}` : place}
						style={{ color: "#444", textDecoration: "none" }}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<Text
							txt={mediumID === 1 ? "Call" : "Join"}
							txtsize={"body1"}
							color={"#1098D3"}
						/>
					</a>
					<Icon
						icon="mdi:dot"
						style={{
							color: "#CCC",
						}}
					/>
					<FaRegCopy
						onClick={() => copyToClipboard(place, mediumID)}
						style={{
							cursor: "pointer",
						}}
					/>
				</div>

				{/* <Divider style={{ margin: "16px 0" }} />
				<div className="edit-div" onClick={handleEditClick}>
					{showContent ? (
						<Text
							txt={"Hide"}
							txtsize={"body1"}
							color={"#1098D3"}
						/>
					) : (
						<Text
							txt={"Edit"}
							txtsize={"body1"}
							color={"#1098D3"}
						/>
					)}
				</div>

				{showContent && (
					<div>
						<div>
							<Text
								txt={"Request to postpone"}
								txtsize={"body1"}
								fontWeight={"bold"}
							/>
						</div>
						<div className="reqToPostpone">
							<div className="reqToPostpone-inp">
								<TextField
									value={providedEmail}
									onChange={handleProvidedEmail}
									id="outlined"
								/>
							</div>
							<div className="reqToPostpone-btn">
								<Text txt={"Send"} txtsize={"body1"} />
							</div>
						</div>
						<Divider style={{ margin: "16px 0" }} />
						<div className="cancel-Border">
							<Text txt={"Cancel Meeting"} color={"#E94235"} />
						</div>
					</div>
				)} */}
			</DialogContent>
			<DialogActions>
				<Button onClick={handleSubmit} color="primary">
					Done
				</Button>
			</DialogActions>
		</Dialog>
	);
}
