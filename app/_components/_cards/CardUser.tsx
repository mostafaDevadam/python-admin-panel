"use client";

import { USER_ROLE_PERMISSIONS_TYPE, USER_TYPE } from '@/app/_types/types';
import React from 'react'

type Props = {
    user: USER_ROLE_PERMISSIONS_TYPE | USER_TYPE
}
const CardUser = ({user}: Props) => {
  return (
    <div>CardUser</div>
  )
}

export default CardUser