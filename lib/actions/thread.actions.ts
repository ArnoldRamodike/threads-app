"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDb } from "../mongoose";


interface Params{
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({text, author, communityId, path}: Params){
    
    try {
        connectToDb();

        const createThread = await Thread.create({
            text, 
            author,
            community: communityId = null,
    
        });
    
        //Update User Model
        await User.findByIdAndUpdate(author, {
            $push: {threads: createThread._id}
        })
    
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`failed to create Thread", ${error.mesage}`)
    }

}