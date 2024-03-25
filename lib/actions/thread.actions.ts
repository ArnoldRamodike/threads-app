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

export async function fetchPosts(pageNumber =1, pagesize =20){
    try {
        connectToDb();

        const skipAmount = (pageNumber -1) * pagesize;

        const postQuery =  Thread.find({ parentId: {$in: [null, undefined]}})
        .sort({createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pagesize)
        .populate({path: 'author', model: User})
        .populate({path: 'children', populate:{
            path: 'author', model: User, select: "_id name parentId image"
        }})

        const totalPostCount = await Thread.countDocuments({ parentId: {$in: [null, undefined]} })

        const posts = await postQuery.exec();

        const isNext = totalPostCount > skipAmount + posts.length;

        return {posts, isNext}

    } catch (error: any) {
        return new Error(`failed to fetch Posts: ${error.message}`);
    }
}

export async function fetchThreadById(id:string){
    connectToDb();

    try {
        //Polulate Community

        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: "_id id name image"
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"  
                    },
                     {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: "_id id name parentId image" 
                         }
                     }
            ]
            }).exec();
        return thread;
    } catch (error: any) {
        return new Error(`failed to fetch Post by Id: ${error.message}`);
    }
}

export async function createThread({text, author, communityId, path}: Params){
    
    try {
        connectToDb();

        const createThread = await Thread.create({
            text, 
            author,
            community: null,
    
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

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string){
    connectToDb();

    try {
        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found");
        }

        const commentThread= new Thread({
            text: commentText,
            author: userId,
            parentId: threadId,
        })

        const savedCommentThread = await commentThread.save();

        originalThread.children.push(savedCommentThread._id);

        await originalThread.save();

        revalidatePath(path)

    } catch (error: any) {
        throw new Error(`failed to comment to Thread", ${error.mesage}`)
    }
}