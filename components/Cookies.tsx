

type Cookie = {
    name : string|null; 
    value : any;
    minutes : number;
}


export const setCookie = (cookie:Cookie) => {
    let expires = "";
    if (cookie.minutes) {
        let date = new Date();
        date.setTime(date.getTime() + cookie.minutes * 60 * 1000); // Convert minutes to milliseconds
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = cookie.name + "=" + cookie.value + expires + "; path=/";
}

export const getCookie = (name : string) => {
    let nameEQ = name + "=";
    let cookiesArray = document.cookie.split(";");

    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}

export const deleteCookie = (name : string)  => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

