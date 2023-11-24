'use server'

import { Auction, Bid, PagedResult } from "@/types";
// import { getTokenWorkaround } from "./authActions";
import { fetchWrapper } from "@/app/lib/fetchWrapper";
// import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";
import { getTokenWorkaround } from "./authActions";
import { FieldValues } from "react-hook-form";



export async function getData(query: string): Promise<PagedResult<Auction>> {

    console.log("auctionAction: getData() query=" + query);

    return await fetchWrapper.get(`search/${query}`)
    // const res = await fetch(`http://localhost:6001/search/${query}`);

    // if (!res.ok) throw new Error('Failed to fetch data');

    // return res.json();
}

/*
export async function getData(pageNumber: number, pageSize: number): Promise<PagedResult<Auction>> {
    // const cookieStore = cookies();

    console.log("for fetch")

    const res = await fetch(`http://localhost:6001/search?pageSize=${pageSize}&pageNumber=${pageNumber}`);

    console.log("nach fetch")

    if (!res.ok)
        throw new Error('Failed to fetch data');

    return res.json();
}
*/

/*
org:
async function getData(): Promise<PagedResult<Auction>> {
    const cookieStore = cookies();

    console.log("for fetch")

    const res = await fetch('http://localhost:6001/search?pageSize=4');

    console.log("nach fetch")

    if (!res.ok)
        throw new Error('Failed to fetch data');

    return res.json();
}
*/

export async function updateAuctionTest() {
    const data = {
        mileage: Math.floor(Math.random() * 100000) + 1
    }

    return await fetchWrapper.put('auctions/afbee524-5972-4075-8800-7d1f9d7b0a0c', data);
}


// export async function updateAuctionTest() {
//         const data = {
//             mileage: Math.floor(Math.random() * 100000) + 1
//         }

//         console.log('updateAuctionTest() start');

//         const token = await getTokenWorkaround();

//         console.log('token:');
//         console.log(token);

//         const res = await fetch('http://localhost:6001/auctions/afbee524-5972-4075-8800-7d1f9d7b0a0c', {
//                 method: 'PUT',
//             headers: {
//                 'Content-type': 'application/json',
//                 'Authorization': 'Bearer ' + token?.access_token
//             },
//             body: JSON.stringify(data)
//         })

//         console.log('res:');
//         console.log(res);       

//         if(!res.ok) return {status: res.status, message: res.statusText}
    
//         return res.statusText;
//     }

export async function createAuction(data: FieldValues) {
    return await fetchWrapper.post('auctions', data);
}

export async function getDetailedViewData(id: string): Promise<Auction> {
    return await fetchWrapper.get(`auctions/${id}`);
}

export async function updateAuction(data: FieldValues, id: string) {
    const res = await fetchWrapper.put(`auctions/${id}`, data);
    revalidatePath(`/auctions/${id}`);  // load new data without using cache
    return res;
}

export async function deleteAuction(id: string) {
    return await fetchWrapper.del(`auctions/${id}`);
}

export async function getBidsForAuction(id: string): Promise<Bid[]> {
    return await fetchWrapper.get(`bids/${id}`);
}

export async function placeBidForAuction(auctionId: string, amount: number) {
    return await fetchWrapper.post(`bids?auctionId=${auctionId}&amount=${amount}`, {})
}