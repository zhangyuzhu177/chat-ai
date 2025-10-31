import Menu from "../components/Menu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=" h-min-screen w-full flex">
      <Menu />
      {children}
    </div>
  );
}
