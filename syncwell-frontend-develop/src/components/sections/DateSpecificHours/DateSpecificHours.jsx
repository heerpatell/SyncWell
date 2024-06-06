import React from "react";
import "./datespecifichours.scss";
import Text from "../../components/Text";
import { Checkbox, Dialog, FormControlLabel, IconButton } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";
import { checkTimeFormat, sendRequest } from "../../../util";
import { ToastContext } from "../../../context/Toast";
import { PickersDay } from "@mui/x-date-pickers";

function DateTimeSection({ date, times, onDelete }) {
	console.log(25, times);
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "baseline",
				width: "100%",
			}}
		>
			<div style={{ marginBottom: "0.6rem" }}>
				<Text
					txt={dayjs(date).format("MMM D, YYYY")}
					style={{
						fontSize: "16px",
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-start",
					rowGap: "5px",
				}}
			>
				{times.map((time, index) => (
					<div
						key={`${date}-time-${index}`}
						style={{
							display: "flex",
							columnGap: "0.3rem",
							alignItems: "center",
						}}
					>
						{time.startTime === "00:00" ? (
							<Text
								txt={"Holiday"}
								txtsize={"body2"}
								style={{
									color: "#888",
								}}
							/>
						) : (
							<>
								<Text
									txt={time.startTime}
									txtsize={"body2"}
									style={{
										color: "#888",
									}}
								/>
								<Text
									txt={"-"}
									txtsize={"body2"}
									style={{
										color: "#888",
									}}
								/>
								<Text
									txt={time.endTime}
									txtsize={"body2"}
									style={{
										color: "#888",
									}}
								/>
							</>
						)}
					</div>
				))}
			</div>
			<IconButton onClick={() => onDelete(date)}>
				<Icon icon="charm:cross" />
			</IconButton>
		</div>
	);
}

function DateTimeSlot({ startTime, endTime, id, saveTime, deleteTime }) {
	const [temp, setTemp] = React.useState({
		startTime,
		endTime,
	});

	React.useMemo(() => {
		setTemp({
			startTime,
			endTime,
		});
	}, [startTime, endTime]);

	return (
		<div
			key={`dateTime-${id}`}
			style={{
				display: "flex",
				alignItems: "center",
				gap: "1rem",
				justifyContent: "center",
				padding: "10px 5px",
			}}
		>
			<TextField
				label="From"
				style={{ width: "6rem" }}
				value={temp.startTime}
				placeholder="00:00"
				onChange={(e) =>
					setTemp({ ...temp, startTime: e.target.value })
				}
				onBlur={() => saveTime(id, temp.startTime, temp.endTime)}
			/>
			-
			<TextField
				label="To"
				style={{ width: "6rem" }}
				placeholder="00:00"
				value={temp.endTime}
				onChange={(e) => setTemp({ ...temp, endTime: e.target.value })}
				onBlur={() => saveTime(id, temp.startTime, temp.endTime)}
			/>
			<IconButton onClick={() => deleteTime(id)}>
				<Icon
					icon="charm:cross"
					style={{
						fontSize: "26px",
						color: "#888",
					}}
				/>
			</IconButton>
		</div>
	);
}

