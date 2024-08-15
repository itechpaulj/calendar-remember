export function dateYMD(name, removeWord, replaceOld = "", replaceNew = "") {
    const cleaned_start = `${name}`;
    const index = cleaned_start.indexOf(`${removeWord}`);
    let newString = cleaned_start;

    if (index !== -1) {
        newString =
            cleaned_start.substring(0, index) +
            cleaned_start.substring(index + `${removeWord}`.length);
    }

    if (replaceOld !== "" && replaceNew !== "") {
        return `${newString}`.replace(`${replaceOld}`, `${replaceNew}`);
    }
    return newString;
}
