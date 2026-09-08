import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Office Bluff — Tan ca, lên bài',description:'Một cuộc vui sau giờ làm. Chọn nhân vật, đánh bài úp và bắt bài đồng nghiệp trong phòng chơi 3D.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