function DateSpecificHours({
	originalSlots,
	slots,
	setSlots,
	resetData,
	setNeedToRequestAgain,
}) {
	const getSlotsForSelectedDate = (date, state) =>
		(state?.dates ?? []).filter(
			(item) => item.date === date.format("YYYY-MM-DD"),
		);

	const [date, setDate] = React.useState(dayjs());
	const [listTimeForDate, setListTimeForDate] = React.useState(
		getSlotsForSelectedDate(dayjs(), slots),
	);
	const [isHolidayState, setIsHolidayState] = React.useState(false);

	const isHolidayOnSelectedDate = (date) => slots.dates.filter(
		(a) =>
			a.date === date.format("YYYY-MM-DD") &&
			a.startTime === "00:00",
	).length != 0;


	const handleDateChange = (newDate) => {
		setDate(newDate);
		setListTimeForDate(getSlotsForSelectedDate(newDate, slots));
		setIsHolidayState(isHolidayOnSelectedDate(newDate));
	};

	React.useMemo(() => {
		if (date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")) {
			setListTimeForDate(getSlotsForSelectedDate(date, slots));
			setIsHolidayState(isHolidayOnSelectedDate(date));
		}
	}, [slots.dates]);

	const addNewTime = () => {
		const selectedDate = date.format("YYYY-MM-DD");
		const ts = new Date().getTime();
		setSlots({
			...slots,
			dates: [
				...slots.dates,
				{
					date: selectedDate,
					startTime: "",
					endTime: "",
					id: `new-${ts}`,
				},
			],
		});
		setListTimeForDate([
			...listTimeForDate,
			{
				date: selectedDate,
				startTime: "",
				endTime: "",
				id: `new-${ts}`,
			},
		]);
	};

	const [openDialog, setOpenDialog] = React.useState(false);

	const toggleDateSpecificDialog = () => {
		setOpenDialog(!openDialog);
	};

	const handleCancel = () => {
		resetData();
		toggleDateSpecificDialog();
	};

	const ToastCtx = React.useContext(ToastContext);

	const deleteTime = (id) => {
		const updatedItems = [...slots.dates];
		const index = updatedItems.findIndex((item) => item.id === id);
		if (index < 0) {
			console.log(292, "oops!");
			return;
		}
		updatedItems.splice(index, 1);
		setSlots({
			...slots,
			dates: updatedItems,
		});
		setListTimeForDate(updatedItems);
	};

	const sendRequestToDb = (selectedDate, dateTimes) => {
		sendRequest("/availability/dates", "put", {
			dates: [selectedDate],
			schedule: dateTimes,
		})
			.then((res) => {
				if (!res.data) throw new Error();
				ToastCtx.setMsg("Availability updated successfully.");
				setNeedToRequestAgain(true);
			})
			.catch((err) => {
				console.log(274, err);
				ToastCtx.setMsg(
					"Failed to update availability. Try again later.",
				);
			});
	};

	const saveTime = (id, startTime, endTime) => {
		const updatedItems = [...slots.dates];
		const index = updatedItems.findIndex((item) => item.id === id);
		if (index < 0) {
			console.log(292, "oops!");
			return;
		}
		updatedItems[index] = {
			...updatedItems[index],
			startTime,
			endTime,
		};
		console.log(289, updatedItems);
		setSlots({
			...slots,
			dates: updatedItems,
		});
	};

	const getFormattedDate = (date) =>
		date.year().toString().padStart(2, 0) +
		"-" +
		(date.month() + 1).toString().padStart(2, 0) +
		"-" +
		date.date().toString().padStart(2, 0);

	const handleConfirm = () => {
		const dateTimes = slots.dates.filter(
			(item) => item.date === date.format("YYYY-MM-DD"),
		);

		const selectedDate = getFormattedDate(date);

		console.log(299, dateTimes);
		for (let i = 0; i < dateTimes.length; i++) {
			if (
				!checkTimeFormat(dateTimes[i].startTime) ||
				!checkTimeFormat(dateTimes[i].endTime)
			) {
				ToastCtx.setMsg(
					"Invalid time format. Please enter time in HH:MM format.",
				);
				return;
			}
		}
		console.log(206, "submitting...", dateTimes, selectedDate);
		sendRequestToDb(selectedDate, dateTimes);
	};

	const getListOfDatesToHighlight = (slots, incomingDateObject) => {
		return slots
			.map((item) =>
				item.date === incomingDateObject.format("YYYY-MM-DD")
					? dayjs(item.date).date()
					: "",
			)
			.filter((a) => a !== "");
	};

	const highlightDay = (props) => {
		const isSelected =
			!props.outsideCurrentMonth &&
			getListOfDatesToHighlight(slots.dates, props.day).indexOf(
				props.day.date(),
			) >= 0;
		return (
			<PickersDay
				{...props}
				style={{
					background: isSelected ? "#DDD" : "inherit",
				}}
			/>
		);
	};

	const handleHoliday = (isChecked) => {
		console.log(409, slots.dates);

		const dates = [...slots.dates].filter(
			(a) => a.date !== date.format("YYYY-MM-DD"),
		);

		if (isChecked) {
			dates.push({
				date: date.format("YYYY-MM-DD"),
				startTime: "00:00",
				endTime: "00:00",
			});
		}

		setSlots({
			...slots,
			dates,
		});
		setIsHolidayState(isChecked);

		setListTimeForDate(
			getSlotsForSelectedDate(date, {
				...slots,
				dates,
			}),
		);
	};

	const combineDates = (dates) =>
		dates.reduce((acc, curr) => {
			const foundIndex = acc.findIndex((item) => item.date === curr.date);
			if (foundIndex !== -1) {
				acc[foundIndex].times.push({
					startTime: curr.startTime,
					endTime: curr.endTime,
				});
			} else {
				acc.push({
					date: curr.date,
					times: [
						{ startTime: curr.startTime, endTime: curr.endTime },
					],
				});
			}
			return acc;
		}, []);

	const sortDates = (data) => {
		data.sort((a, b) => {
			// Convert dates to Date objects for comparison
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);

			// Compare the dates
			if (dateA < dateB) {
				return -1;
			}
			if (dateA > dateB) {
				return 1;
			}
			return 0;
		});

		return data;
	};

	return (
		<>
			<div className="dateSpecificOuter">
				<div>
					<Text txt={"Date-specific hours"} fontWeight={"bold"} />
				</div>
				<Text
					txt="You can set date-specific hours according to your availability. It will override weekly hours."
					style={{
						marginTop: "10px",
						fontSize: "14px",
						color: "#AAA",
						lineHeight: "1.5rem",
					}}
				/>
				<div className="dateSpecific-sub01">
					<Button
						variant="outlined"
						onClick={toggleDateSpecificDialog}
						startIcon={
							<Icon
								icon="material-symbols:update"
								style={{
									fontSize: "24px",
								}}
							/>
						}
					>
						Update
					</Button>
					<Dialog
						open={openDialog}
						onClose={toggleDateSpecificDialog}
					>
						<DialogTitle>
							<Text
								txt={"Select date to override timing"}
								txtsize={"h7"}
								fontWeight={"bold"}
							/>
						</DialogTitle>
						<DialogContent>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DemoContainer
									components={[
										"DateCalendar",
										"DateCalendar",
									]}
								>
									<DemoItem>
										<DateCalendar
											value={date}
											onChange={handleDateChange}
											views={["day", "month"]}
											disablePast
											slots={{
												day: highlightDay,
											}}
											slotProps={{
												day: {
													highlightedDays: [10, 30],
												},
											}}
											classes={{
												root: "date-picker-root",
											}}
										/>
									</DemoItem>
								</DemoContainer>
							</LocalizationProvider>
							<hr
								style={{
									border: "1px solid #ccc",
									// margin: '20px 0'
								}}
							/>

							{date.$d ? (
								listTimeForDate.filter(
									(a) => a.startTime === "00:00",
								).length != 0 ? (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											rowGap: "6px",
											padding: "20px 0",
										}}
									>
										<Text
											txt="Holiday!"
											style={{
												fontSize: "14px",
												color: "#AAA",
											}}
										/>
										<Text
											txt="No availability for this day."
											style={{
												fontSize: "18px",
												color: "#444",
											}}
										/>
									</div>
								) : (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div
											style={{
												padding: "10px 5px",
												display: "flex",
												width: "100%",
												justifyContent: "space-between",
												alignItems: "center",
												boxSizing: "border-box",
											}}
										>
											<Text
												txt={
													"Set hours for selected dates"
												}
												txtsize={"caption"}
												style={{
													color: "#888",
												}}
											/>
											<IconButton onClick={addNewTime}>
												<Icon
													icon="ic:round-add"
													width={24}
													style={{
														color: "#1F8B8B",
													}}
												/>
											</IconButton>
										</div>
										{listTimeForDate.map((item, index) => (
											<DateTimeSlot
												key={`dateTime-${index}`}
												id={item.id}
												saveTime={saveTime}
												startTime={item.startTime}
												endTime={item.endTime}
												deleteTime={deleteTime}
											/>
										))}
									</div>
								)
							) : (
								""
							)}
						</DialogContent>
						<DialogActions
							style={{
								padding: "20px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<div>
								<FormControlLabel
									control={
										<Checkbox
											checked={isHolidayState}
											onChange={(e) =>
												handleHoliday(e.target.checked)
											}
										/>
									}
									label="Holiday"
									sx={{
										".MuiFormControlLabel-label": {
											fontSize: "14px",
											color: "#444",
										},
									}}
								/>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
								}}
							>
								<Button
									onClick={handleCancel}
									style={{
										color: "#888",
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={handleConfirm}
									variant="contained"
								>
									Save
								</Button>
							</div>
						</DialogActions>
					</Dialog>

					<hr
						style={{
							margin: "1rem 0",
							border: "1px solid #eee",
						}}
					/>
					<div
						style={{
							height: "100%",
							maxHeight: "457px",
							overflowY: "scroll",
							padding: "10px",
						}}
					>
						{originalSlots?.dates?.length ? (
							sortDates(combineDates(originalSlots?.dates)).map(
								(item) => (
									<DateTimeSection
										key={item.id}
										date={item.date}
										times={item.times}
										onDelete={() => deleteTime(item.id)}
									/>
								),
							)
						) : (
							<Text
								txt={
									<div
										style={{
											display: "flex",
											alignItems: "flex-start",
											columnGap: "10px",
										}}
									>
										<Icon
											icon="fxemoji:lightbulb"
											style={{
												fontSize: "30px",
											}}
										/>
										It gives you freedom to manage your
										holidays and special days.
									</div>
								}
								style={{
									padding: "10px",
									fontSize: "14px",
									color: "#AAA",
									lineHeight: "1.5rem",
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default DateSpecificHours;
