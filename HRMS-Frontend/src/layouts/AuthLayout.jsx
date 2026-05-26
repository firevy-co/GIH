import { Outlet } from "react-router-dom"
import Logo from "../assets/GIH-logo.png";

export const AuthLayout = () => {
    return (
        <>
            <div className="flex w-full h-screen">
                <div className="flex flex-col justify-center items-center bg-[#111111] text-white w-[90%]">
                    <img src={Logo} alt="GIH Logo" className="h-24 object-contain mb-8" />
                    <h1 className="font-bold text-[30px]">Manage Your Human Resource</h1>
                    <h1 className="font-bold text-[30px] mb-50">Management System</h1>
                </div>
                <div className="flex justify-center items-center w-[65%]">
                    <Outlet />
                </div>
            </div>
        </>
    )
}