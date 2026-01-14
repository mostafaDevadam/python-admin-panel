"use client";

import { ACTION_TYPE } from '@/app/_types/types';
import { getAllActionsAction } from '@/app/actions/action.actions';
import React, { use, useActionState, useEffect, useState } from 'react'

type Props = {
    action: (prevState: any, formData: FormData) => Promise<any>
    actions: ACTION_TYPE[]
}
const PermissionsForm = ({ action, actions }: Props) => {
    const [state, formAction] = useActionState(action, null)
    const [isLoading, setIsLoading] = useState(false)
    //const list = use(getAllActionsAction(null, {} as FormData))
        //const [actions, setActions] = useState<ACTION_TYPE[]>(actions)



    useEffect(() => {
       


    }, [state])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log("selected value:", e.target.value, e.target.name, e.target.outerText)
        
    }
    return (
        <form action={formAction} className='flex flex-col gap-3'>
            <div className='flex flex-col gap-2'>
                <label>Name</label>
                <input type='text' name="name" className='border rounded-lg py-2 px-2' />
            </div>
            <div className='flex flex-col gap-2'>
                <label>Action</label>
                <select name="action" className='border rounded-lg py-2 px-2' id="action"
                
                onChange={handleChange}>
                    <option value='0'>Select Action</option>
                    {actions && actions?.map((m: ACTION_TYPE, index: number) => (<option key={index} value={`"id": ${m.id}, "name": "${m.name}"`}>{m.name}</option>))}
                </select>
            </div>
            <div className='flex flex-col gap-2'>
                <label>Resource</label>
                <input type='text' name="resource" className='border rounded-lg py-2 px-2' />
            </div>
            <div className='flex flex-col gap-2'>
                <label>Description</label>
                <textarea name="description" className='border rounded-lg py-2 px-2 resize-none' ></textarea>
            </div>
            <div className='flex justify-end'>
                <button type='submit' className='bg-blue-500 text-white px-2 py-2 rounded-lg'>Submit</button>
            </div>
        </form>
    )
}

export default PermissionsForm