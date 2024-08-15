import React, { useCallback, useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import { tableMode } from "../custom-hooks/table";
import { useDispatch, useSelector } from "react-redux";
import { load, modal } from "../userSlice";
import { patchUpdated } from "../util/axiosCrud";
import { update } from "../userSlice";
import Swal from "sweetalert2";
import { getFullDate, readableHumanDate } from "../util/dateFormat";

function TableIndex() {
    const useSelectorAllEvents = useSelector((data) => data.user.data);

    const [dates, setDates] = useState(null);
    const [allEvents, setAllEvents] = useState([]);
    const [search, setSearch] = useState([]);
    const [updateForm, setUpdateForm] = useState(null);
    const { remember } = tableMode();

    const dispatch = useDispatch();

    const selectorModal = useSelector((data) => data.user.modal);

    useEffect(() => {
        if (remember?.length >= 1) {
            dispatch(load(remember));
            setAllEvents(remember);
        }
    }, []);

    let existDataCallBack = useCallback(
        function () {
            if (useSelectorAllEvents?.length !== 0) {
                let customData = useSelectorAllEvents.map((value) => {
                    let cleaned_created_at = getFullDate(value?.created_at);
                    let cleaned_status = `${value.status}`?.toUpperCase();
                    let cleaned_start = `${value?.start}`?.split("T")[0];

                    return {
                        ...value,
                        created_at: cleaned_created_at
                            ? `${cleaned_created_at}`
                            : "",
                        status: cleaned_status ? `${cleaned_status}` : "",
                        start: cleaned_start ? `${cleaned_start}` : "",
                    };
                });
                setAllEvents(customData);
            }
        },
        [setAllEvents, useSelectorAllEvents]
    );

    useEffect(
        function () {
            existDataCallBack();
        },
        [existDataCallBack]
    );

    useEffect(
        function () {
            setSearch(allEvents);
        },
        [allEvents]
    );

    let callBackSearch = useCallback(
        function () {
            if (allEvents instanceof Array) {
                allEvents
                    .map((value) => {
                        if (Object.keys(value).includes("addEvents")) {
                            // we need delete
                            delete value?.addEvents;
                            delete value?.status;
                            delete value?.start;
                            delete value?.end;
                            delete value?.created_at;
                            Object.freeze(value);
                        }

                        return Object.keys(value).length === 9 && value;
                    })
                    .filter((value) => {
                        if (value) return value;
                    });
            }
        },
        [allEvents]
    );

    useEffect(
        function () {
            callBackSearch();
        },
        [callBackSearch]
    );

    async function handleUpdateSubmit(e) {
        e.preventDefault();
        const target = e.target;

        const form = new FormData(target);
        const objectEntries = Object.fromEntries(form);
        let { title, description, start, update: id, status } = objectEntries;

        let className = "";

        if (status === "idle") {
            className =
                "bg-blue-950 text-slate-100 rouded-[40px] hover:bg-blue-800 space-x-2 cursor-pointer STATUS-IDLE";
        }
        if (status === "active") {
            className =
                "bg-green-950 text-slate-100 rouded-[40px] hover:bg-green-800 space-x-2 cursor-pointer STATUS-ACTIVE";
        }

        if (status === "completed") {
            className =
                "bg-orange-950 text-slate-100 rouded-[40px] hover:bg-orange-800 space-x-2 cursor-pointer STATUS-COMPLETED";
        }

        const updatedValue = {
            id: id,
            title,
            description,
            start: new Date(`${start}`).toISOString(),
            status: `${status}`.toUpperCase(),
        };

        const response = await patchUpdated(updatedValue);

        dispatch(update({ payload: { ...updatedValue, className } }));

        if (response?.status === 200) {
            Swal.fire({
                title: "Success!",
                text: "Your data has been updated!",
                icon: "success",
            });

            dispatch(modal(!selectorModal));
        }
        if (response?.status === 422) {
            errorMessage(response.data);
        }

        if (response?.status === 500) {
            Swal.fire({
                title: "Error!",
                text: "Please contact your administratior!",
                icon: "error",
            });
        }

        /*
            Note: search is useState is aleardy loaded all data, we need some changes data or replace some data to be updated.
        */
        setSearch((data) => {
            return data.map((value, index) => {
                return `${value.id}` === `${updatedValue.id}`
                    ? {
                          ...value,
                          title: updatedValue.title,
                          description: updatedValue.description,
                          status: `${updatedValue.status}`.toUpperCase(),
                      }
                    : value;
            });
        });
    }

    return (
        <>
            <div className="mx-10 mt-10">
                <TableHeader
                    dates={dates}
                    setDates={setDates}
                    allEvents={allEvents}
                    setSearch={setSearch}
                />
                <TableBody
                    search={search}
                    setSearch={setSearch}
                    allEvents={allEvents}
                    setAllEvents={setAllEvents}
                    dispatch={dispatch}
                    selectorModal={selectorModal}
                    modal={modal}
                    setUpdateForm={setUpdateForm}
                    updateForm={updateForm}
                    handleUpdateSubmit={handleUpdateSubmit}
                />
            </div>
        </>
    );
}
function errorMessage(formvalue) {
    const objectEntries = Object.entries(formvalue);
    for (let [value, index] of objectEntries) {
        const err = document.querySelector(`.${value}-error`);
        err.textContent = `${index}`;
    }
}
export default TableIndex;
