import Image from 'next/image'
import React from 'react'

const LogoComp = () => {
    return (
        <div className="flex items-center  text-xl font-extrabold tracking-tight text-foreground">
            <Image src="/icon.svg" alt="Signalor" width={40} height={40} />
            <span>Signalor</span>
            <span className="text-orange-500 rounded-full">.</span>AI
        </div>
    )
}

export default LogoComp
