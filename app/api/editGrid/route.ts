import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    // Extraer el id de la query string de la URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Falta el id en la query string' },
        { status: 400 }
      );
    }
    
    // Obtener el body de la petición (se espera que sea JSON)
    const body = await req.json();
    console.log("Payload recibido en el proxy:", JSON.stringify(body));

    // Construir la URL destino utilizando el id extraído
    const targetUrl = `http://avimexintranet.com/backend/api/compras/${id}`;
    console.log("URL de envío completa:", targetUrl);

    // Realizar la petición PUT al servidor real, enviando el body tal cual (sin incluir el id)
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Intentar parsear la respuesta en JSON
    const result = await response.json();

    // Devolver la respuesta incluyendo la URL destino para fines de depuración (opcional)
    return NextResponse.json({ targetUrl, result }, { status: response.status });
  } catch (error: any) {
    console.error("Error en proxy /api/editGrid:", error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}