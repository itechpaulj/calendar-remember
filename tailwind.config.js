/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        fontFamily: {
            sans: "Roboto mono, monospace",
        },
        extend: {},
    },
    plugins: [],
};
