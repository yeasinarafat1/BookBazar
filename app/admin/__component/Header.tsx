import React from 'react'

const Header = ({title,subtitle}:{title?:string,subtitle?:string}) => {
  return (
   
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-600 mt-1">{subtitle}</p>
          </div>
  )
}

export default Header