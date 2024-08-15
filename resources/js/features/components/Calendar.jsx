import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css"; // Import Tippy.js CSS
import "tippy.js/animations/scale.css";
import { useDispatch, useSelector } from "react-redux";
import { authentication, create, load, modal } from "../userSlice";
import Loader from "../../views/Loader";
import { patchUpdated, postStored } from "../util/axiosCrud";
import Swal from "sweetalert2";
import { removeMillisecondsAndTimezone } from "../util/dateFormat";
import CalendarForm from "././form/CalendarForm";
import { isAuthenticated } from "../util/authentication";
import { loadCalendarEvents } from "../custom-hooks/loadCalendarEvents";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { current } from "@reduxjs/toolkit";

function Calendar({ calendarRef }) {
    const useSelectorAllEvents = useSelector((data) => data.user.data);
    const navigation = useNavigate();
    const [events, setEvents] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const selectorModal = useSelector((data) => data.user.modal); // on and off show modall
    const [headerDate, setHeaderDate] = useState("");
    const createEvent = useRef(null);
    const updateEvent = useRef(null);

    // display information
    const [show, setShow] = useState(false);
    const [showData, setShowData] = useState({});

    function handleShow() {
        setShow((bool) => {
            if (bool === true) {
                setShowData({});
            }
            return !bool;
        });
    }
    // type in form
    const [formType, setFormType] = useState({
        store: false,
        update: false,
    });

    // authenticated user
    useEffect(() => {
        async function fetchData() {
            try {
                const authenticated = await isAuthenticated();
                if (authenticated?.status === 200) {
                    const data = authenticated.data;
                    if (data) {
                        const payload = {
                            user_id: data.user_id,
                            token_id: data.token_id,
                        };

                        dispatch(authentication(payload));
                    }
                }
            } catch (error) {
                if (error.status === 401) {
                    localStorage.setItem("Error_STATUS", JSON.stringify(err));
                }
                if (error instanceof Error) {
                    throw new Error(`${error.message}`);
                }
            }
        }
        fetchData();
    }, []);

    let callBackLoadedEvents = useCallback(
        async function () {
            setLoading(true);
            const response = await loadCalendarEvents();

            if (calendarRef?.current) {
                let api = calendarRef?.current.getApi();

                if (response) {
                    if (useSelectorAllEvents.length === 0) {
                        console.log("refresh data", response);
                        dispatch(load(response));
                        setEvents(response);
                        api.setOption("events", response);
                        setLoading(false);
                    }
                }
                if (useSelectorAllEvents.length >= 1) {
                    api.setOption("events", useSelectorAllEvents);
                    setLoading(false);
                }
            }
        },
        [loadCalendarEvents, setLoading, dispatch, load, useSelectorAllEvents]
    );

    // load all data
    useEffect(function () {
        callBackLoadedEvents();
        if (`${events}` === "null") {
            setEvents(useSelectorAllEvents);
        }
    }, []);

    function handleMouseEnterEventTooltip(arg) {
        const el = arg.el;
        const event = arg.event;
        if (event.extendedProps.description) {
            tippy(el, {
                content: `${event.extendedProps.description}`,
                placement: "top",
                arrow: true,
                allowHTML: true,
                animation: "scale",
            });
        }
    }

    function handleEventClick(arg) {
        // update in the form modal
        const el = arg.el;
        const event = arg.event;

        if (event) {
            setFormType(() => {
                return {
                    store: false,
                    update: true,
                };
            });
            setHeaderDate(
                new Date(`${event.start}`).toISOString().split("T")[0]
            );
            const { id, title, extendedProps } = event;
            setShow(true);
            setShowData(() => {
                return {
                    id,
                    status: `${extendedProps.status}`.toUpperCase(),
                    title: `${title}`,
                    description: `${extendedProps.description}`,
                };
            });
        }
    }

    function handleDateClick(arg) {
        // form for stored modal
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const clickDate = new Date(`${arg.dateStr}`);
        const setToday = new Date(`${`${year}-${month}-${day}`}`);

        if (clickDate > setToday) {
            setHeaderDate(() => arg.dateStr);
            dispatch(modal(!selectorModal));
            setFormType(() => {
                return {
                    store: true,
                    update: false,
                };
            });
        }
    }

    async function handleCalendarSubmit(e) {
        e.preventDefault();

        const target = e.target;
        const data = new FormData(target);

        const objectEntries = Object.fromEntries(data);
        let { title, description, start, update, status } = objectEntries;
        if (formType.store) {
            const storedValue = {
                title: title,
                description: description,
                start: new Date(`${start}`).toISOString(),
            };

            const responseStored = await postStored(storedValue);
            if (responseStored.status === 200) {
                setLoading(true);
                let formStored = document.querySelector(".formCalendarStored");
                let title = document.querySelector("#title-stored");
                let description = document.querySelector("#description-stored");
                title.value = description.value = "";

                formStored.classList.add("hidden");

                let exist_error_title = document.querySelector(`.title-error`);
                let exist_error_description =
                    document.querySelector(`.description-error`);
                exist_error_title.textContent = "";
                exist_error_description.textContent = "";

                let addEvents = {
                    id: responseStored.data.id,
                    title: responseStored.data.title,
                    start: responseStored.data.start,
                    end: responseStored.data.end,
                    className:
                        "bg-blue-950 text-slate-100 rouded-[40px] hover:bg-blue-800 space-x-2 cursor-pointer STATUS-IDLE",
                    status: "idle",
                    description: responseStored.data.description,
                };

                //const reFetchStored = await loadCalendarEvents();
                if (calendarRef?.current) {
                    let api = calendarRef?.current.getApi();

                    setEvents((data) => {
                        if (data?.length >= 1) {
                            return [...data, addEvents];
                        }

                        if (!data) {
                            return [
                                ...useSelectorAllEvents?.flatMap((value) => {
                                    return {
                                        ...value.addEvents,
                                    };
                                }),
                            ];
                        }
                    });

                    if (events?.length === 0) {
                        // first time new events
                        console.log("ok 1", events);
                        createEvent.current = [
                            ...events?.flatMap((value) => {
                                return {
                                    ...value,
                                    end: value?.start,
                                };
                            }),
                            {
                                ...addEvents,
                                end: addEvents.start,
                            },
                        ];
                    }

                    if (
                        events?.length >= 1 &&
                        useSelectorAllEvents?.length <= 1
                    ) {
                        console.log("ok 2");
                        createEvent.current = [
                            ...events?.flatMap((value) => {
                                return {
                                    ...value,
                                    end: value?.start,
                                };
                            }),
                            {
                                ...addEvents,
                                end: addEvents.start,
                            },
                        ];
                    }
                    if (
                        events?.length === 1 &&
                        useSelectorAllEvents?.length >= 2
                    ) {
                        console.log("ok 3");
                        createEvent.current = [
                            ...useSelectorAllEvents?.flatMap((value) => {
                                let modifyValueObj = Object.entries(value);
                                let allReplaceEvents = [];
                                for (let [_, value] of modifyValueObj) {
                                    allReplaceEvents.push({
                                        ...value,
                                        end: value?.start,
                                    });
                                }
                                return allReplaceEvents;
                            }),

                            {
                                ...addEvents,
                                end: addEvents.start,
                            },
                        ];
                    }

                    if (events?.length === useSelectorAllEvents?.length) {
                        console.log("ok 4", events);
                        createEvent.current = [
                            ...events?.flatMap((value) => {
                                return {
                                    ...value,
                                    end: value?.start,
                                };
                            }),
                            {
                                ...addEvents,
                                end: addEvents.start,
                            },
                        ];
                    }
                    if (
                        events?.length ===
                        Number(useSelectorAllEvents?.length - 1)
                    ) {
                        createEvent.current = [
                            ...useSelectorAllEvents?.flatMap((value) => {
                                let modifyValueObj = Object.entries(value);
                                let allReplaceEvents = [];
                                for (let [_, value] of modifyValueObj) {
                                    allReplaceEvents.push({
                                        ...value,
                                        end: value?.start,
                                    });
                                }
                                return allReplaceEvents;
                            }),

                            {
                                ...addEvents,
                                end: addEvents.start,
                            },
                        ];
                    }

                    console.log(events, useSelectorAllEvents);

                    if (!events) {
                        createEvent.current = [
                            ...useSelectorAllEvents?.flatMap((value) => {
                                let modifyValueObj = Object.entries(value);
                                let allReplaceEvents = [];
                                for (let [_, value] of modifyValueObj) {
                                    allReplaceEvents.push({
                                        ...value,
                                        end: value?.start,
                                    });
                                }
                                return allReplaceEvents;
                            }),

                            { ...addEvents, end: addEvents.start },
                        ];
                    }

                    setTimeout(function () {
                        console.log(createEvent.current);
                        dispatch(create({ addEvents }));
                        api.setOption("events", createEvent.current);
                        Swal.fire({
                            title: "Success!",
                            text: "You have successfully created!",
                            icon: "success",
                        });
                        setLoading(false);
                    }, 0);
                }
                dispatch(modal(!selectorModal));
            }

            if (responseStored.status === 422) {
                errorMessage(responseStored.data);
            }

            if (responseStored.status === 500) {
                Swal.fire({
                    title: "Error!",
                    text: "Please contact your administratior!",
                    icon: "error",
                });
            }
        }

        if (formType.update) {
            setLoading(true);
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
                id: update,
                title,
                description,
                start: new Date(`${start}`).toISOString(),
                status: `${status}`.toUpperCase(),
                className,
            };

            if (events) {
                console.log("ok 1 update");
                setEvents((values) => {
                    return values.map((value, index) => {
                        return value[index]?.id === updatedValue.id
                            ? {
                                  ...value,
                                  title: updatedValue.title,
                                  description: updatedValue.description,
                                  status: updatedValue.status,
                                  className: updatedValue.className,
                              }
                            : value;
                    });
                });
            }

            if (!events) {
                console.log("ok 2 update");
                setEvents((data) => {
                    if (!data) {
                        return useSelectorAllEvents.map((value, index) => {
                            return value[index]?.id === updatedValue.id
                                ? {
                                      ...value,
                                      title: updatedValue.title,
                                      description: updatedValue.description,
                                      status: updatedValue.status,
                                      className: updatedValue.className,
                                  }
                                : value;
                        });
                    }
                });
            }
            if (calendarRef.current) {
                let api = calendarRef.current.getApi();
                if (updateEvent.current) {
                    console.log("ok 3 update");
                    updateEvent.current = events.map((value) => {
                        return value?.id === updatedValue?.id
                            ? {
                                  ...value,
                                  title: updatedValue.title,
                                  description: updatedValue.description,
                                  status: updatedValue.status,
                                  className: updatedValue.className,
                              }
                            : value;
                    });
                }

                if (!updateEvent.current) {
                    updateEvent.current = useSelectorAllEvents.map((value) => {
                        if (value["addEvents"]) {
                            value = {
                                ...value["addEvents"],
                                end: value["addEvents"]?.start,
                            };
                            delete value["addEvents"];
                        }
                        console.log(value);
                        return value?.id === updatedValue?.id
                            ? {
                                  ...value,
                                  title: updatedValue.title,
                                  description: updatedValue.description,
                                  status: updatedValue.status,
                                  className: updatedValue.className,
                              }
                            : value;
                    });
                }

                setTimeout(function () {
                    setShowData(() => {
                        return {
                            id: updatedValue.id,
                            status: `${updatedValue.status}`.toUpperCase(),
                            title: `${updatedValue.title}`,
                            description: `${updatedValue.description}`,
                            className: updatedValue.className,
                        };
                    });

                    dispatch(load(updateEvent.current));
                    api.setOption("events", updateEvent.current);
                    setLoading(false);
                }, 0);
            }

            const responseUpdated = await patchUpdated(updatedValue);

            if (responseUpdated.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "Your data has been updated!",
                    icon: "success",
                });
                dispatch(modal(!selectorModal));
            }
            if (responseUpdated.status === 422) {
                errorMessage(response.data);
            }

            if (responseUpdated.status === 500) {
                Swal.fire({
                    title: "Error!",
                    text: "Please contact your administratior!",
                    icon: "error",
                });
            }
        }
    }

    return (
        <>
            {isLoading && <Loader />}
            {selectorModal && (
                <CalendarForm
                    handleCalendarSubmit={handleCalendarSubmit}
                    selectorModal={selectorModal}
                    headerDate={headerDate}
                    dispatch={dispatch}
                    modal={modal}
                    formType={formType} // store or update modal form
                    showData={showData} // note showing update the data
                />
            )}

            <div className={`mx-10 mt-5 my-28`}>
                <div
                    className={`flex items-start justify-between flex-wrap lg:flex lg:items-start lg:justify-between lg:flex-nowrap md:justify-center md:items-center md:flex-wrap`}
                >
                    <div
                        className={`w-[100%] lg:w-[70%] md:w-[100%] ${
                            isLoading ? "deferloading" : ""
                        }`}
                    >
                        <FullCalendar
                            plugins={[
                                dayGridPlugin,
                                timeGridPlugin,
                                listPlugin,
                                interactionPlugin,
                            ]}
                            headerToolbar={{
                                right: "prev,next",
                                center: "title",
                                left: "dayGridMonth,listWeek",
                            }}
                            ref={calendarRef}
                            initialView="dayGridMonth"
                            weekends={true}
                            events={[]}
                            eventClick={handleEventClick}
                            eventContent={renderEventContent}
                            eventMouseEnter={handleMouseEnterEventTooltip}
                            dateClick={handleDateClick}
                            displayEventTime={false}
                        />
                    </div>
                    <div
                        className={` bg-gray-100 rounded-[40px] ms-[-3px] m-[20px] w-[100%] lg:rounded-[40px] lg:m-[20px] lg:w-[30%] lg:ms-[30px] md:w-[100%] ${
                            isLoading ? "deferloading" : ""
                        }`}
                    >
                        <div
                            className={`w-[100%] h-[100%] my-[410px] mx-[200px] px-0 ms-0 lg:w-[100%] lg:h-[100%] lg:my-[410px] lg:mx-[200px] lg:px-0 lg:ms-0 md:mx-[10px] md:px-[40px] md:ms-[5px]`}
                        >
                            <div className="flex items-center justify-center mx-10 relative">
                                {/* <Link
                                    to={"/table-mode"}
                                    className="bg-indigo-600 text-slate-100 font-semibold rounded-[40px] w-full m-3 p-2 hover:bg-indigo-800 transition-all duration-75 mt-[-700px] ms-[16px] absolute text-center focus:ring focus:ring-slate-100"
                                >
                                    Table Mode
                                </Link> */}
                                <Button
                                    label="Table Mode"
                                    severity="help"
                                    className=" w-full m-3 p-2 mt-[-700px] ms-[16px] absolute "
                                    onClick={() => navigation("/table-mode")}
                                />
                            </div>

                            <div
                                className={`bg-gray-700 mx-[20px] py-[50px] px-[100px] rounded-[40px] mt-[-320px] text-slate-50 flex justify-center items-center border-2 border-sky-500/10`}
                            >
                                {show ? (
                                    <>
                                        {Object.keys(showData).length !== 0 ? (
                                            <div className="mt-[-20px] p-[20px] ms-[-10px] text-slate-50 space-y-1 text-[18px] border-solid ">
                                                <p className="text-nowrap text-center ms-[-10px] font-semibold">
                                                    <b>Title</b>
                                                </p>
                                                <p className="text-nowrap text-center ms-[-12px]">
                                                    {showData.title}
                                                </p>
                                                <div className="flex flex-col justify-center items-center">
                                                    <p className="text-wrap text-center">
                                                        <b>Description</b>
                                                    </p>
                                                    <p className="text-wrap text-center text-[14px] ms-[-12px]">
                                                        {showData.description}
                                                    </p>

                                                    <div className="mt-[20px] flex flex-col justify-center items-center ms-[-12px]">
                                                        <p className="text-wrap text-center font-semibold">
                                                            <b>Status</b>
                                                        </p>
                                                        <p className="text-wrap text-center text-[14px]">
                                                            {showData.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-wrap lg:text-wrap md:text-wrap text-slate-50 font-semibold">
                                                    Click the caledar show
                                                    information.
                                                </p>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-wrap lg:text-nowrap md:text-wrap text-slate-50 font-semibold">
                                            Click the caledar show information.
                                        </p>
                                    </>
                                )}
                            </div>
                            {Object.keys(showData).length !== 0 && show && (
                                <div className="mt-3 flex flex-wrap justify-end me-7">
                                    <div className="flex items-center justify-center">
                                        <Button
                                            label="Update"
                                            severity="warning"
                                            className=" text-slate-100 text-md font-semibold transition-all duration-75 p-2 px-6 m-3"
                                            onClick={() =>
                                                dispatch(modal(!selectorModal))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-center">
                                        {Object.keys(showData).length !== 0 &&
                                            show && (
                                                <>
                                                    <Button
                                                        severity="danger"
                                                        className=" text-slate-100 text-md font-semibold transition-all duration-75 p-2 px-6 m-3"
                                                        onClick={handleShow}
                                                    >
                                                        {Object.keys(showData)
                                                            .length !== 0 &&
                                                        show
                                                            ? "Close"
                                                            : ""}
                                                    </Button>
                                                </>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// a custom render function
function renderEventContent(eventInfo) {
    const time = `${eventInfo.timeText}`.slice(0, -1) + " ";

    return (
        <>
            <p className="text-wrap text-slate-50 font-semibold ms-3">
                {eventInfo.event.title}
            </p>
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

export default memo(Calendar);
