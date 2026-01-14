"use client";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import React from 'react'

type Props = {
  children: React.ReactNode,
  buttonTitle: string
  dialogTitle: string
 // isOpen: boolean
}
const DialogLite = ({ children, dialogTitle, buttonTitle = "Open" }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='bg-blue-500 text-white rounded-lg px-2 py-2'>{buttonTitle}</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-center'>{dialogTitle}</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <div>
          {children}
        </div>

        <DialogClose asChild>
          <button >Cancel</button>
        </DialogClose>

      </DialogContent>
    </Dialog>

  )
}

export default DialogLite