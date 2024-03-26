"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDb } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params{
    userId: string,
    username: string,
    name: string,
    image: string,
    bio: string ,
    path: string
}

export async function updateUser({userId, username, name, image, bio, path }: Params ) : Promise<void> {

    try {
        connectToDb();
        console.log("gets here");
        
        await User.findOneAndUpdate(
          { id: userId },
          {
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true,
          },
          { upsert: true }
        );
        console.log("gets here for second time!!");
        if (path === "/profile/edit") {
          revalidatePath(path);
      }
      } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
      }
}

export async function fetchUser( userId: String){
    try {
        connectToDb();

        return await User.findOne({id: userId})
                    //  .populate({
                    //     path: 'communities',
                    //     model: Community
                    //  })
    } catch (error : any) {
        throw new Error(`Faliled to fetch user: ${error.message}`);
    }
}


export async function fetchuserPosts(userId: string){
  try {
    connectToDb();

    const threads = await User.findById({id: userId})
      .populate({
        path: 'threads',
        model: Thread,
        populate: {
          path: 'childrren',
          model: Thread,
          populate: {
            path: 'author',
            model: User,
            select: 'name image id'
          }
        }
      })
      return threads;
  } catch (error: any) {
    throw new Error(`Faliled to fetch user Posts: ${error.message}`);
  }
}

export async function fetchUsers({
  userId, searchString = "", pageNumber = 1, pageSize = 20, sortBy = 'desc' } : {
    userId : string, searchString? : string, pageNumber?: number, pageSize?: number, sortBy : SortOrder
  }){
  try {
    connectToDb();

    const skipAmout = (pageNumber -1) * pageSize;

    const regex =  new RegExp(searchString, 'i')

    const query: FilterQuery<typeof User> = {
      id: {$ne: userId}
    }

    if (searchString.trim() !=='') {
      query.$or = [
        {username: {$regex: regex}},
        {name: {$regex: regex}}
      ]
    }

    const sortOptions = {createdAt: sortBy};

    const userQuery = User.find(query)
          .sort(sortOptions)
          .skip(skipAmout)
          .limit(pageSize);
      
    const totalUsersCount = User.countDocuments(query);

    const users = await userQuery.exec();

    const isNext = totalUsersCount > skipAmout + users.length;

    return {users, isNext}


  } catch (error: any) {
    throw new Error(`Faliled to fetch users: ${error.message}`);
  }
}


export async function getActivity(userId: string){
  try {

    connectToDb();
    
    const userThreads = await Thread.find({author: userId});

    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.childrren)
    }, []) 

    const replies = await Thread.find({
      _id: {$in: childThreadIds},
      author: {$ne: userId}
    }).populate({
      path: 'author',
      model: User,
      select: 'name, image _id'
    })

    return replies;
    
  } catch (error: any) {
    throw new Error(`Faliled to get Activity: ${error.message}`);
  }
}