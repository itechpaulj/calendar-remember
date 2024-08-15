import React, { useEffect, useRef, useState } from "react";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import { Calendar } from "primereact/calendar";
import Select from "react-select";
import { Button } from "primereact/button";
import { searchFiltered } from "../custom-hooks/filtered";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
function TableHeader({ dates, setDates, allEvents, setSearch }) {
    const navigation = useNavigate();
    // breadcrumbs
    const items = [
        {
            label: "Calendar Remember",
            template: () => (
                <span
                    className="text-primary text-slate-900 hover:cursor-pointer"
                    onClick={() => navigation("/")}
                >
                    Calendar Remember
                </span>
            ),
        },
        {
            label: "Table Mode",
            template: () => (
                <span
                    className="text-primary text-slate-900 font-semibold hover:cursor-pointer"
                    onClick={() => navigation("/table-mode")}
                >
                    Table Mode
                </span>
            ),
        },
    ];
    const home = { icon: "pi pi-home", url: `${import.meta.env.VITE_APP_URL}` };

    const [selectOption, setSelectOption] = useState("");

    const options = [
        { value: "idle", label: "Idle" },
        { value: "active", label: "Active" },
        { value: "complete", label: "Completed" },
    ];

    function handleSearch() {
        dates?.filter((dates) => {
            if (!dates) {
                Swal.fire({
                    title: "Opps!",
                    text: "From and To dates are incomplete. Please complete the date range in the requirement. Thank you!",
                    icon: "error",
                });
            }
        });

        const filteredStatus = Object.keys(selectOption).length;

        if (filteredStatus !== 0) {
            let status = `${selectOption.label}`?.toUpperCase();

            let filteredStatus = searchFiltered(allEvents, "", "", status);
            setSearch(filteredStatus);
        }

        if (dates) {
            let [from, to] = dates;

            if (from && to) {
                let cleanDateFiletered = searchFiltered(allEvents, from, to);
                setSearch(cleanDateFiletered);
            }
        }

        if (dates && filteredStatus !== 0) {
            let [from, to] = dates;

            if (from && to) {
                let status = `${selectOption.label}`?.toUpperCase();
                let allFiltered = searchFiltered(allEvents, from, to, status);
                setSearch(allFiltered);
            }
        }
    }

    function handleFilter(option) {
        setSelectOption(option);
    }

    function handleDates(e) {
        let [from, to] = e.target.value;
        setDates(() => {
            return [from, to];
        });
    }

    return (
        <>
            <div className="my-10">
                <BreadCrumb
                    model={items}
                    home={home}
                    className="rounded-[10px]"
                />
            </div>
            {/* <h3 className="text-slate-700">
                {`Calendar Remember Page > Table Mode`}
            </h3> */}

            <div className="bg-gray-700 rounded-2xl w-full relative p-4 shadow-md">
                <div className="flex justify-start items-center flex-wrap relative ">
                    <div className="flex justify-center items-center mt-2 me-2 w-full md:w-[20%] lg:w-[20%] 2xl:w-[20%] ">
                        <Calendar
                            placeholder="From Y/m/d - To Y/m/d"
                            className="h-[40px] w-full showDateRange"
                            value={dates}
                            onChange={(e) => handleDates(e)}
                            selectionMode="range"
                            readOnlyInput
                            hideOnRangeSelection={true}
                        />
                    </div>
                    <div className="flex justify-start items-start mt-2 w-full md:w-[20%] lg:w-[100%] 2xl:w-[25%]">
                        <Select
                            id="selectFilter"
                            className="w-full md:w-[100%] lg:w-[40%] 2xl:w-[80%] me-2"
                            options={options}
                            onChange={handleFilter}
                        />
                    </div>
                    <div className="flex justify-start items-start w-full md:w-[20%] lg:w-[20%] 2xl:w-[50%] 2xl:ms-[-53px] 2xl:mt-2 mt-2">
                        <Button
                            className="h-[40px] w-full md:w-[100%] lg:w-[40%] 2xl:w-[20%] me-2 pi-filter"
                            label="Filter"
                            severity="info"
                            onClick={handleSearch}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default TableHeader;
