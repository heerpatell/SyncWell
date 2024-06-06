import React, { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes, useNavigate } from "react-router";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import InvitedUser from "./pages/InvitedUser/InvitedUser.jsx";
import { createTheme, ThemeProvider } from "@mui/material";
import ToastContextProvider from "./context/Toast";
import ScheduledEvents from "./pages/Scheduled-events/ScheduledEvents.jsx";
import Availability from "./pages/Availability/Availability.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import AccountSetup from "./pages/AccountSetup/AccountSetup.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import { GoogleCallback } from "./components/components/GoogleLogin.jsx";

const theme = createTheme({
	typography: {
		fontFamily: ["Montserrat"].join(","),
	},
	palette: {
		primary: {
			main: "#1F8B8B",
		},
		secondary: {
			main: "#444",
		},
	},
	components: {
		MuiPickersDay: {
			defaultProps: {
				color: "green",
			},
		},
	},
});

function App() {
	const navigate = useNavigate();
	useEffect(() => {
		if (window.location.pathname === '/') return;
		if (
			localStorage.getItem("token") &&
			window.location.pathname === "/login"
		) {
			navigate("/dashboard");
		}
		if (
			!localStorage.getItem("token") &&
			window.location.pathname !== "/login"
		) {
			navigate("/login");
		}
	}, []);
	return (
		<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
			<ToastContextProvider>
				<ThemeProvider theme={theme}>
					<Routes>
						<Route
							exact
							path="/login"
							element={<LoginPage />}
						></Route>
						<Route
							exact
							path="/profile"
							element={<AccountSetup />}
						></Route>
						<Route excat path="/" element={<LandingPage />}></Route>
						<Route
							exact
							path="/dashboard"
							element={<Dashboard />}
						></Route>
						<Route
							exact
							path="/availability"
							element={<Availability />}
						></Route>
						<Route
							exact
							path="/scheduled-events"
							element={<ScheduledEvents />}
						></Route>
						<Route
							exact
							path="/analysis"
							element={<Dashboard />}
						></Route>
						<Route
							exact
							path="/invite/:meetID"
							element={<InvitedUser />}
						></Route>
						<Route
							exact
							path="/auth/google/callback"
							element={<GoogleCallback />}
						></Route>
					</Routes>
				</ThemeProvider>
			</ToastContextProvider>
		</GoogleOAuthProvider>
	);
}

export default App;
