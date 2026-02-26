export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pos-screen">{children}</div>;
}