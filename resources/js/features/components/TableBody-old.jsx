import React, { memo, useCallback, useEffect, useState } from "react";
import { tableMode } from "../custom-hooks/table";
import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
} from "@table-library/react-table-library";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";

function TableBody() {
    const [allEvents, setAllEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0); // Track current page
    const theme = useTheme({
        HeaderRow: `
            background-color: #eaf5fd;
        `,
        BaseCell: `
            margin: 6px;
            padding: 11px;
            border-radius: 5px;
            display:flex;
            justify-content: center;
            align-items: center;
            flex: flex-wrap;
      `,
        Row: `
        &:nth-of-type(odd) {
            background-color: #d2e9fb;
            padding: 3px 2px;

        }
        &:nth-of-type(even) {
            background-color: #eaf5fd;
            padding: 3px 2px;
        }
        &:hover {
          color: #fafafa;
          background-color: #71717a;
        }
        `,
    });

    const { remember } = tableMode();

    useEffect(() => {
        setAllEvents(remember);
    }, [remember]);

    function handleSearch(e) {
        setSearchTerm(e.target.value);
    }

    const filteredData = allEvents.filter((item) => {
        const search = `${searchTerm}`.toLowerCase();
        return (
            item.title?.toLowerCase()?.includes(search) ||
            item.description?.toLowerCase()?.includes(search) ||
            item.start?.toLowerCase()?.includes(search) ||
            item.created_at?.toLowerCase()?.includes(search) ||
            item.created_by?.toLowerCase()?.includes(search)
        );
    });

    // pagination controll
    const LIMIT = 2;

    const paginatedData = filteredData.slice(
        currentPage * LIMIT,
        currentPage * LIMIT + LIMIT
    );

    const data = {
        nodes: paginatedData,
        pageInfo: {
            totalPages: Math.ceil(filteredData.length / LIMIT),
        },
    };

    const pagination = usePagination(
        data,
        {
            state: {
                page: 0,
                size: LIMIT,
            },
            onChange: onPaginationChange,
        },
        {
            isServer: true,
        }
    );

    function onPaginationChange(action, state) {
        setCurrentPage(state.page); // Update current page state
    }

    return (
        <>
            <div className="bg-gray-700 h-[900px] w-[100%] rounded-[40px] px-10 py-5 mt-10 text-slate-900">
                <div className="mb-10 flex justify-end items-end">
                    <input
                        className="bg-slate-300 rounded-[10px] text-slate-50 placeholder:text-slate-50 px-5 m-2 py-2"
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="relative overflow-x-auto mx-[-20px] h-[700px]">
                    <div className="mt-2 px-3 ">
                        <Table
                            className="absolute w-[2250px]"
                            data={data}
                            theme={theme}
                        >
                            {(tableList) => (
                                <>
                                    <Header>
                                        <HeaderRow>
                                            <HeaderCell>Title</HeaderCell>
                                            <HeaderCell>Description</HeaderCell>
                                            <HeaderCell>
                                                Remember Date
                                            </HeaderCell>
                                            <HeaderCell>Created By</HeaderCell>
                                            <HeaderCell>Created At</HeaderCell>
                                            <HeaderCell>Action</HeaderCell>
                                        </HeaderRow>
                                    </Header>
                                    <Body>
                                        {tableList.map((item) => (
                                            <Row key={item.id} item={item}>
                                                <Cell>{item.title}</Cell>
                                                <Cell className="text-wrap">
                                                    {item.description}
                                                </Cell>
                                                <Cell>{item.start}</Cell>
                                                <Cell>{item.created_by}</Cell>
                                                <Cell>{item.created_at}</Cell>
                                                <Cell>
                                                    <button>Update</button>
                                                    &nbsp;
                                                    <button>Delete</button>
                                                </Cell>
                                            </Row>
                                        ))}
                                    </Body>
                                </>
                            )}
                        </Table>
                        {data.pageInfo && (
                            <div className="relative">
                                <div className="absolute w-[2200px]">
                                    <span className="font-semibold text-slate-50 flex justify-start items-center mt-1">
                                        <p className="ms-4">
                                            Total Pages:{" "}
                                            {data.pageInfo.totalPages}
                                        </p>
                                    </span>
                                    <span className="font-semibold flex justify-end items-center me-[-50px]">
                                        {Array.from(
                                            {
                                                length: data.pageInfo
                                                    .totalPages,
                                            },
                                            (_, index) => (
                                                <div
                                                    className="flex justify-end items-center"
                                                    key={`${index}`}
                                                >
                                                    <button
                                                        className={`
                                        ${` px-5 py-2 rounded-[20px] hover:bg-teal-600 mt-[-30px]`} 
                                        ${
                                            pagination.state.page === index
                                                ? "bg-green-400"
                                                : "bg-green-800/70"
                                        }
                                        `}
                                                        key={`${index}`}
                                                        type="button"
                                                        style={{
                                                            fontWeight:
                                                                pagination.state
                                                                    .page ===
                                                                index
                                                                    ? "bold"
                                                                    : "normal",
                                                        }}
                                                        onClick={() =>
                                                            pagination.fns.onSetPage(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        {index + 1}
                                                    </button>
                                                    &nbsp;
                                                </div>
                                            )
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(TableBody);
