import React, { useEffect, useRef, useState } from "react";

import HeaderCalendar from "./HeaderCalendar";
import Calendar from "./Calendar";
import { Navigate, redirect } from "react-router-dom";

export default function Index() {
    const calendarRef = useRef(null);
    const token = localStorage.getItem("ACCESS_TOKEN");
    // handler function
    useEffect(() => {
        const handleButtonClick = (e) => {
            if (e.target.closest(".fc-button-active")) {
                const list_tab_time = document.querySelectorAll(
                    ".fc-list-event-time"
                );
                const list_tab_bullet = document.querySelectorAll(
                    ".fc-list-event-graphic"
                );
                const list_tab_title = document.querySelectorAll(
                    ".fc-list-event-title > i"
                );

                list_tab_time.forEach((value) => {
                    value.innerHTML = "";
                });
                list_tab_bullet.forEach((value) => {
                    value.innerHTML = "";
                });
                list_tab_title.forEach((value) => {
                    value.classList.add("ms-[-40px]");
                });
            }
        };

        const handleNextButtonClick = () => {
            const idle_text = document.querySelector(".TEXT-IDLE");
            const active_text = document.querySelector(".TEXT-ACTIVE");
            const completed_text = document.querySelector(".TEXT-COMPLETED");
            idle_text.classList.remove("line-through");
            active_text.classList.remove("line-through");
            completed_text.classList.remove("line-through");
        };

        // addEventListener
        const fcButtonGroup = document.querySelector(".fc-button-group");
        const fcButton = document.querySelector(".fc-prev-button");
        const fcNextButton = document.querySelector(".fc-next-button");

        fcButtonGroup?.addEventListener("click", handleButtonClick);
        fcButton?.addEventListener("click", handleNextButtonClick);
        fcNextButton?.addEventListener("click", handleNextButtonClick);

        return () => {
            fcButtonGroup?.removeEventListener("click", handleButtonClick);
            fcButton?.removeEventListener("click", handleNextButtonClick);
            fcNextButton?.removeEventListener("click", handleNextButtonClick);
        };
    }, []);

    return (
        <>
            {token && (
                <>
                    <HeaderCalendar />
                    <Calendar calendarRef={calendarRef} />
                </>
            )}
        </>
    );
}

export async function loader() {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
        return redirect("/login");
    }
    return null;
}
