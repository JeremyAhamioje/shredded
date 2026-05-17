'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect } from 'react'

const OrderPlaced = () => {

  const { router } = useAppContext()

  useEffect(() => {
    setTimeout(() => {
      router.push('/my-orders')
    }, 5000)
  }, [])

  return (
    <div className='bg-black h-screen flex flex-col justify-center items-center gap-5'>
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5" src={assets.checkmark} alt='' />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-400 border-gray-700"></div>
      </div>
      <div className="text-center text-2xl font-semibold text-white">Order Placed Successfully</div>
    </div>
  )
}

export default OrderPlaced
