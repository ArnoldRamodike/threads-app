'use client'

import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'


interface Props {
    id: string,
    name: string,
    username: string,
    imageUrl: string,
    personType: string,
}

const UserCard = ({id, name, username, imageUrl, personType} : Props) => {

  const  router = useRouter()

  return (
    <article className='user-card'>
        <div className="user-card_avatar">
            <Image src={imageUrl} alt='Profile image' width={48} height={48} className='rounded-full'/>

            <div className="flex-1 text-ellipsis">
                <h3 className='text-base-semibold text-light-1'>{name}</h3>
                <p className='text-small-medium text-gray-1'>@{username}</p>
            </div>
        </div>
    <Button className='user-cart_btn' onClick={() => {router.push(`/profile/${id}`)}}>
        View
    </Button>
    </article>
  )
}

export default UserCard