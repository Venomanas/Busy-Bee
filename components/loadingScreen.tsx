'use client'
import React from 'react'
import Image from 'next/image'
import { LinearProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export default function LoadingScreen() {
  const loadingScreenOpen = useSelector((state: RootState) => state.loading.loadingScreenOpen
  );

  return (
    <div
      className={`fixed top-0 left-0 bottom-0 right-0 bg-white  flex items-center justify-center ${
        loadingScreenOpen ? "opacity-100 z-50" : "opacity-0 -z-50"
      }`}
    >
      <div className="flex flex-col items-center">
        <Image
          src={"/assets/beee.jpg"}
          width={120}
          height={120}
          alt="Busy bee loading page"
          className="mb-5"
        />
        <h1 className="text-6xl font-bold  mb-10">Busy Bee</h1>
        <LinearProgress
          sx={{
            width: 265,
            height: 10,
            backgroundColor: "#F4AF01",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "black",
            },
          }}
        />
      </div>
    </div>
  );
}
