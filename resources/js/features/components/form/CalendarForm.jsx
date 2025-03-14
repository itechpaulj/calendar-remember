import { Button } from "primereact/button";
import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
function CalendarForm({
    handleCalendarSubmit,
    selectorModal,
    headerDate,
    dispatch,
    modal,
    formType,
    showData,
}) {
    const [value, setValue] = useState({}); // showing if were updating the data [Update modal] is true
    const [optionSelect, setOptionSelect] = useState();
    let { title, description, id, status } = value;
    const options = [
        { value: "idle", label: "Idle" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
    ];
    useEffect(function () {
        if (formType.update) {
            setValue(() => showData);
        }

        if (formType.store) {
            setValue({});
        }
    }, []);

    const optionCallBack = useCallback(
        function () {
            let selectedValue = options.find(
                (option) => option.value === `${status}`.toLowerCase()
            );
            if (selectedValue) {
                setOptionSelect(selectedValue);
            }
        },
        [status, setOptionSelect]
    );

    useEffect(
        function () {
            optionCallBack();
        },
        [optionCallBack]
    );

    return (
        <>
            {/* Modal Form */}
            <form
                method="POST"
                onSubmit={handleCalendarSubmit}
                className={`${
                    selectorModal ? "" : "hidden"
                } formCalendarStored`}
            >
                <input type="hidden" name="start" defaultValue={headerDate} />
                {formType.update && (
                    <>
                        <input
                            type="hidden"
                            name="update"
                            defaultValue={`${id}`}
                        />
                        <input
                            type="hidden"
                            name="status"
                            defaultValue={`${status}`.toLowerCase()}
                        />
                    </>
                )}
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-9 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {formType.update ? "Update" : "Add"}
                                    </h3>
                                    <div>
                                        <p className="text-gray-900 text-md font-medium">
                                            <b>Date:</b> {headerDate}
                                        </p>
                                    </div>

                                    <div className="mt-2 w-full">
                                        <label
                                            htmlFor="title-stored"
                                            className="ms-4 font-semibold text-sm text-slate-950"
                                        >
                                            TITLE
                                        </label>
                                        <input
                                            id="title-stored"
                                            name="title"
                                            className="bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full px-5 m-2 py-2"
                                            type="text"
                                            placeholder="Input your awesome idea here ..."
                                            defaultValue={
                                                formType.update ? title : ""
                                            }
                                        />
                                        <span className="title-error bg-red-300 rounded-[30px] text-slate-50 mx-3 mt-3 w-full flex item-center justify-center ms-[8.5px]"></span>
                                    </div>
                                    <div className="mt-2 w-full">
                                        <label
                                            htmlFor="description-stored"
                                            className="ms-4 font-semibold text-sm text-slate-950"
                                        >
                                            DESCRIPTION
                                        </label>
                                        <textarea
                                            id="description-stored"
                                            name="description"
                                            className="bg-slate-300 rounded-[10px] text-slate-50 placeholder:text-slate-50 w-full px-5 m-2 py-2"
                                            type="text"
                                            placeholder="Input your descriptive idea here.."
                                            defaultValue={
                                                formType.update
                                                    ? description
                                                    : ""
                                            }
                                        />
                                        <span className="description-error bg-red-300 rounded-[30px] text-slate-50 mx-3 mt-1 w-full flex item-center justify-center ms-[8.5px]"></span>
                                    </div>
                                    {formType.update && (
                                        <>
                                            <div className="mt-2 w-full mx-6 ms-[7px]">
                                                <label
                                                    htmlFor="status-stored"
                                                    className="ms-0 font-semibold text-sm text-slate-950"
                                                >
                                                    STATUS
                                                </label>
                                                <Select
                                                    name="status"
                                                    id="status-stored"
                                                    options={options}
                                                    value={optionSelect}
                                                    onChange={(option) =>
                                                        setOptionSelect(option)
                                                    }
                                                    menuPortalTarget={
                                                        document.body
                                                    }
                                                    styles={{
                                                        menuPortal: (base) => ({
                                                            ...base,
                                                            zIndex: 9999,
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                                    <Button
                                        className="px-4 py-2"
                                        type="submit"
                                        severity="info"
                                        label="Submit"
                                    />
                                </span>
                                <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                                    <Button
                                        className="px-4 py-2"
                                        type="button"
                                        severity="danger"
                                        label="Close"
                                        onClick={() =>
                                            dispatch(modal(!selectorModal))
                                        }
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default CalendarForm;
