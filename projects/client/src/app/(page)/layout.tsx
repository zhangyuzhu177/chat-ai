import Header from "../components/Header";
import Menu from "../components/Menu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full flex">
      <Menu />

      <div className="flex-1 flex flex-col bg-white dark:bg-[#212121]">
        <Header />
        <div className="p-4 flex-1">
          { children }
        </div>
      </div>
    </div>
  );
}
