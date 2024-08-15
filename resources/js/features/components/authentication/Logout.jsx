import React, { useEffect, useRef } from "react";
import { logout } from "../../util/authentication";
import { redirect } from "react-router-dom";

function Logout() {
    return (
        <>
            <p>Logout Processing ...</p>
        </>
    );
}

export async function loader() {
    const response = await logout();

    return redirect("/login");
}

export default Logout;
