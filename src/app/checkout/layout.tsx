export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔧 LAYOUT CHECKOUT CARGANDO');
  
  return (
    <div>
      {children}
    </div>
  );
}