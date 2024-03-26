"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDb } from "../mongoose"
import Thread from "../models/thread.model";

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
