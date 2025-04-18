import { Stack } from 'expo-router';
import { useEffect } from 'react';
import {setCookie,getCookie,deleteCookie} from '@/components/Cookies';

export default function Redirect() {
    //runs once
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('setCookie')) {
            setCookie({
                name : params.get('setCookie'),
                value : 1,
                minutes : 60
            })

            window.location.href = '/';
        }

    }, [])
    return null;
}