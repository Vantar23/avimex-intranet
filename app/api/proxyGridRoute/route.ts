import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { promises as fs } from 'fs';
import path from 'path';

interface ColumnDefinition {
  key: string;
  label: string;
  type: string;
}

interface GridConfig {
  dataUrl: string;
  columns: ColumnDefinition[];
}

export async function GET(req: NextRequest) {
  const jsonUrl = req.nextUrl.searchParams.get("jsonUrl");
  const apiUrl = req.nextUrl.searchParams.get("apiUrl");

  if (!jsonUrl || !apiUrl) {
    return NextResponse.json({ error: "Faltan parámetros jsonUrl o apiUrl" }, { status: 400 });
  }

  try {
    let configJson: GridConfig;

    if (jsonUrl.startsWith("http")) {
      const configRes = await fetch(jsonUrl);
      if (!configRes.ok) throw new Error("No se pudo cargar el archivo JSON de configuración");
      configJson = await configRes.json();
    } else {
      const localPath = path.join(process.cwd(), "public", jsonUrl);
      const fileContent = await fs.readFile(localPath, "utf-8");
      configJson = JSON.parse(fileContent);
    }

    const token = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const dataRes = await fetch(apiUrl, { method: 'GET', headers });
    const cloneRes = dataRes.clone();

    let data;
    try {
      data = await dataRes.json();
    } catch (e) {
      const text = await cloneRes.text();
      data = { error: text };
    }

    if (!dataRes.ok) {
      let additionalHeaders: { [key: string]: string } = {};
      if (dataRes.status === 401) {
        const expiredCookies = [
          serialize("session", "", { httpOnly: true, secure: false, sameSite: "lax", path: "/", expires: new Date(0) }),
          serialize("user", "", { httpOnly: true, secure: false, sameSite: "lax", path: "/", expires: new Date(0) }),
          serialize("authToken", "", { httpOnly: true, secure: false, sameSite: "lax", path: "/", expires: new Date(0) }),
        ].join(", ");
        additionalHeaders["Set-Cookie"] = expiredCookies;
      }

      return NextResponse.json(
        { error: data.error || "Error desconocido", originalStatus: dataRes.status },
        { status: 200, headers: additionalHeaders }
      );
    }

    const formattedData = data.map((item: any) => {
      const row: any = {};
      configJson.columns.forEach(col => {
        row[col.key] = item[col.key];
      });
      row.NombreFact = item.NombreFact;
      row.NombreCoti = item.NombreCoti;
      return row;
    });

    return NextResponse.json({
      columns: configJson.columns,
      data: formattedData,
      originalData: data, // 🔁 Aquí se incluyen los datos completos
    });
  } catch (error: any) {
    console.error("❌ Error en proxy-grid:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 200 });
  }
}