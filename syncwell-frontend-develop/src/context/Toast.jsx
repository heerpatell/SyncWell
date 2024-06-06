import React from "react";
import ToastMessage from "../components/components/ToastMessage";

export const ToastContext = React.createContext({
	msg: "",
	open: false,
	setMsg: () => {},
});

export default function ToastContextProvider(props) {
	const [toastOpen, setToastOpen] = React.useState({
		msg: "",
		open: false,
	});

	const setMsg = (msg) => setToastOpen({ msg, open: true });

	return (
		<ToastContext.Provider
			value={{ msg: toastOpen.msg, open: toastOpen.open, setMsg }}
		>
			<ToastMessage
				setOpenState={setToastOpen}
				openState={toastOpen.open}
				onClose={() => setToastOpen({ msg: "", open: false })}
				message={toastOpen.msg}
			/>
			{props.children}
		</ToastContext.Provider>
	);
}
