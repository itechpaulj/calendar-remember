import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";

function Error() {
    const error = useRouteError();
    const navigation = useNavigate();

    return (
        <>
            <p>Something went wrong.</p>
            <p>{`${error}`}</p>
            <button onClick={() => navigation(-1)}>Go Back</button>
        </>
    );
}

export default Error;
