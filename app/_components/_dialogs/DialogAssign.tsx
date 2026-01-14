"use client";
import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ROLE_TYPE } from '@/app/_types/types';

type Props = {
    children: React.ReactNode,
    button: React.ReactNode,
    dialogTitle: string
}
const DialogAssign = ({children, button, dialogTitle}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {button}
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
          <button>Cancel</button>
        </DialogClose>

      </DialogContent>
    </Dialog>
  )
}

export default DialogAssign