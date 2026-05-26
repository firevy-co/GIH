import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import dashboardReducer from "./slices/dashboardSlice";
import investmentReducer from "./slices/investmentSlice";
import attendanceReducer from "./slices/attendanceSlice";
import leaveReducer from "./slices/leaveSlice";
import documentReducer from "./slices/documentSlice";
import employeeReducer from "./slices/employeeSlice";
import notificationReducer from "./slices/notificationSlice";
import settingReducer from "./slices/settingSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        dashboard: dashboardReducer,
        investments: investmentReducer,
        attendance: attendanceReducer,
        leaves: leaveReducer,
        documents: documentReducer,
        employees: employeeReducer,
        notifications: notificationReducer,
        settings: settingReducer,
    },
});

export default store;
