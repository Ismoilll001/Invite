import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"KHUSHBAKHT · Даъватномаҳои онлайн",description:"Даъватномаҳои онлайн барои тӯй ва оши наҳор",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="tg"><body>{children}</body></html>}
