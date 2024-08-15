import React from "react";
import { Navigate, Outlet, useNavigation } from "react-router-dom";
import Loader from "./Loader";
import { useSelector } from "react-redux";

function AppLayout() {
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";
    const isSubmitting = navigation.state === "submitting";
    const token = localStorage.getItem("ACCESS_TOKEN");
    return (
        <>
            {!token && <Navigate to="login" />}
            <main className="bg-slate-50">
                <Outlet />
                {isLoading && <Loader />}
                {isSubmitting && <Loader />}
            </main>
        </>
    );
}

export default AppLayout;
