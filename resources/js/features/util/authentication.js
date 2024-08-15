import axiosFetch from "../../axiosFetch";
import { getCsrfToken } from "./sanctumCsrfToken";

const endPoints = {
    register: `register/add`,
    login: `login/success`,
    authenticated: `user`,
    authInfo: `remember/auth-info`,
    authUpdate: `remember/auth-update`,
    logout: `remember/logout`,
};

export async function register(formValue) {
    try {
        const response = await axiosFetch.post(
            `${endPoints.register}`,
            formValue
        );
        return response.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`${err.message}`);
        }
    }
}

export async function login(formValue) {
    try {
        await getCsrfToken();
        const response = await axiosFetch.post(`${endPoints.login}`, formValue);

        return response.data;
    } catch (err) {
        if (err.response.status === 401) {
            localStorage.removeItem("ACCESS_TOKEN");
        }
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}

export async function isAuthenticated() {
    try {
        const response = await axiosFetch.get(`${endPoints.authenticated}`);
        return response;
    } catch (err) {
        if (err.response.status === 401) {
            window.location.href = "/login";
            localStorage.removeItem("ACCESS_TOKEN");
        }
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}

export async function authGetUser(formValue) {
    try {
        const response = await axiosFetch.patch(
            `${endPoints.authInfo}`,
            formValue
        );

        return response;
    } catch (err) {
        if (err.response.status === 401) {
            window.location.href = "/login";
            localStorage.removeItem("ACCESS_TOKEN");
        }
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}

export async function authGetUserUpdate(formValue) {
    try {
        const response = await axiosFetch.patch(
            `${endPoints.authUpdate}`,
            formValue
        );

        return response;
    } catch (err) {
        if (err.response.status === 401) {
            window.location.href = "/login";
            localStorage.removeItem("ACCESS_TOKEN");
        }
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}

export async function logout() {
    try {
        const response = await axiosFetch.post(`${endPoints.logout}`);
        localStorage.removeItem("ACCESS_TOKEN");
        return response;
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}
