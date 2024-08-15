import axiosFetch from "../../axiosFetch";

const endPoints = {
    stored: "remember/add",
    load: "remember/load",
    update: "remember/update",
    deleted: "remember/delete",
};

export async function getLoad() {
    try {
        const response = await axiosFetch.get(`${endPoints.load}`);
        return response;
    } catch (err) {
        if (err.response.status === 401) {
            localStorage.removeItem("ACCESS_TOKEN");
        }
    }
}

export async function postStored(formValue) {
    try {
        const response = await axiosFetch.post(
            `${endPoints.stored}`,
            formValue
        );
        return response.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`${err.message}`);
        }
    }
}

export async function patchUpdated(formValue) {
    try {
        const response = await axiosFetch.patch(
            `${endPoints.update}`,
            formValue
        );
        return response.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`${err.message}`);
        }
    }
}

export async function deleted(formValue) {
    try {
        const response = await axiosFetch.delete(
            `${endPoints.deleted}/${formValue.id}`,
            formValue
        );
        return response.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`${err.message}`);
        }
    }
}
