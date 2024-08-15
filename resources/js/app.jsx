import React, { lazy, Suspense } from "react";
import ReactDom from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import "./axiosFetch";
import "../css/app.css";

import { store } from "./store";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Error from "./views/Error";

import AppLayout from "./views/AppLayout";

import Login, {
    loader as loaderLogin,
    action as actionLogin,
} from "./features/components/authentication/Login";

import Register, {
    loader as loaderRegister,
    action as actionRegister,
} from "./features/components/authentication/Register";

const Index = lazy(() => import("./features/components/Index"));

const TableIndex = lazy(() => import("./features/components/TableIndex"));

const AccountProfile = lazy(() =>
    import("./features/components/profile/AccountProfile")
);

import {
    loader as loaderAccountProfile,
    action as actionAccountProfile,
} from "./features/components/profile/AccountProfile";

import Logout, {
    loader as loaderLogout,
} from "./features/components/authentication/Logout";

import Loader from "./views/Loader";

const endPoints = [
    {
        element: <AppLayout />,
        errorElement: <Error />,
        children: [
            {
                path: "/",
                element: <Index />,
                errorElement: <Error />,
            },
            {
                path: "/table-mode",
                element: <TableIndex />,
                errorElement: <Error />,
            },
            {
                path: "/account-profile",
                element: <AccountProfile />,
                errorElement: <Error />,
                loader: loaderAccountProfile,
                action: actionAccountProfile,
            },
            {
                path: "/logout",
                element: <Logout />,
                loader: loaderLogout,
            },
            {
                path: "/login",
                element: <Login />,
                loader: loaderLogin,
                action: actionLogin,
                errorElement: <Error />,
            },
            {
                path: "/register",
                element: <Register />,
                loader: loaderRegister,
                action: actionRegister,
                errorElement: <Error />,
            },
        ],
    },
];

const routers = createBrowserRouter(endPoints);

const root = ReactDom.createRoot(document.getElementById("root"));

root.render(
    <>
        <React.StrictMode>
            <PrimeReactProvider value={{ unstyled: false, pt: {} }}>
                <Suspense fallback={<Loader />}>
                    <Provider store={store}>
                        <RouterProvider router={routers} />
                    </Provider>
                </Suspense>
            </PrimeReactProvider>
        </React.StrictMode>
    </>
);
