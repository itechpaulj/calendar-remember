import React, { useEffect, useReducer, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { TieredMenu } from "primereact/tieredmenu";
import { authGetUser } from "../util/authentication";

const initial_state = {
    idle: false,
    active: false,
    completed: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "IDLE":
            return {
                ...state,
                idle: state.idle === action.payload ? true : false,
            };
        case "ACTIVE":
            return {
                ...state,
                active: state.active === action.payload ? true : false,
            };
        case "COMPLETED":
            return {
                ...state,
                completed: state.completed === action.payload ? true : false,
            };
        default:
            console.log("Action Unknown");
    }
}

function HeaderCalendar() {
    const navigation = useNavigate();
    // breadcrumbs
    const items = [
        {
            label: "Calendar Remember",
            template: () => (
                <span
                    className="text-primary text-slate-900 font-semibold hover:cursor-pointer"
                    onClick={() => navigation("/")}
                >
                    Calendar Remember
                </span>
            ),
        },
    ];

    const menu = useRef(null);

    const home = { icon: "pi pi-home", url: `${import.meta.env.VITE_APP_URL}` };

    const itemsProile = [
        {
            label: "Profile",
            icon: "pi pi-user-plus",
            items: [
                {
                    label: "Account",
                    icon: "pi pi-user",
                    // url: "/account-profile",
                    command: () => {
                        navigation("/account-profile");
                    },
                },
                {
                    label: "Logout",
                    icon: "pi-sign-out",
                    //url: "/logout",
                    command: () => {
                        navigation("/logout");
                    },
                },
            ],
        },
    ];

    // show avatar and auth
    const [user, setUser] = useState("");
    const [image, setImage] = useState("/images/profile-user.png");
    useEffect(function () {
        async function getAuthUser() {
            const auth = await authGetUser();

            if (auth.status === 200) {
                setImage(auth?.data?.data?.avatar);
                setUser(auth?.data?.data?.fullname);
                //console.log(auth?.data?.data?.avatar);
            }
        }
        getAuthUser();
    }, []);

    const [{ idle, active, completed }, dispatch] = useReducer(
        reducer,
        initial_state
    );

    const token = localStorage.getItem("ACCESS_TOKEN");

    let idle_status = document.querySelectorAll(".STATUS-IDLE");
    let active_status = document.querySelectorAll(".STATUS-ACTIVE");
    let completed_status = document.querySelectorAll(".STATUS-COMPLETED");

    let idle_text = document.querySelector(".TEXT-IDLE");
    let active_text = document.querySelector(".TEXT-ACTIVE");
    let completed_text = document.querySelector(".TEXT-COMPLETED");

    // idle
    if (idle) {
        [...idle_status].forEach((value, index) => {
            value.classList.add("invisible");
        });
        idle_text?.classList.add("line-through");
    }

    if (!idle) {
        [...idle_status].forEach((value, index) => {
            value.classList.remove("invisible");
        });
        idle_text?.classList.remove("line-through");
    }
    // active
    if (active) {
        [...active_status].forEach((value, index) => {
            value.classList.add("invisible");
        });
        active_text?.classList.add("line-through");
    }

    if (!active) {
        [...active_status].forEach((value, index) => {
            value.classList.remove("invisible");
        });
        active_text?.classList.remove("line-through");
    }

    //completed
    if (completed) {
        [...completed_status].forEach((value, index) => {
            value.classList.add("invisible");
        });
        completed_text?.classList.add("line-through");
    }

    if (!completed) {
        [...completed_status].forEach((value, index) => {
            value.classList.remove("invisible");
        });
        completed_text?.classList.remove("line-through");
    }

    return (
        <>
            <div className={`mx-10 mt-10 `}>
                <div
                    className={`my-2 w-full ${
                        user === "" ? "deferloading" : ""
                    }`}
                >
                    <BreadCrumb
                        model={items}
                        home={home}
                        className={`rounded-[10px]`}
                    />
                </div>

                <div
                    className={`flex justify-start items-center flex-wrap lg:flex lg:justify-start lg:items-start lg:flex-nowrap md:flex-wrap mx-[-40px] `}
                >
                    <div
                        className={`bg-stone-200 rounded-[40px] m-10 p-5 w-[100%] px-5 mx-5 lg:rounded-[40px] lg:m-10 lg:p-5 lg:w-[70%] md:w-[100%] shadow-lg ${
                            user === "" ? "deferloading" : ""
                        }`}
                    >
                        <ul className="flex justify-start items-center space-x-4 font-semibold text-md">
                            <li
                                className="text-slate-700 cursor-pointer"
                                onClick={() =>
                                    dispatch({ type: "IDLE", payload: false })
                                }
                            >
                                <span className="bg-blue-950 rounded-[200px] px-2 py-1">
                                    &nbsp;&nbsp;
                                </span>
                                &nbsp;&nbsp;
                                <span className="TEXT-IDLE">IDLE</span>
                            </li>
                            <li
                                className="text-slate-700 cursor-pointer"
                                onClick={() =>
                                    dispatch({ type: "ACTIVE", payload: false })
                                }
                            >
                                <span className="bg-green-950 rounded-[200px] px-2 py-1">
                                    &nbsp;&nbsp;
                                </span>
                                &nbsp;&nbsp;
                                <span className="TEXT-ACTIVE">ACTIVE</span>
                            </li>
                            <li
                                className="text-slate-700 cursor-pointer"
                                onClick={() =>
                                    dispatch({
                                        type: "COMPLETED",
                                        payload: false,
                                    })
                                }
                            >
                                <span className="bg-orange-950 rounded-[200px] px-2 py-1">
                                    &nbsp;&nbsp;
                                </span>
                                &nbsp;&nbsp;
                                <span className="TEXT-COMPLETED">
                                    COMPLETED
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div
                        className={`bg-stone-200 rounded-[40px] m-10 w-[100%] p-5 lg:rounded-[40px] lg:m-10 lg:w-[30%] lg:p-5 md:w-[100%] mt-[-20px] lg:ms-[10px] lg:mx-20 shadow-lg ${
                            user === "" ? "deferloading" : ""
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="mx-5 font-semibold text-md text-slate-700">
                                Hi! {user && user}
                            </span>

                            <img
                                className="hover:cursor-pointer"
                                onClick={(e) => menu.current.toggle(e)}
                                src={image}
                                height="45"
                                width="25"
                            ></img>
                            <TieredMenu
                                model={itemsProile}
                                popup
                                ref={menu}
                                breakpoint="767px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HeaderCalendar;
