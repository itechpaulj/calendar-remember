export function isoFormat(dateString) {
    // Y-m-d h:i:s - dateString
    let date = `${dateString}`.split(" ");

    let getFullYear = date[0]?.split("-");
    let getDateTime = date[1]?.split(":");

    if (getFullYear && getDateTime) {
        let startYear = `${parseInt(getFullYear[0])}`.padStart(2, 0);
        let monthStart = `${parseInt(getFullYear[1])}`.padStart(2, 0);
        let dayStart = `${parseInt(getFullYear[2])}`.padStart(2, 0);
        let hourStart = `${parseInt(getDateTime[0])}`.padStart(2, 0);
        let minsStart = `${parseInt(getDateTime[1])}`.padStart(2, 0);
        let secStart = `${parseInt(getDateTime[2])}`.padStart(2, 0);

        let isoFormat = `${startYear}-${monthStart}-${dayStart}T${hourStart}:${minsStart}:${secStart}`;
        // return @value Y-m-dTH:i:s
        return isoFormat;
    }

    if (!date) {
        console.warn("error", date);
    }
}

export function removeMillisecondsAndTimezone(dateString) {
    // Split the string at the dot and keep the first part
    // sample format "2024-07-11T00:00:00.000000Z";
    /*
        we just a trick if a convert isoString something wrong showing date
        always backwards minus one
        make it simple 01-20-2024 to 01-19-2024.
        01-19-2024 wrong convert isoString js format. 
        we just simply and modified 
        tricky and dirty tricks also
    */
    const removeMilisecods = `${dateString}`?.split(".")[0];
    const getDate = `${removeMilisecods}`.split("T")[0];
    const year = `${getDate}`.split("-")[0];
    const month = `${getDate}`.split("-")[1];
    const day = +`${getDate}`.split("-")[2] + 1;

    // return @y-m-d
    let finalDate = `${year}-${month}-${day}`;
    return finalDate;
}

export function getFullDate(dateString) {
    //dateString = Y-m-dTH:i:s

    /*
        we just a trick if a convert isoString something wrong showing date
        always backwards minus one
        make it simple 01-20-2024 to 01-19-2024.
        01-19-2024 wrong convert isoString js format. 
        we just simply and modified 
        tricky and dirty tricks also
    */
    let getDate = `${dateString}`?.split("T")[0];
    let year = `${getDate}`.split("-")[0];
    let month = `${getDate}`.split("-")[1];
    let day = +`${getDate}`.split("-")[2] + 1;

    let finalDate = `${year}-${month}-${day}`;
    // return value Y-m-d
    return finalDate;
}

export function readableHumanDate(isDateString) {
    // isoFormat js mdi api string
    // isDateString: sample format "2024-07-11T00:00:00.000000Z";
    const option = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const date = new Date(`${isDateString}`).toLocaleDateString(option);
    // return y-m-d
    return date;
}

export function addDays(date, incrementDays) {
    const oneDayInMs = 86400 * 1000;

    const addDays = new Date(
        Date.parse(`${date}`) + incrementDays * oneDayInMs
    );

    return addDays;
}
