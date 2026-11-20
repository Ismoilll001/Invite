import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"BAZMNOMA · Даъватномаҳои онлайн",description:"Даъватномаҳои онлайн барои тӯй ва оши наҳор",icons:{icon:[{url:"/bazmnoma-icon.png",type:"image/png",sizes:"64x64"},{url:"/favicon.ico"}],apple:"/apple-touch-icon.png"},robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="tg"><body>{children}</body></html>}
