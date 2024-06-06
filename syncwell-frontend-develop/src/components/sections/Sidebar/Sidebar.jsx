import React, { useEffect, useMemo, useState } from "react";
import "./sidebar.scss";
import { Icon as Iconify } from "@iconify/react";
import { ReactComponent as Logosvg } from "../../../images/logo.svg";
import LogoWithText from "../../layouts/LogoWtext/LogoWithText";
import { ReactComponent as dashboardImg } from "../../../images/dashboard.svg";
import { ReactComponent as availabilityImg } from "../../../images/availability.svg";
import { ReactComponent as scheduledEventImg } from "../../../images/scheduled_events.svg";
import { useNavigate } from "react-router";
import NameWithAvatar from "../../layouts/NameWithAvatar/NameWithAvatar";
import Text from "../../components/Text";
import { MdAdd } from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import { IoInformationCircleOutline } from "react-icons/io5";
import LocationListing from "../../layouts/LocationListing/LocationListing";
import { Link } from "react-router-dom";
import { sendRequest } from "../../../util";
import { ToastContext } from "../../../context/Toast";
import { Icon, IconButton } from "@mui/material";
import { RiLoader4Line } from "react-icons/ri";

const predefinedSet = [
	{
		id: 2,
		name: "Google Meet",
		icon: <Iconify icon="logos:google-meet" fontSize={22} />,
	},
	{
		id: 1,
		name: "Phone Call",
		icon: <Iconify icon="material-symbols:call-sharp" fontSize={26} />,
	},
];

