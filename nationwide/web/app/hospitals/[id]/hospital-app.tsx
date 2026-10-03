"use client";
import Home from "../../hospital-home";
export default function HospitalApp({hospital}:{hospital:{id:string;name:string;region:string;city:string;type?:string;kind?:string;address?:string}}){return <Home hospital={hospital}/>;}
