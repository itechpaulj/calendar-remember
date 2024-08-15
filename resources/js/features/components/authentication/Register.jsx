import React, { useState } from "react";
import { Form, Link, redirect, useNavigate } from "react-router-dom";
import reverseGeocoding from "../../util/reverseGeocoding";
import Swal from "sweetalert2";
import { register } from "../../util/authentication";

function Register() {
    localStorage.removeItem("Error_STATUS");
    const navigation = useNavigate();
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    async function getAddress() {
        const reverseGeo = await reverseGeocoding();
        const fullLocation = `${
            reverseGeo.city
        }, ${reverseGeo.countryName.replace(" (the)", "")}`;
        setLocation(() => fullLocation);
        setLatitude(() => reverseGeo.latitude);
        setLongitude(() => reverseGeo.longitude);
    }

    return (
        <>
            <div
                className={`mt-12 mx-2 lg:mx-[17rem] md:mx-[10rem] sm:mx-[5rem] `}
            >
                <h3 className={`text-slate-950 font-semibold text-md ms-5`}>
                    <Link to={`/`}>Login</Link> {` > `}
                    <Link to={`/register`}>Register</Link>
                </h3>
                <div
                    className={`bg-teal-950/50 w-full mt-4 rounded-[40px] shadow-2xl relative h-full my-10`}
                >
                    <h3
                        className={`text-center pt-12 text-stone-50 font-semibold md:text-1xl lg:text-3xl text-2xl relative`}
                    >
                        Sign Up
                    </h3>
                    <div className={`relative`}>
                        <img
                            src={`images/Bg-calendar-icon.png`}
                            className={`absolute w-[60%] md:w-[100%] lg:w-[60%] top-[16rem] sm:top-[16rem] md:top-[10rem] lg:top-[15rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-40 h-[700px] `}
                        />
                    </div>
                    <Form method="POST">
                        <div
                            className={`space-y-6 m-5 pt-10 lg:pt-10 md:pt-20 relative`}
                        >
                            <div className={`email-input`}>
                                <input
                                    type="email"
                                    name="email"
                                    className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                    placeholder="Enter your Email..."
                                />

                                <span
                                    className={`text-red-50 error-email`}
                                ></span>
                            </div>
                            <div className="flex items-center justify-end relative location-input">
                                <input
                                    type="text"
                                    name="location"
                                    className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                    placeholder="Enter your Country / City..."
                                    defaultValue={location}
                                />
                                <input
                                    type="hidden"
                                    name="latitude"
                                    defaultValue={latitude}
                                />
                                <input
                                    type="hidden"
                                    name="longitude"
                                    defaultValue={longitude}
                                />
                                {location === "" && (
                                    <button
                                        type="button"
                                        className={`absolute bg-blue-900 rounded-[40px] mx-[1rem] px-6 py-2 hover:bg-blue-800 text-slate-50 transition-all duration-75`}
                                        onClick={() => getAddress()}
                                    >
                                        Get Location
                                    </button>
                                )}
                            </div>
                            <span className={`error-location relative`}></span>
                            <div className={`fullname-input`}>
                                <input
                                    type="text"
                                    name="fullname"
                                    className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                    placeholder="Enter your Fullname..."
                                    pattern="[^\d]*"
                                    title="Please enter text without numbers"
                                />
                                <span className={`error-fullname`}></span>
                            </div>
                            <div className={`password-input`}>
                                <input
                                    type="password"
                                    name="password"
                                    className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                    placeholder="Enter your Password..."
                                />
                                <span className={`error-password`}></span>
                            </div>
                            <div className={`password_confirmation-input`}>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    className={`w-full rounded-[100px] h-14 bg-slate-300 placeholder:text-slate-50 px-5 text-gray-50 opacity-90 shadow-md`}
                                    placeholder="Enter your Confirm Password..."
                                />
                                <span
                                    className={`error-password_confirmation`}
                                ></span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center justify-end space-x-2 me-4 mt-[2rem]`}
                        >
                            <button
                                type="submit"
                                className={`bg-teal-700 rounded-[20px] text-slate-5 px-10 py-2 mx-2 my-5 text-slate-50 text-sm relative hover:bg-teal-600  transition-all duration-75 hover:shadow-md mt-[5px]`}
                            >
                                Sumbit
                            </button>

                            <div className={`mt-[-1rem]`}>
                                <p
                                    className={`mb-[10px] text-[10px] font-medium text-slate-50 ms-[0.90rem]`}
                                >
                                    Already Registered?
                                </p>
                                <button
                                    type="button"
                                    className={`bg-red-900 rounded-[20px] text-slate-5 px-10 py-2 mx-2 my-5 mt-[-10px] text-slate-50 text-sm relative hover:bg-red-800  transition-all duration-75 hover:shadow-md`}
                                    onClick={() => navigation(-1)}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    );
}

export async function loader() {
    const token = localStorage.getItem("ACCESS_TOKEN");

    if (token) {
        return redirect("/");
    }

    if (!token) {
        console.log("Not authenticated!");
        localStorage.removeItem("ACCESS_TOKEN");
    }

    return null;
}

export async function action({ request }) {
    const formData = await request.formData();
    const objectForm = Object.fromEntries(formData);
    console.log(objectForm);
    const stored = await register(objectForm);

    if (stored.status === 422) {
        errorMessage(stored.validate_err);
    }

    if (stored.status === 200) {
        Swal.fire({
            title: "Success!",
            text: "A new account has been successfully created!",
            icon: "success",
            confirmButtonText: "Closed",
        });

        document.querySelector(`.error-email`).innerHTML = "";
        document.querySelector(`.error-location`).innerHTML = "";
        document.querySelector(`.error-fullname`).innerHTML = "";
        document.querySelector(`.error-password`).innerHTML = "";
        document.querySelector(`.error-password_confirmation`).innerHTML = "";

        document.querySelector(`input[name="email"]`).value = "";
        document.querySelector(`input[name="location"]`).value = "";
        document.querySelector(`input[name="latitude"]`).value = "";
        document.querySelector(`input[name="longitude"]`).value = "";
        document.querySelector(`input[name="fullname"]`).value = "";
        document.querySelector(`input[name="password"]`).value = "";
        document.querySelector(`input[name="password_confirmation"]`).value =
            "";
    }
    return null;
}

function errorMessage(errorArrayMessage) {
    let array_name_error_key = Object.entries(errorArrayMessage);
    for (const [key, value] of array_name_error_key) {
        if (key) {
            document.querySelector(
                `.error-${key}`
            ).innerHTML = `<ul class='bg-red-500 rounded-md mx-5 mt-3 text-slate-50 p-1 shadow-md'>${value}</ul>`;

            if (!key === "password" && !key === "password_confirmation") {
                const exist_value = document.querySelector(
                    `input[name=${key}]`
                ).value;
                if (exist_value) {
                    document.querySelector(`.error-${key}`).innerHTML = ``;
                }
            }
        }
    }
}

export default Register;
