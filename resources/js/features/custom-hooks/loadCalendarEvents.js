import { getLoad } from "../util/axiosCrud";

export async function loadCalendarEvents() {
    try {
        const response = await getLoad();
        if (response?.status === 200) {
            const loadAll = response.data.data;
            const data = loadAll.map((value) => {
                let {
                    title,
                    description,
                    created_by,
                    start,
                    //end,
                    status,
                    custom_id: id,
                    created_at,
                } = value;
                let modifiedStart = `${start}`.replace(" ", "T");
                //let modifiedEnd = `${end}`.replace(" ", "T");

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

                return {
                    title,
                    description,
                    created_by,
                    end: modifiedStart,
                    start: modifiedStart,
                    status,
                    className: className,
                    created_at,
                    id,
                };
            });

            return data;
        }
    } catch (error) {
        if (error.status === 401) {
            window.location.href = "/login";
        }
        console.log(error);
        // if (error instanceof Error) {
        //     throw new Error(`${error}`);
        // }
    }
}
