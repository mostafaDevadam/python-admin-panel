import { get } from 'http'
import React from 'react'
import { getID } from '../../lib/id'
import { PhotosApi } from '../api/photos.api'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PHOTO_TYPE } from '../_types/types'
import { GetStaticProps, GetStaticPropsContext, GetStaticPropsResult } from 'next'

interface PhotosPageProps {
  photos: PHOTO_TYPE[]; // Adjust type to match your photos
  //photos: Array<{ id: number; url: string }>; // Adjust type to match your photos
}

/*
export const getStaticParams = async (context: GetStaticPropsContext): Promise<GetStaticPropsResult<PhotosPageProps>> => {
  const userId = await getID("user_id")
  const photos = await PhotosApi.getAllPhotosByUserId(userId!!)
  console.log("photos:", photos)

  const res: GetStaticPropsResult<PhotosPageProps> = {
    props: { photos },
    revalidate: 60, // Re-generate page every 60 seconds (ISR)
  }

  //return res

  //return {photos}
  return {params: {userId: "1"}}

}
*/
export async function generateStaticParams() {
  const userId = await getID("user_id")
  //return {userId: userId?.toString()!!}

   return [{
    slug: "slug",
  }]
}

const PhotosPage = async () => {
 const userId = await getID("user_id")
  const photos = await PhotosApi.getAllPhotosByUserId(userId!!)

  console.log("photos:", await photos)

  return (
    <div>

      <div className='flex flex-row flex-wrap gap-10'>
        {
          photos ? photos.map((photo: PHOTO_TYPE) => (
            <div className="font-medium" key={photo.id}>
              <img src={photo.url} width={100} height={100} className='rounded-lg' />
            </div>
          )) : 'No Photos'
        }

      </div>
    </div>
  )
}

export default PhotosPage