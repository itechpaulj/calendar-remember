import axios from "axios";
export async function getCsrfToken() {
    await axios.get("/sanctum/csrf-cookie");
}
