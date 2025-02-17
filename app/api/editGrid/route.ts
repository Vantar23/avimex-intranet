// app/api/editGrid/route.ts

import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    // Extraer el id de la query string
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id en la query string' }, { status: 400 });
    }
    
    // Obtener el body de la petición
    const body = await req.json();
    console.log("Payload recibido en el proxy:", JSON.stringify(body));

    // Construir la URL destino utilizando el id
    const targetUrl = `http://avimexintranet.com/backend/api/compras/${id}`;
    console.log("URL de envío completa:", targetUrl);

    // Realizar la petición PUT al servidor real, enviando el body tal cual (sin el id)
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return NextResponse.json({ targetUrl, result }, { status: response.status });
  } catch (error: any) {
    console.error("Error en proxy /api/editGrid:", error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}