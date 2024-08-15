import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import TableModeForm from "./form/TableModeForm";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { deleted } from "../util/axiosCrud";
import { Button } from "primereact/button";

function TableBody({
    search,
    setSearch,
    allEvents,
    setAllEvents,
    dispatch,
    selectorModal,
    modal,
    setUpdateForm,
    updateForm,
    handleUpdateSubmit,
}) {
    console.log(search);
    const allEventsLoad = useSelector((data) => data.user.data);
    const dt = useRef(null);
    const columns = [
        { field: "title", header: "Title" },
        { field: "description", header: "Description" },
        { field: "start", header: "Remember Date" },
        { field: "status", header: "status" },
        { field: "created_by", header: "Created By" },
        { field: "created_at", header: "Created At" },
        { field: "actions", header: "Actions" },
    ];
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    function onGlobalFilterChange(e) {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters["global"].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    }

    // export button
    const cols = [
        { field: "title", header: "Title" },
        { field: "description", header: "Description" },
        { field: "start", header: "Remember Date" },
        { field: "status", header: "status" },
        { field: "created_by", header: "Created By" },
        { field: "created_at", header: "Created At" },
    ];

    const exportColumns = cols.map((col) => ({
        title: col.header,
        dataKey: col.field,
    }));
    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };
    const exportPdf = () => {
        import("jspdf").then((jsPDF) => {
            import("jspdf-autotable").then(() => {
                const doc = new jsPDF.default(0, 0);

                doc.autoTable(exportColumns, search);
                doc.save("calendar_remember.pdf");
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            // Remove the 'id' column from the data
            const filteredData = search.map(({ id, ...rest }) => rest);

            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ["data"],
            };
            const excelBuffer = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            saveAsExcelFile(excelBuffer, "calendar_remember");
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import("file-saver").then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                let EXCEL_EXTENSION = ".xlsx";
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE,
                });

                module.default.saveAs(
                    data,
                    fileName +
                        "_export_" +
                        new Date().getTime() +
                        EXCEL_EXTENSION
                );
            }
        });
    };

    function renderHeader() {
        return (
            <div className="flex justify-end items-end space-x-2 2xl:flex-wrap lg:flex-nowrap md:flex-wrap sm:flex-wrap flex-wrap">
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        className="2xl:mb-0 lg:mb-0 md:mb-0 sm:mb-0 mb-3"
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Keyword Search ..."
                    />
                </IconField>

                <div className="space-x-2">
                    <Button
                        type="button"
                        icon="pi pi-file"
                        rounded
                        onClick={() => exportCSV(false)}
                        data-pr-tooltip="CSV"
                    />
                    <Button
                        type="button"
                        icon="pi pi-file-excel"
                        severity="success"
                        rounded
                        onClick={exportExcel}
                        data-pr-tooltip="XLS"
                    />
                    <Button
                        type="button"
                        icon="pi pi-file-pdf"
                        severity="warning"
                        rounded
                        onClick={exportPdf}
                        data-pr-tooltip="PDF"
                    />
                </div>
            </div>
        );
    }

    const header = renderHeader();

    function rowColumnClick(rowData, formType) {
        let { id } = rowData;
        switch (formType) {
            case "update":
                dispatch(modal(!selectorModal));

                const filteredEvent = allEventsLoad.find(
                    (event) => id === event.id
                );

                setUpdateForm(filteredEvent);

                break;
            case "delete":
                Swal.fire({
                    title: "Are you sure you want to delete this data?",
                    showDenyButton: false,
                    showCancelButton: true,
                    confirmButtonText: "Delete",
                    denyButtonText: `Don't save`,
                    icon: "warning",
                }).then(async (result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        let allDeleted = allEvents
                            .slice()
                            .map((value, _) => {
                                return `${value.id}` !== `${id}` ? value : null;
                            })
                            .filter((elem) => elem);

                        setSearch(allDeleted);
                        setAllEvents(allDeleted);

                        const response = await deleted(rowData);

                        if (response?.status === 200) {
                            Swal.fire({
                                title: "Success!",
                                text: "Successfully deleted!",
                                icon: "success",
                            });

                            dispatch(modal(false));
                            setUpdateForm(null);
                        }
                    }

                    if (result.isDenied) {
                        Swal.fire("Changes are not saved", "", "info");
                    }
                });
                break;
            default:
                console.log("Action Unknown [Form Type - Table index]");
        }
    }

    function handleAction(rowData, column) {
        return (
            <div className="flex justify-start items-start space-x-3">
                <Button
                    onClick={() => rowColumnClick(rowData, "update")}
                    className=""
                    severity="warning"
                    label=""
                    icon="pi pi-pencil"
                />

                <Button
                    onClick={() => rowColumnClick(rowData, "delete")}
                    className=""
                    severity="danger"
                    label=""
                    icon="pi pi-trash"
                />
            </div>
        );
    }

    console.log(search, allEvents);
    return (
        <>
            {selectorModal && (
                <TableModeForm
                    dispatch={dispatch}
                    selectorModal={dispatch}
                    modal={modal}
                    updateForm={updateForm}
                    setUpdateForm={setUpdateForm}
                    handleUpdateSubmit={handleUpdateSubmit}
                />
            )}
            <div
                className={`mt-3 w-full ${
                    allEvents?.length === 0
                        ? allEvents?.length >= 1
                            ? "deferloading h-[800px] my-10"
                            : ""
                        : ""
                }`}
            >
                <DataTable
                    ref={dt}
                    className={`tableDefaultTheme`}
                    value={search.filter(
                        (object) => Object.keys(object).length > 0
                    )}
                    tableStyle={{ minWidth: "50rem" }}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    header={header}
                    dataKey="id"
                    filters={filters}
                    emptyMessage="No Data Available."
                >
                    {columns.map((col, i) => {
                        if (col?.field === "actions") {
                            return (
                                <Column
                                    key={`${col.field}`}
                                    field={col.field}
                                    header={col.header}
                                    body={handleAction}
                                />
                            );
                        }
                        if (col?.field !== "actions") {
                            return (
                                <Column
                                    key={`${col.field}`}
                                    field={col.field}
                                    header={col.header}
                                />
                            );
                        }
                    })}
                </DataTable>
            </div>
        </>
    );
}

export default memo(TableBody);
