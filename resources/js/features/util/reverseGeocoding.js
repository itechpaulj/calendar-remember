const URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

async function hasNavigator() {
    function getLocation() {
        return new Promise((resolve, reject) => {
            return navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    return getLocation().then((data) => {
        const location = data;
        const { latitude, longitude } = location.coords;
        return {
            latitude: latitude,
            longitude: longitude,
        };
    });
}

export default async function reverseGeocoding() {
    try {
        const showLocation = await hasNavigator();
        const { latitude, longitude } = showLocation;
        const bidDataCloud = await fetch(
            `${URL}?latitude=${latitude}&longitude=${longitude}`
        );
        const data = await bidDataCloud.json();
        return data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`${err.message}`);
        }
    }
}
