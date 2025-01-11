import { montserrat } from './ui/fonts';
import './ui/global.css'

/* Este es un nuevo Comentario en el Layout */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        {children}
        <footer className='py-10 flex justify-center items-center'>
          Con cariño y amor ControlWare
        </footer>
        </body>
    </html>
  );
}
