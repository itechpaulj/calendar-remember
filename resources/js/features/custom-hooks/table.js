import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    readableHumanDate,
    removeMillisecondsAndTimezone,
} from "../util/dateFormat";
import { loadCalendarEvents } from "./loadCalendarEvents";
import { load } from "../userSlice";

export function tableMode() {
    const [remember, setRemember] = useState([]);
    const dispatch = useDispatch();
    // load all data
    useEffect(
        function () {
            async function loaded() {
                try {
                    const response = await loadCalendarEvents();

                    dispatch(load(response));
                    const iniatialData = response.slice().map((value) => {
                        const {
                            title,
                            description,
                            start,
                            created_at,
                            created_by,
                            status,
                            id,
                        } = value;
                        const custom_date = readableHumanDate(`${start}`);
                        const remove_milisecods_created_at =
                            removeMillisecondsAndTimezone(`${created_at}`);
                        return {
                            id,
                            title,
                            description,
                            start: `${custom_date}`,
                            created_by,
                            created_at: remove_milisecods_created_at,
                            status: `${status}`.toUpperCase(),
                        };
                    }); // copy slice the array and return new array inside object
                    setRemember(iniatialData);
                } catch (error) {
                    console.log(error);
                }
            }
            return () => {
                loaded();
            };
        },
        [loadCalendarEvents, dispatch, load]
    );

    return {
        remember,
    };
}
