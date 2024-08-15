import React, { useEffect, useRef, useState } from "react";
import { authGetUser, authGetUserUpdate } from "../../util/authentication";
import Loader from "../../../views/Loader";
import reverseGeocoding from "../../util/reverseGeocoding";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { FileUpload } from "primereact/fileupload";
import Swal from "sweetalert2";
import { BreadCrumb } from "primereact/breadcrumb";
import { TieredMenu } from "primereact/tieredmenu";
function AccountProfile() {
    const navigation = useNavigate();
    const home = { icon: "pi pi-home", url: `${import.meta.env.VITE_APP_URL}` };

    const items = [
        {
            label: "Calendar Remember",
            icon: "pi pi-user-plus",
            template: () => (
                <span
                    className="text-primary text-slate-900 hover:cursor-pointer"
                    onClick={() => navigation("/")}
                >
                    Calendar Remember
                </span>
            ),
        },
        {
            label: "Account Profile",
            template: () => (
                <span
                    className="text-primary text-slate-900 font-semibold hover:cursor-pointer"
                    onClick={() => navigation("/account-profile")}
                >
                    Account Profile
                </span>
            ),
        },
    ];

    const [user, setUser] = useState("");
    const locationUseRef = useRef(null);
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const fileUpload = useRef(null); // dom fileUpload
    const [image, setImage] = useState(null);
    const [disabledUpload, setDisableUpload] = useState(false);

    const [error, setError] = useState([]);

    useEffect(function () {
        async function getAuthUser() {
            const auth = await authGetUser();

            if (auth.status === 200) {
                setUser(auth.data);
                setImage(auth?.data?.data?.avatar);
            }
        }
        getAuthUser();
    }, []);

    async function getAddress() {
        const reverseGeo = await reverseGeocoding();
        const fullLocation = `${
            reverseGeo.city
        }, ${reverseGeo.countryName.replace(" (the)", "")}`;
        setLocation(() => fullLocation);
        setLatitude(() => reverseGeo.latitude);
        setLongitude(() => reverseGeo.longitude);

        if (locationUseRef.current) locationUseRef.current.value = fullLocation;
    }

    const customBase64Uploader = async (event) => {
        // convert file to base64 encoded
        const file = event?.files[0];
        const reader = new FileReader();
        let blob = await fetch(file?.objectURL).then((r) => r.blob()); //blob:url

        reader.readAsDataURL(blob);

        reader.onloadend = function () {
            const base64data = reader?.result;
            if (`${base64data}`.split(";")[0] !== "data:text/html") {
                setTimeout(() => {
                    setImage(`${base64data}`);
                    setDisableUpload(true);
                }, 1500);
            }
        };
    };

    async function handleAuthSubmit(e) {
        e.preventDefault();

        const target = e.target;
        const formData = new FormData(target);
        const objectEntries = Object.fromEntries(formData);

        let newObjectAuthSubmit = {
            ...objectEntries,
            ...(latitude !== "" &&
                longitude !== "" && {
                    latitude,
                    longitude,
                }),
            avatar: image,
        };

        const response = await authGetUserUpdate(newObjectAuthSubmit);

        if (response) {
            if (response?.data?.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "You have successfully updated in your account!",
                    icon: "success",
                });
                window.location.href = "/";
            }

            if (response?.data?.auth_message === "Invalid password") {
                Swal.fire({
                    title: "Oops!",
                    text: "Invalid Password!",
                    icon: "error",
                });
            }

            if (response?.data?.status === 422) {
                setError(() => [response?.data?.validate_err]);
                errorMessage(response?.data?.validate_err);
            }
        }
    }

    function handleonChangeUpload() {
        let p_upload = document.querySelector(".p-fileupload");
        let p_upload_choose = p_upload.querySelectorAll(".p-fileupload-choose");

        [...p_upload_choose].forEach((elem, _) => {
            setTimeout(() => {
                let fileName = elem.querySelector(".p-clickable");

                if (fileName.textContent) {
                    let MAX_LIMIT_PER_EACH_WORDS = 10;
                    let lastDot = `${fileName.textContent}`.lastIndexOf(".");
                    let nameFiled = `${fileName.textContent}`.substring(
                        0,
                        lastDot
                    );
                    let ext = `${fileName.textContent}`.substring(lastDot + 1);
                    let replaceFileLongName = nameFiled.slice(
                        0,
                        MAX_LIMIT_PER_EACH_WORDS
                    );
                    let newNamed = `${replaceFileLongName}.${ext}`;

                    if (nameFiled.length > MAX_LIMIT_PER_EACH_WORDS) {
                        fileName.textContent = `${newNamed}`;
                    }

                    if (`${fileUpload?.current?.upload()}` !== "undefined") {
                        setImage(fileUpload?.current?.upload());
                    }
                }
                // note: we need delay, to get exact file name upload image
            }, 0);
        });
    }

    return (
        <>
            {!user && <Loader />}
            <div className="mx-10 mt-10 ">
                <div
                    className={`my-2 w-full ${
                        user === "" ? "deferloading" : ""
                    }`}
                >
                    <BreadCrumb
                        model={items}
                        home={home}
                        className={`rounded-[10px]`}
                    />
                </div>
                <div className="mt-[80px] my-44">
                    <div className="flex justify-center items-center">
                        <div
                            className={`bg-stone-950/50 w-full h-[850px] 2xl:h-[620px] lg:h-[800px] md:h-[800px] sm:h-[800px] rounded-[40px] shadow-2xl mx-10 2xl:mx-40 lg:mx-30 md:mx-20 sm:mx-25  ${
                                user && Object.keys(user) !== 0
                                    ? ""
                                    : "deferloading"
                            }`}
                        >
                            <form method="PATCH" onSubmit={handleAuthSubmit}>
                                <input
                                    type="hidden"
                                    name="id"
                                    defaultValue={`${user && user?.data?.id}`}
                                />
                                <div className="flex justify-center items-center text-slate-200 font-semibold">
                                    <p className="text-center mt-2 px-10">
                                        Note: If you are updating details on
                                        this account, you will be automatically
                                        logged out. <br />
                                        Please be careful when updating your
                                        account.
                                    </p>
                                </div>

                                <div className="flex justify-center items-center mt-10">
                                    <img
                                        className={`rounded-[10px] shadow-md bg-blue-400/70 px-2 py-4`}
                                        src={`${image}`}
                                        height="50"
                                        width="100"
                                    ></img>
                                </div>
                                <div className="flex justify-center items-center my-2">
                                    <FileUpload
                                        disabled={disabledUpload}
                                        ref={fileUpload}
                                        mode="basic"
                                        name="avatar[]"
                                        accept="image/*"
                                        customUpload
                                        uploadHandler={customBase64Uploader}
                                        onChange={handleonChangeUpload}
                                    />
                                </div>
                                <div
                                    className={`flex justify-center items-center mt-3`}
                                >
                                    <p
                                        className={`text-slate-50 font-semibold`}
                                    >
                                        {user && user?.data?.fullname} /{" "}
                                        {user && user?.data?.location}
                                    </p>
                                </div>

                                <div className="ms-[-11px]">
                                    <div className="flex justify-between items-center flex-wrap mt-10 mx-35 ">
                                        <div className="flex justify-center items-center w-full ">
                                            <div className="flex justify-center items-center flex-wrap 2xl:space-x-5 xl:space-x-3 lg:space-x-3 md:space-x-3 sm:space-x-3 mb-8">
                                                <div
                                                    className={`flex justify-center items-center`}
                                                >
                                                    {user?.data ? (
                                                        <div className="flex justify-center items-center flex-wrap flex-col 2xl:mb-0 lg:mb-0 md:mb-0 sm:mb-0 mb-6 relative">
                                                            <input
                                                                id="email-auth"
                                                                name="email"
                                                                className={`bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full m-2 py-2 px-8 `}
                                                                type="text"
                                                                placeholder="Enter your updated profile here..."
                                                                defaultValue={`${
                                                                    user &&
                                                                    user?.data
                                                                        .email
                                                                }`}
                                                            />

                                                            {error.length !==
                                                            0 ? (
                                                                <span className="email-error bg-red-300 rounded-[30px] text-slate-50 mx-3 w-full flex item-center justify-center absolute text-wrap text-[13px] px-2 ms-[30px] mt-20"></span>
                                                            ) : (
                                                                <span className="email-error bg-red-300 rounded-[30px] text-slate-50 mx-3 w-full flex item-center justify-center absolute text-wrap text-[13px] px-2 ms-[30px] mt-20"></span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center items-center flex-wrap  flex-col">
                                                            <input
                                                                id="email-auth"
                                                                name="email"
                                                                className="bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full m-2 py-2 px-8"
                                                                type="text"
                                                                placeholder="Enter your updated profile here..."
                                                                defaultValue={``}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-center items-center relative 2x:sm-0 lg:sm-0 md:mt-6 sm:mt-6 sm-0">
                                                    {user?.data ? (
                                                        <div className="flex justify-center items-center flex-wrap flex-col relative 2xl:mb-[23px] lg:mb-[21px] md:mb-[21px] sm:mb-[21px] mb-[-7px] md:ms-[-7px]">
                                                            <input
                                                                ref={
                                                                    locationUseRef
                                                                }
                                                                id="location-auth"
                                                                name="location"
                                                                className="bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full px-8 m-2 py-2 deferloading"
                                                                type="text"
                                                                placeholder="Enter your country or city"
                                                                defaultValue={`${
                                                                    user &&
                                                                    user?.data
                                                                        ?.location
                                                                }`}
                                                            />

                                                            {error.length !==
                                                                0 &&
                                                            locationUseRef
                                                                ?.current
                                                                ?.value !==
                                                                "undefined" ? (
                                                                <span className="location-error bg-red-300 rounded-[30px] text-slate-50 mx-3 w-full flex item-center justify-center absolute text-wrap text-[13px] px-2 ms-[30px] 2xl:mt-20 lg:mt-20 md:mt-20 sm:mt-20 mt-20"></span>
                                                            ) : (
                                                                <span className="location-error bg-red-300 rounded-[30px] text-slate-50 mx-3 w-full flex item-center justify-center absolute text-wrap text-[13px] px-2 ms-[30px] 2xl:mt-20 lg:mt-20 md:mt-20 sm:mt-20 mt-20"></span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center items-center flex-wrap flex-col">
                                                            <input
                                                                id="location-auth"
                                                                name="location"
                                                                className="bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full px-8 m-2 py-2"
                                                                type="text"
                                                                placeholder="Enter your country or city"
                                                                defaultValue={``}
                                                            />
                                                        </div>
                                                    )}
                                                    {!location && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                className={`m-3 px-4 py-1 ms-56 text-[13px] absolute my-2 2xl:mb-8 lg:mb-8 md:mb-8 sm:mb-8 mb-0`}
                                                                label="Location"
                                                                severity="warning"
                                                                onClick={() =>
                                                                    getAddress()
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center items-center w-full space-x-48">
                                            <div className="flex justify-center items-center flex-wrap 2xl:space-x-3 xl:space-x-3 lg:space-x-3 md:space-x-3 sm:space-x-3 2xl:ms-[14px] xl:ms-[14px] lg:ms-[14px] md:ms-[14px] sm:ms-[14px] ms-3">
                                                <div className="flex justify-center items-center flex-col 2xl:mb-0 lg:mb-0 md:mb-0 sm:mb-0 mb-6 relative mt-0 2xl:mt-[-25px] lg:mt-[-6px] md:mt-[-25px] sm:mt-[-15px]">
                                                    <input
                                                        id="password-auth"
                                                        name="password"
                                                        className="bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full m-2 py-2 px-8"
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        defaultValue={""}
                                                    />

                                                    {error.length !== 0 ? (
                                                        <span className="password-error bg-red-300 rounded-[30px] text-slate-50 mx-1 mt-20 2xl:mt-24 lg:mt-24 md:mt-24 sm:mt-24 w-full flex item-center justify-center absolute text-[13px] px-2"></span>
                                                    ) : (
                                                        <span className="password-error bg-red-300 rounded-[30px] text-slate-50 mx-1 mt-20 2xl:mt-24 lg:mt-24 md:mt-20 sm:mt-24 w-full flex item-center justify-center absolute text-[13px] px-2"></span>
                                                    )}
                                                </div>
                                                <div className="flex justify-center items-center flex-col relative 2xl:mb-0 lg:mb-0 md:mb-[40px] sm:mb-0 mb-4 mt-0 2xl:mt-[-25px] lg:mt-[-6px] md:mt-[15px] sm:mt-[32px] ">
                                                    <input
                                                        id="password_confirmation-auth"
                                                        name="password_confirmation"
                                                        className="bg-slate-300 rounded-[40px] text-slate-50 placeholder:text-slate-50 w-full px-8 m-2 py-2"
                                                        type="password"
                                                        placeholder="Enter your confirm password"
                                                        defaultValue={""}
                                                    />

                                                    {error.length !== 0 ? (
                                                        <span className="password_confirmation-error bg-red-300 rounded-[30px] text-slate-50 mx-3 mt-20 2xl:mt-24 lg:mt-24 md:mt-28 sm:mt-24 w-full flex item-center justify-center absolute text-wrap text-[13px] px-2"></span>
                                                    ) : (
                                                        <span className="password_confirmation-error bg-red-300 rounded-[30px] text-slate-50 mx-3 mt-20 2xl:mt-24 lg:mt-24 md:mt-20 sm:mt-24 w-full flex item-center justify-center absolute text-wrap text-[13px] px-2 "></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center mx-35 mt-10 ">
                                        <Button
                                            type="submit"
                                            className="px-5 py-2 mx-2"
                                            label="Update"
                                            severity="warning"
                                        />
                                        <Button
                                            type="submit"
                                            className="px-5 py-2 mx-2"
                                            label="Back"
                                            severity="danger"
                                            onClick={() => navigation(-1)}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function errorMessage(errMessage) {
    console.log(errMessage);
    let errObjectEntries = Object.entries(errMessage);

    for (let [index, values] of errObjectEntries) {
        let elem = document.querySelector(`.${index}-error`);
        console.log(elem);
        if (elem) {
            values.forEach((value) => {
                elem.textContent = `${value}`;
                console.log(value);
            });
        }
    }
}

export async function loader() {
    const auth = await authGetUser();

    return null;
}

export async function action() {
    const auth = await authGetUser();

    return null;
}

export default AccountProfile;
