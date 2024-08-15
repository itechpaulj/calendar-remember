import React, { useState } from "react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import Select from "react-select";

function TableHeader() {
    const [dates, setDates] = useState(null);
    const [selectOption, setSelectOption] = useState("");

    const [selectDate, setSelectDate] = useState([new Date(), new Date()]);

    const options = [
        { value: "idle", label: "Idle" },
        { value: "active", label: "Active" },
        { value: "complete", label: "Completed" },
    ];

    function handleFilter(option) {
        setSelectOption(option);
    }

    return (
        <>
            <h3 className="text-slate-700">
                {`Calendar Remember Page > Table Mode`}
            </h3>

            <div className="bg-gray-700 rounded-2xl w-full relative p-4">
                <div className="flex flex-wrap justify-start space-y-4">
                    <div className="flex items-center w-full md:w-[50%] md:mx-0">
                        <label
                            htmlFor="dateRange"
                            className="text-nowrap hidden lg:block text-white mt-5"
                        >
                            Date Range:
                        </label>
                        <DateRangePicker
                            id="dateRange"
                            className="bg-slate-300 rounded-md py-[5px] font-semibold md:text-base w-[400px] md:w-[320px] md:px-[40px] md:mt-4 md:me-3 lg:px-16"
                            onChange={setSelectDate}
                            value={selectDate}
                        />
                    </div>
                    <div className="flex items-center w-full md:w-[50%] md:mx-0 md:me-[-3px]">
                        <label
                            htmlFor="selectFilter"
                            className="hidden lg:block text-white"
                        >
                            Filter:
                        </label>
                        <Select
                            id="selectFilter"
                            className="w-[400px] md:w-[350px]"
                            options={options}
                            onChange={handleFilter}
                        />
                    </div>
                    <div className="flex items-center w-full">
                        <button className="bg-blue-950 rounded-2xl text-slate-50 px-5 py-2 hover:bg-blue-800 w-full ">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TableHeader;
