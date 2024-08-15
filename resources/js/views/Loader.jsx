import React from "react";

function Loader() {
    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-slate-100/40 backdrop-blur-0 z-[9999]">
                <div className="loader"></div>
            </div>
        </>
    );
}

export default Loader;
