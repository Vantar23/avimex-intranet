import { NextResponse } from 'next/server';
import { exec } from 'child_process';

const SECRET = '1234'; // Cambia esto por tu secreto configurado en GitHube

async function verifySecret(req) {
  const signature = req.headers.get('x-hub-signature-256');
  const body = await req.text();

  if (!signature) {
    console.error('Firma no proporcionada por el webhook');
    return false;
  }

  const crypto = await import('crypto');
  const computedHash = `sha256=${crypto.createHmac('sha256', SECRET).update(body).digest('hex')}`;
    console.log("Firma calculada:", computedHash);
    console.log("Firma recibida:", signature);

  if (hash !== signature) {
    console.error('Firma no válida');
    return false;
  }

  return body;
}

export async function POST(req) {
  try {
    // Validar el secreto
    const body = await verifySecret(req);
    if (!body) {
      return NextResponse.json({ message: 'Firma no válida' }, { status: 403 });
    }

    const parsedBody = JSON.parse(body);
    console.log('Webhook recibido:', parsedBody);

    // Ejecutar la cadena de comandos hasta el build
    // Se usa cd /d para asegurar el cambio de directorio en Windows
    const buildCommand = 'start /min cmd /c "cd /d C:\\Users\\DavidAntonio\\Documents\\Production\\avimex-intranet && git pull && npm i && pnpm install && pnpm run build"';
    
    exec(buildCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error durante el build: ${error.message}`);
        console.error(`Detalles del error: ${stderr}`);
        return;
      }
      console.log("Build ejecutado exitosamente.");

      // Si el build fue exitoso, reiniciar PM2
      const restartCommand = 'pm2 restart nextjs-prod';
      exec(restartCommand, (error2, stdout2, stderr2) => {
        if (error2) {
          console.error(`Error al reiniciar PM2: ${error2.message}`);
          console.error(`Detalles del error: ${stderr2}`);
          return;
        }
        console.log("PM2 reiniciado exitosamente.");
      });
    });

    return NextResponse.json({
      message: 'Comandos ejecutados: proyecto actualizado, build ejecutado (si hubo error en build, no se reinicia PM2)'
    });
  } catch (error) {
    console.error(`Error en webhook: ${error.message}`);
    return NextResponse.json({ message: 'Error procesando el webhook' }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse(
    '<h1>Webhook Server</h1><p>Servidor funcionando correctamente. Ruta POST: /api/webhook.</p>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}//test