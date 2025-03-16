'use client'

import { useState, useRef } from "react";
import type { StaticImageData } from "next/image";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Image from 'next/image'
import IphoneMockup from '@/public/images/iphone-mockup.png'
import PlayBtn from '@/public/images/play-button.svg'

interface ModalVideoIphoneProps {
  thumb: StaticImageData
  thumbWidth: number
  thumbHeight: number
  thumbAlt: string
  video: string
  videoWidth: number
  videoHeight: number
}

export default function ModalVideoIphone({
  thumb,
  thumbWidth,
  thumbHeight,
  thumbAlt,
  video,
  videoWidth,
  videoHeight,
}: ModalVideoIphoneProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div>

      {/* Video thumbnail */}
      <div className="inline-flex relative justify-center items-center">
        {/* Glow illustration */}
        <svg className="absolute mr-12 mt-32 pointer-events-none -z-1 dark:opacity-40" aria-hidden="true" width="678" height="634" viewBox="0 0 678 634" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="240" cy="394" r="240" fill="url(#piphoneill_paint0_radial)" fillOpacity=".4" />
          <circle cx="438" cy="240" r="240" fill="url(#piphoneill_paint1_radial)" fillOpacity=".6" />
          <defs>
            <radialGradient id="piphoneill_paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 -77 317) scale(189.054)">
              <stop stopColor="#667EEA" />
              <stop offset="1" stopColor="#667EEA" stopOpacity=".01" />
            </radialGradient>
            <radialGradient id="piphoneill_paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 99 339) scale(189.054)">
              <stop stopColor="#9F7AEA" />
              <stop offset="1" stopColor="#9F7AEA" stopOpacity=".01" />
            </radialGradient>
          </defs>
        </svg>
        {/* Image inside mockup size: 290x624px (or 580x1248px for Retina devices) */}
        <Image className="absolute" src={thumb} width={thumbWidth} height={thumbHeight} alt={thumbAlt} style={{ maxWidth: '84.33%' }} priority />
        {/* iPhone mockup */}
        <Image className="relative max-w-full mx-auto md:mr-0 md:max-w-none h-auto pointer-events-none" src={IphoneMockup} width={344} height={674} priority alt="iPhone mockup" aria-hidden="true" />
        {/* Play button */}
        <a className="absolute group" href="#0" onClick={() => { setModalOpen(true) }}>
          <Image src={PlayBtn} width="96" height="96" alt="Play" />
        </a>
      </div>
      {/* End: Video thumbnail */}

      <Dialog
        initialFocus={videoRef}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 z-99999 bg-black/70 transition-opacity duration-300 ease-out data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-99999 flex px-4 py-6 sm:px-6">
          <div className="mx-auto flex h-full max-w-6xl items-center">
            <DialogPanel
              transition
              className="aspect-video max-h-full w-full overflow-hidden bg-black shadow-2xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <video
                ref={videoRef}
                width={videoWidth}
                height={videoHeight}
                loop
                controls
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

    </div>
  )
}