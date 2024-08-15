import { addDays, removeMillisecondsAndTimezone } from "../util/dateFormat";

// eslint-disable-next-line no-unused-vars
export function searchFiltered(allArray = [], from = "", to = "", status = "") {
    // note: create_at From and To
    let allFiltered = allArray
        .slice()
        // eslint-disable-next-line no-unused-vars
        .map((value, index, array) => {
            // date range and status
            if (from !== "" && to !== "" && status !== "") {
                let cleaned_created_at = removeMillisecondsAndTimezone(
                    new Date(`${value.created_at}`).toISOString().slice()
                );

                let cleaned_dateFrom = removeMillisecondsAndTimezone(
                    new Date(`${from}`).toISOString()
                );

                let cleaned_dateTo = removeMillisecondsAndTimezone(
                    new Date(`${to}`).toISOString()
                );

                let customDateRangeAndStatus = {};

                let created_at = new Date(`${cleaned_created_at}`);
                let dateFrom = addDays(new Date(`${cleaned_dateFrom}`), 1);
                let dateTo = addDays(new Date(`${cleaned_dateTo}`), 1);

                if (
                    created_at >= dateFrom &&
                    created_at <= dateTo &&
                    value.status === status
                ) {
                    customDateRangeAndStatus = { ...value };
                }

                return customDateRangeAndStatus;
            }
            // date range only

            if (from !== "" && to !== "") {
                // date validation filtered
                let cleaned_created_at = removeMillisecondsAndTimezone(
                    new Date(`${value.created_at}`).toISOString()
                );

                let cleaned_dateFrom = removeMillisecondsAndTimezone(
                    new Date(`${from}`).toISOString()
                );

                let cleaned_dateTo = removeMillisecondsAndTimezone(
                    new Date(`${to}`).toISOString()
                );

                let customFilteredDateRange = {};

                let created_at = new Date(`${cleaned_created_at}`);
                let dateFrom = addDays(new Date(`${cleaned_dateFrom}`), 1);
                let dateTo = addDays(new Date(`${cleaned_dateTo}`), 1);

                if (created_at >= dateFrom && created_at <= dateTo) {
                    customFilteredDateRange = { ...value };
                }

                return customFilteredDateRange;
            }
            // status only
            if (status !== "") {
                let customFilteredStatus = {};
                if (value.status === status) {
                    customFilteredStatus = { ...value };
                }
                return customFilteredStatus;
            }
        })
        .map((value) => {
            // if no validation, should be like this [{},{},{...value}]
            if (value) {
                if (Object.keys(value).length !== 0) {
                    // remove if empty is object
                    return value;
                }
            }

            if (!value) {
                return value;
            }
        })
        .filter((elem) => {
            // remve undefined in array [undefined,1,23,3,{...value}]
            return elem;
        });

    let idsDuplicated = allFiltered.map(({ id }) => id);

    let cleanedDuplicate = allFiltered.filter(
        ({ id }, index) => !idsDuplicated.includes(id, index + 1)
    );

    return cleanedDuplicate;
}
