import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

const SECRET = 'mySuperSecretToken'; // Asegúrate de que este valor coincide con el configurado en GitHub

async function verifySecret(req) {
  const signature = req.headers.get('x-hub-signature-256');
  const body = await req.text();

  if (!signature) {
    console.error('Firma no proporcionada por el webhook');
    return false;
  }

  const crypto = await import('crypto');
  const hash = `sha256=${crypto.createHmac('sha256', SECRET).update(body).digest('hex')}`;

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

    // Comando a ejecutar; usamos spawn para transmitir salida en tiempo real
    const command = 'cmd';
    const args = [
      '/c',
      'cd /d C:\\Users\\DavidAntonio\\Documents\\Production\\avimex-intranet && git pull && npm i && pnpm install && pnpm run build && pm2 restart nextjs-prod'
    ];

    // Ejecutar el comando con spawn
    const proc = spawn(command, args, { shell: true });

    // Crear un ReadableStream para enviar la salida en formato SSE
    const stream = new ReadableStream({
      start(controller) {
        proc.stdout.on('data', (data) => {
          controller.enqueue(`data: ${data.toString()}\n\n`);
        });

        proc.stderr.on('data', (data) => {
          controller.enqueue(`data: ERROR: ${data.toString()}\n\n`);
        });

        proc.on('close', (code) => {
          controller.enqueue(`data: Proceso finalizado con código: ${code}\n\n`);
          controller.close();
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
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
}

//tryagain