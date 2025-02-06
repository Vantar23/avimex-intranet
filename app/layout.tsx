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
      <body>
        {children}
        </body>
    </html>
  );
}
