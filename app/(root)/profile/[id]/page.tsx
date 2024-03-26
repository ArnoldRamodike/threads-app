import React from 'react'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { fetchUser } from '@/lib/actions/user.actions';
import ProfileHeader from '@/components/shared/ProfileHeader';

 async function page({params}: {params: {id: string}}){

    const user = await currentUser();
    if (!user) return null;

    
    const userInfo = await fetchUser(params.id);

    // if (!userInfo.onboarded)  redirect('/onboarding');

  return (
    <section>
        <ProfileHeader 
            accountId={userInfo?.id}
            authUserId={userInfo?.id}
            name={userInfo?.name}
            username={userInfo?.username}
            imgUrl={userInfo?.image}
            bio={userInfo?.bio}
        />
    </section>
  )
}

export default page