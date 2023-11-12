import { getTokenWorkaround } from "@/app/actions/authActions";

// const baseUrl = process.env.API_URL;
const baseUrl = 'http://localhost:6001/';

async function get(url: string) {
    console.log("fetchWrapper GET");
    console.log("fetchWrapper GET baseUrl="+ baseUrl);
    console.log("fetchWrapper GET url="+ url);

    const requestOptions = {
        method: 'GET',
        header: await getHeaders()
    }

    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function post(url: string, body: {}) {
    console.log("fetchWrapper POST");
    const requestOptions = {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
    }
    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function put(url: string, body: {}) {
    console.log("fetchWrapper PUT");
    console.log("fetchWrapper PUT baseUrl="+ baseUrl);
    console.log("fetchWrapper PUT url="+ url);
    const requestOptions = {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(body)
    }
    console.log("requestOptions:");
    console.log(requestOptions);

    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function del(url: string) {
    console.log("fetchWrapper DEL");
    const requestOptions = {
        method: 'DELETE',
        headers: await getHeaders()
    }
    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function getHeaders() {
    const token = await getTokenWorkaround();
    const headers = { 'Content-type': 'application/json' } as any;
    if (token) {
      headers.Authorization = 'Bearer ' + token.access_token
    }
    return headers;
}

// async function handleResponse(response: Response) {
//     const text = await response.text();
//     // const data = text && JSON.parse(text);
//     let data;
//     try {
//         data = JSON.parse(text);
//     } catch (error) {   
//         data = text;
//     }

//     if (response.ok) {
//         return data || response.statusText;
//     } else {
//         const error = {
//             status: response.status,
//             message: typeof data === 'string' && data.length > 0 ? data : response.statusText
//         }
//         return {error};
//     }
// }


async function handleResponse(response: Response) {
    const text = await response.text();
    const data = text && JSON.parse(text);

    // try {
    //     data = JSON.parse(text);
    // } catch (error) {   
    //     data = text;
    // }

    if (response.ok) {
        return data || response.statusText;
    } else {
        const error = {
            status: response.status,
            message: typeof data === 'string' && data.length > 0 ? data : response.statusText
        }
        return {error};
    }
}

export const fetchWrapper = {
    get,
    post,
    put,
    del
}

