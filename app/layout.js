import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/navigation/MainNav";
import { getUserFromCookies, serializeUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ระบบลงทะเบียนและประเมินนักศึกษาฝึกงาน",
  description:
    "แพลตฟอร์มสำหรับจัดการข้อมูลนักศึกษาฝึกงาน ครูนิเทศ และสถานประกอบการ พร้อมบันทึกผลการประเมินครบวงจร",
};

export default async function RootLayout({ children }) {
  const userDoc = await getUserFromCookies();
  const user = serializeUser(userDoc);

  return (
    <html lang="th" data-theme="corporate">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-200 text-base-content min-h-screen flex flex-col`}
      >
        <MainNav user={user} />
        <main className="flex-1">{children}</main>
        <footer className="bg-base-100 border-t border-base-200">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-base-content/70 lg:px-10">
            <span>© {new Date().getFullYear()} แพลตฟอร์มฝึกงาน GOFT</span>
            <span>
              รองรับการจัดการข้อมูลนักศึกษาฝึกงาน ครูนิเทศ และสถานประกอบการ
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
