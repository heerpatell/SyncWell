import React from "react";
import "./weeklyhours.scss";
import Text from "../../components/Text";
import { Checkbox, IconButton, TextField } from "@mui/material";
import { Icon } from "@iconify/react";
import { ToastContext } from "../../../context/Toast";
import { sendRequest } from "../../../util";

function DayComponent({ dayName, slots, onChange, onAddBlock, onDeleteBlock }) {
	const [temp, setTemp] = React.useState({ startTime: "", endTime: "" });

	const handleChange = (field, value) => {
		setTemp({
			...temp,
			[field]: value,
		});
	};

	const addTime = (dayName, startTime, endTime) => {
		onAddBlock(dayName, startTime, endTime);
		setTemp({ startTime: "", endTime: "" });
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					margin: "1rem 0",
					justifyContent: "space-between",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						columnGap: "1.5rem",
						alignSelf: "baseline",
					}}
				>
					<div style={{ width: "10%" }}>
						<Checkbox
							sx={{
								"&.Mui-checked": {
									color: "#1F8B8B",
								},
							}}
							checked={slots.isEnabled}
							onChange={() => onChange(dayName, "checkbox")}
						/>
					</div>
					<div style={{ width: "15%", padding: "0 1rem" }}>
						<Text
							txt={dayName}
							style={{
								textTransform: "capitalize",
							}}
						/>
					</div>
				</div>
				{slots?.isEnabled ? (
					<div>
						{slots.data.map((slot, index) => (
							<div
								key={index}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "1rem",
									margin: "1rem 0",
								}}
							>
								<div
									style={{
										display: "flex",
										gap: "0.8rem",
										alignItems: "center",
									}}
								>
									<TextField
										label="From"
										value={slot.startTime}
										placeholder="00:00"
										disabled
										style={{ width: "6rem" }}
									/>
									-
									<TextField
										label="To"
										value={slot.endTime}
										placeholder="00:00"
										disabled
										style={{ width: "6rem" }}
									/>
								</div>
								<IconButton
									onClick={() =>
										onDeleteBlock(dayName, slot.id, index)
									}
								>
									<Icon
										icon="charm:cross"
										style={{
											fontSize: "26px",
											color: "#888",
										}}
									/>
								</IconButton>
							</div>
						))}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								margin: "1rem 0",
							}}
						>
							<div
								style={{
									display: "flex",
									gap: "0.8rem",
									alignItems: "center",
								}}
							>
								<TextField
									label="From"
									style={{ width: "6rem" }}
									value={temp.startTime}
									placeholder="00:00"
									onChange={(e) =>
										handleChange(
											"startTime",
											e.target.value,
										)
									}
								/>
								-
								<TextField
									label="To"
									style={{ width: "6rem" }}
									placeholder="00:00"
									value={temp.endTime}
									onChange={(e) =>
										handleChange("endTime", e.target.value)
									}
								/>
							</div>
							<IconButton
								onClick={() =>
									addTime(
										dayName,
										temp.startTime,
										temp.endTime,
									)
								}
							>
								<Icon
									icon="gravity-ui:check"
									style={{
										fontSize: "26px",
										color: "#888",
									}}
								/>
							</IconButton>
						</div>
					</div>
				) : (
					<div>
						<Text
							txt={"Unavailable"}
							style={{
								fontSize: "14px",
								color: "#888",
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

function Weeklyhours({ slots, setSlots }) {
	const ToastCtx = React.useContext(ToastContext);

	const handleAddBlock = (dayName, startTime, endTime) => {
		console.log(140, dayName, startTime, endTime);
		const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

		if (!startTime.match(timeRegex) || !endTime.match(timeRegex)) {
			ToastCtx.setMsg("Pls enter the time in HH:MM format.");
			return;
		}

		const startTimeDate = new Date();
		startTimeDate.setHours(startTime.split(":")[0]);
		startTimeDate.setMinutes(startTime.split(":")[1]);
		const endTimeDate = new Date();
		endTimeDate.setHours(endTime.split(":")[0]);
		endTimeDate.setMinutes(endTime.split(":")[1]);

		if (startTime >= endTime) {
			ToastCtx.setMsg("End time must be greater than start time.");
			return;
		}

		sendRequest(
			`/availability/${dayName.toString().toLowerCase()}`,
			"put",
			{
				startTime,
				endTime,
			},
		)
			.then((res) => {
				console.log(162, res);
				setSlots({
					...slots,
					[dayName]: {
						...slots[dayName],
						data: [...slots[dayName].data, res.schedule],
					},
				});
			})
			.catch((err) => {
				console.log(164, err);
				ToastCtx.setMsg(
					"Failed to update availability. Try again later.",
				);
			});
	};

	const handleDeleteBlock = (dayName, id, index) => {
		sendRequest(
			`/availability/${dayName.toString().toLowerCase()}/${id}`,
			"delete",
		)
			.then(() => {
				setSlots({
					...slots,
					[dayName]: {
						...slots[dayName],
						data: slots[dayName].data.filter((_, i) => i !== index),
					},
				});
			})
			.catch(() => {
				ToastCtx.setMsg(
					"Failed to delete availability. Try again later.",
				);
			});
	};

	const handleChange = (dayName, field, value = "") => {
		console.log(174, dayName, field, value);
		if (field === "checkbox") {
			new Promise((resolve, reject) => {
				if (slots[dayName].isEnabled) {
					Promise.all(
						slots[dayName].data.map(({ id }) =>
							sendRequest(
								`/availability/${dayName.toLowerCase()}/${id}`,
								"delete",
							).catch((err) => reject(err)),
						),
					).catch((err) => reject(err));
					resolve(false);
				}
				resolve(true);
			})
				.then((enabling) => {
					if (!enabling)
						ToastCtx.setMsg("Availability updated successfully.");
					setSlots({
						...slots,
						[dayName]: {
							...slots[dayName],
							isEnabled: enabling,
						},
					});
				})
				.catch(() => {
					ToastCtx.setMsg(
						"Failed to update availability. Try again later.",
					);
				});
			return;
		}
		setSlots({
			...slots,
			[dayName]: {
				...slots[dayName],
				data: [...slots[dayName].data, value],
			},
		});
	};

	return (
		<>
			<div
				className="weeklyhoursOuter"
				style={{
					height: "100%",
					maxHeight: "610px",
					overflowY: "scroll",
				}}
			>
				<div>
					<Text txt={"Weekly Hours"} fontWeight={"bold"} />
				</div>
				{Object.keys(slots)
					.filter((a) => a !== "dates")
					.map((day, index) => (
						<DayComponent
							key={index}
							dayName={day}
							slots={slots[day]}
							onChange={handleChange}
							onAddBlock={handleAddBlock}
							onDeleteBlock={handleDeleteBlock}
						/>
					))}
			</div>
		</>
	);
}

export default Weeklyhours;
