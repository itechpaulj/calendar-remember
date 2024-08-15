import React from "react";
import { Form, Link, redirect, useNavigate } from "react-router-dom";
import { login } from "../../util/authentication";
import Swal from "sweetalert2";
function Login() {
    localStorage.removeItem("Error_STATUS");
    const navigation = useNavigate();

    return (
        <>
            <div
                className={`mt-12 mx-2 lg:mx-[17rem] md:mx-[10rem] sm:mx-[10rem] `}
            >
                <h3
                    className={`text-slate-950 font-semibold text-md ms-5 relative`}
                >
                    <Link to={`/login`}>Login</Link>
                </h3>

                <div
                    className={`bg-teal-950/50 h-[30rem] w-full mt-8 rounded-[40px] shadow-2xl relative`}
                >
                    <h3
                        className={`text-center pt-14 text-stone-50 font-semibold md:text-1xl lg:text-3xl text-2xl relative`}
                    >
                        Calendar Remember
                    </h3>
                    <img
                        src={`images/cal-icon.png`}
                        className={`absolute top-[7rem] md:top-[7rem] lg:top-[7.5rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-14 `}
                    />
                    <div className={`relative`}>
                        <img
                            src={`images/Bg-calendar-icon.png`}
                            className={`absolute w-[60%] md:w-[100%] lg:w-[50%] top-[8rem] md:top-[10rem] lg:top-[10rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-40 h-[550px] `}
                        />
                    </div>
                    <Form method="post">
                        <div
                            className={`space-y-6 m-5 pt-10 lg:pt-20 md:pt-20`}
                        >
                            <input
                                type="email"
                                name="email"
                                className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                placeholder="Email..."
                            />
                            <input
                                type="password"
                                name="password"
                                className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                placeholder="Password..."
                            />
                        </div>
                        <div
                            className={`flex items-center justify-end  space-x-2 me-6`}
                        >
                            <button
                                type="submit"
                                className={`bg-cyan-950 rounded-[20px] text-slate-5 px-5 py-2 mx-2 my-5 text-slate-50 text-sm relative hover:bg-cyan-900  transition-all duration-75 hover:shadow-md`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={`bg-teal-700 rounded-[20px] text-slate-5 px-5 py-2 mx-2 my-5 text-slate-50 text-sm relative hover:bg-teal-900  transition-all duration-75 hover:shadow-md`}
                                onClick={() => navigation("/register")}
                            >
                                Register
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    );
}

export async function loader() {
    const access_token = localStorage.getItem("ACCESS_TOKEN");

    if (access_token) {
        return redirect("/");
    }
    return null;
}

export async function action({ request }) {
    const formValue = await request.formData();
    const objectEntries = Object.fromEntries(formValue);
    const stored = await login(objectEntries);

    if (stored.status === 200) {
        localStorage.setItem("ACCESS_TOKEN", stored.token_id);
        return redirect("/");
    }
    if (stored.status === 422) {
        Swal.fire({
            title: "Error!",
            text: "Username and password are invalid!",
            icon: "error",
            confirmButtonText: "Closed",
        });
    }

    return null;
}

export default Login;