function ScheduleMeetDialog({ open, onClose, isGoogleIntegrated }) {
	const [title, setTitle] = useState("");
	const [duration, setDuration] = useState("");
	const [description, setDescription] = useState("");
	const [email, setEmail] = useState("");
	const [selectedItems, setSelectedItems] = useState([]);
	const [openDialog, setOpenDialog] = useState(false);
	const [isLoading, isLoadingState] = useState(false);

	const [ isAavailabilitySet, setIsAvailabilitySet ] = useState(false);

	const toggleLoadingState = (value) => isLoadingState(value);

	const handleAddItem = (item) => {
		if (item.id === 2 && !isGoogleIntegrated) return;
		if (!selectedItems.includes(item)) {
			setSelectedItems([...selectedItems, item]);
		}
	};

	const handleTitleChange = (event) => {
		setTitle(event.target.value);
	};

	const handleDurationChange = (event) => {
		setDuration(event.target.value);
	};

	const handleDescriptionChange = (event) => {
		setDescription(event.target.value);
	};

	const handleEmailChange = (event) => {
		setEmail(event.target.value);
	};
	const handleCloseDialog = () => {
		setOpenDialog(false);
	};

	const ToastCtx = React.useContext(ToastContext);

	const handleSubmit = async () => {
		console.log("Title:", title);
		console.log("Duration:", duration);
		console.log("Description:", description);
		console.log("Email:", email);
		console.log(process.env);

		if (
			!title ||
			!duration ||
			!description ||
			!email ||
			!Array.isArray(selectedItems) ||
			(Array.isArray(selectedItems) && !selectedItems.length)
		) {
			ToastCtx.setMsg(
				"All the fields are required to schedule a meeting.",
			);
			return;
		}

		toggleLoadingState(true);

		const resp = await sendRequest("meets/new", "post", {
			inviteeEmail: email,
			meetTitle: title,
			durationInMin: duration,
			meetDesc: description,
			mediums: selectedItems.map((a) => a.id),
		});

		toggleLoadingState(false);
		if (resp.meetID) {
			ToastCtx.setMsg("Meeting invitation sent to the invitee.");
			onClose();
		} else
			ToastCtx.setMsg("Something went wrong while creating a meeting.");
	};

	const handleDeleteItem = (itemName) => {
		const updatedItems = selectedItems.filter(
			(selectedItem) => selectedItem.name !== itemName,
		);
		setSelectedItems(updatedItems);
	};

	const handleAddNewLocation = () => {
		setOpenDialog(true);
	};

	useEffect(() => {
		sendRequest('availability/isSet', 'get').then(res => {
			if (res.isSet === undefined) return;
			setIsAvailabilitySet(res.isSet);
		});
	}, []);

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				<Text txt={"Schedule a Meet"} txtsize="h6" />
			</DialogTitle>
			<DialogContent>
				<TextField
					fullWidth
					label="Title"
					type="search"
					value={title}
					variant="standard"
					onChange={handleTitleChange}
				/>
				<FormControl variant="standard" sx={{ mt: 3, minWidth: 120 }}>
					<InputLabel id="demo-simple-select-standard-label">
						Duration
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={duration}
						onChange={handleDurationChange}
						label="Age"
					>
						<MenuItem value="">
							<em>None</em>
						</MenuItem>
						<MenuItem value={15}>15 min</MenuItem>
						<MenuItem value={30}>30 min</MenuItem>
						<MenuItem value={45}>45 min</MenuItem>
						<MenuItem value={60}>60 min</MenuItem>
					</Select>
				</FormControl>
				<TextField
					sx={{ mt: 4 }}
					fullWidth
					label="Description"
					value={description}
					onChange={handleDescriptionChange}
					margin="normal"
					multiline
					rows={4}
				/>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginTop: "1rem",
					}}
				>
					<Text txt={"Location"} />
					&nbsp;
					<IoInformationCircleOutline />
				</div>

				<Divider style={{ margin: "16px 0" }} />

				<div>
					<div>
						<Button onClick={handleAddNewLocation}>
							Add a new location option
						</Button>
						<Dialog open={openDialog} onClose={handleCloseDialog}>
							<DialogTitle data-testid="add-location-button">
								Select a location option
							</DialogTitle>
							<DialogContent style={{
								padding: 0
							}}>
								{predefinedSet.map((item, index) => (
									<Button
										key={`location-list-${index}`}
										onClick={() => handleAddItem(item)}
										style={{
											textTransform: "none",
											display: "flex",
											flexDirection: "column",
											rowGap: "10px",
											alignItems: "flex-start",
											color: "#444",
											width: "100%",
											padding: '10px 30px'
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												columnGap: "14px",
											}}
										>
											{item.icon}
											{item.name}
										</div>
										{item.id === 2 && !isGoogleIntegrated ? (
											<Text
												txt={
													"Please integrate Google Calendar to use this feature."
												}
												txtsize={"caption"}
												style={{
													background: "#cde6ff",
													borderRadius: "5px",
													padding: "5px 10px",
												}}
											/>
										) : (
											""
										)}
									</Button>
								))}
							</DialogContent>
							<DialogActions
								sx={{
									padding: "20px !important",
								}}
							>
								<Button onClick={handleCloseDialog}>
									Cancel
								</Button>
							</DialogActions>
						</Dialog>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						rowGap: "10px",
						padding: "5px",
					}}
				>
					{selectedItems.map((item, index) => (
						<LocationListing
							key={index}
							loc={item.name}
							icon={item.icon}
							onDelete={(itemName) => handleDeleteItem(itemName)}
						/>
					))}
				</div>
				<TextField
					fullWidth
					label="Invitee's Email Address"
					value={email}
					variant="standard"
					onChange={handleEmailChange}
					sx={{ mt: 2 }}
				/>
				{
					!isAavailabilitySet ? <Text style={{
						fontSize: '14px',
						padding: '10px',
						background: '#cde6ff',
						borderRadius: '5px',
						marginTop: '20px',
						color: '#444'
					}} txt={'Availability is not set. Please consider setting it first for your invitee.'} /> : null
				}
			</DialogContent>
			<DialogActions
				sx={{
					padding: "20px !important",
					// display: 'flex',
					// alignItems: 'center',
					// justifyContent: 'space-between'
				}}
			>
				<Button
					onClick={handleSubmit}
					color="primary"
					disabled={isLoading}
					variant="contained"
					style={{
						display: "flex",
						alignItems: "center",
						columnGap: "5px",
					}}
				>
					{isLoading ? (
						<>
							<Icon
								style={{ display: "flex" }}
								className="loading-animation"
							>
								<RiLoader4Line />
							</Icon>
							Scheduling...
						</>
					) : (
						"Schedule"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function Sidebar() {
	const navigate = useNavigate();
	const [openDialog, setOpenDialog] = useState(false);

	const [userInfo, setUserInfo] = useState({
		userID: "",
		firstName: "",
		lastName: "",
		email: "",
		country: "",
		timezone: "",
	});

	const handleOpenDialog = () => {
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
	};

	const loginWithGoogle = async () => {
		if (isGoogleIntegrated) return;
		await sendRequest("auth/google", "post").then((resp) => {
			if (!resp.url) {
				console.log("Unable to authorize");
				return;
			}
			window.open(resp.url, "oauthWindow", "width=600,height=800");

			window.addEventListener("message", (event) => {
				console.log(307, event.data);
				if (
					event.origin !== window.location.origin ||
					event?.data?.type !== "child-callback"
				)
					return;
				sendRequest("auth/google/validate", "post", {
					code: event?.data?.payload?.code,
					state: event?.data?.payload?.state,
				}).then((resp) => {
					if (resp.isValidated) {
						setIsGoogleIntegrated(true);
					}
				});
			});
		});
	};

	const [isGoogleIntegrated, setIsGoogleIntegrated] = useState(false);

	const revokeAccess = () => {
		sendRequest("auth/google/revoke", "post").then((resp) => {
			if (resp.isRevoked) {
				setIsGoogleIntegrated(false);
			}
		});
	};

	const logout =() => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login");
	}

	useMemo(() => {
		const user = localStorage.getItem('user');
		if (user) {
			setUserInfo(JSON.parse(user));
			return;
		}
		sendRequest('/users/my-profile', 'get').then(res => {
			if (res?.userID) {
				setUserInfo(res);
				localStorage.setItem('user', JSON.stringify(res));
			}
		});
	}, []);

	useEffect(() => {
		sendRequest("auth/google/isIntegrated", "get").then((resp) => {
			if (resp.isIntegrated) {
				setIsGoogleIntegrated(true);
			}
		});
	}, []);

	return (
		<>
			<div className="mainoutersidebar">
				<div className="section1">
					<LogoWithText
						txt="SyncWell"
						txtsize={"h6"}
						logo={Logosvg}
						imgsize={40}
						fontWeight="bold"
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenDialog}
						startIcon={<MdAdd color='#f1f1fb' size='20' />}
						className="scheduleameetBtn"
					>
						Schedule a Meet
					</Button>
					{/* <div
						className="scheduleameetBtn"
						onClick={handleOpenDialog}
					>
						<MdAdd color="#f1f1fb" size="20" />
						&nbsp;
						<Text txt={""} color={"#f1f1fb"} />
					</div> */}
					<ScheduleMeetDialog
						open={openDialog}
						onClose={handleCloseDialog}
						isGoogleIntegrated={isGoogleIntegrated}
					/>
				</div>
				<div className="section2">
					<Link to="/dashboard" style={{ textDecoration: "none" }}>
						<LogoWithText
							txt="Dashboard"
							txtsize={"body1"}
							logo={dashboardImg}
							imgsize={20}
							fontWeight="bold"
						/>
					</Link>
					<Link to="/availability" style={{ textDecoration: "none" }}>
						<LogoWithText
							txt="Availability"
							txtsize={"body1"}
							logo={availabilityImg}
							imgsize={20}
							fontWeight="bold"
						/>
					</Link>
					<Link
						to="/scheduled-events"
						style={{ textDecoration: "none" }}
					>
						<LogoWithText
							txt="Scheduled Events"
							txtsize={"body1"}
							logo={scheduledEventImg}
							imgsize={20}
							fontWeight="bold"
						/>
					</Link>
					{/* <Link to="/analysis" style={{ textDecoration: "none" }}>
						<LogoWithText
							txt="Analysis"
							txtsize={"body1"}
							logo={analysisImg}
							imgsize={20}
							fontWeight="bold"
						/>
					</Link> */}
				</div>
				<div className="section3">
					<div className="sidebar-avatar-name">
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								marginBottom: "20px",
								alignItems: "flex-start",
							}}
						>
							<Button
								onClick={() => loginWithGoogle()}
								style={{
									display: "flex",
									alignItems: "center",
									width: "100%",
									justifyContent: "space-between",
									padding: "20px",
									background: '#1F8B8B0a'
								}}
							>
								<div
									style={{
										display: "flex",
										columnGap: "10px",
										alignItems: "center",
									}}
								>
									<Iconify
										icon="logos:google-calendar"
										width={26}
									/>
									Calendar
								</div>
								<div
									style={{
										display: "flex",
										columnGap: "15px",
										alignItems: "center",
									}}
								>
									{!isGoogleIntegrated ? (
										<Iconify
											icon="ic:round-add"
											width={26}
										/>
									) : (
										<Iconify
											icon="ph:seal-check-fill"
											width={26}
											style={{
												color: "#4db051",
											}}
										/>
									)}
								</div>
							</Button>
							{isGoogleIntegrated ? (
								<Button onClick={revokeAccess}>
									<Text
										txt="Click to revoke access"
										txtsize="body"
										style={{
											fontSize: "12px",
											textTransform: "none",
											color: "#AAA",
										}}
									/>
								</Button>
							) : (
								""
							)}
						</div>
						<NameWithAvatar txt={ userInfo.firstName + ' ' + userInfo.lastName } email={userInfo.email || ''} txtsize={"body1"} />
						<div className="settingHelpLogoutOuter">
							<Button
								variant='text'
								color='secondary'
								style={{
									textTransform: 'none',
									fontSize: '14px'
								}}
								onClick={() => navigate('/profile')}
								startIcon={
									<Iconify
										icon="ic:baseline-settings"
										fontSize={24}
									/>
								}
							>
								Profile
							</Button>
							<IconButton color='secondary' onClick={logout}>
								<Iconify
										icon="material-symbols:logout"
										fontSize={24}
									/>
							</IconButton>
							{/* <IconButton sx={{
								background: 'white',
								borderRadius: '10px'
							}}>
								<Iconify icon='ic:baseline-settings' fontSize={24} />
							</IconButton>
							<IconButton sx={{
								background: 'white',
								borderRadius: '10px'
							}}>
								<Iconify icon='material-symbols:logout' fontSize={24} />
							</IconButton> */}
							{/* <SettingImg className="settingHelpLogoutIcon" />
							<HelpImg className="settingHelpLogoutIcon" />
							<LogoutImg className="settingHelpLogoutIcon" /> */}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Sidebar;
export { ScheduleMeetDialog };
