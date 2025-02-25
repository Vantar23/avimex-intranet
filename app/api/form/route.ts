import { NextApiRequest, NextApiResponse } from 'next';

// ✅ Interfaces para tipar datos
interface UserRequestBody {
  name: string;
  email: string;
}

interface ProductRequestBody {
  productName: string;
  price: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { endpoint } = req.query; // Captura el endpoint de la URL

  switch (method) {
    case "GET":
      return handleGet(endpoint as string, res);
    case "POST":
      return handlePost(req, res, endpoint as string);
    case "PUT":
      return handlePut(req, res, endpoint as string);
    default:
      return res.status(405).json({ message: `Método ${method} no permitido` });  
  }
}

//
// ✅ Función para manejar GET
//
function handleGet(endpoint: string, res: NextApiResponse) {
  switch (endpoint) {
    case "users":
      return res.status(200).json({ message: "Lista de usuarios", users: ["Juan", "Ana", "Luis"] });
    case "products":
      return res.status(200).json({ message: "Lista de productos", products: ["Laptop", "Teléfono", "Tablet"] });
    default:
      return res.status(404).json({ message: "Endpoint no encontrado" });
  }
}

//
// ✅ Función para manejar POST
//
function handlePost(req: NextApiRequest, res: NextApiResponse, endpoint: string) {
  switch (endpoint) {
    case "users":
      const { name, email } = req.body as UserRequestBody;
      if (!name || !email) {
        return res.status(400).json({ message: "Datos incompletos para usuarios" });
      }
      return res.status(201).json({ message: `Usuario ${name} registrado`, email });

    case "products":
      const { productName, price } = req.body as ProductRequestBody;
      if (!productName || price === undefined) {
        return res.status(400).json({ message: "Datos incompletos para productos" });
      }
      return res.status(201).json({ message: `Producto ${productName} registrado`, price });

    default:
      return res.status(404).json({ message: "Endpoint no encontrado" });
  }
}

//
// ✅ Función para manejar PUT
//
function handlePut(req: NextApiRequest, res: NextApiResponse, endpoint: string) {
  switch (endpoint) {
    case "users":
      const { name, email } = req.body as UserRequestBody;
      if (!name || !email) {
        return res.status(400).json({ message: "Datos incompletos para actualizar usuario" });
      }
      return res.status(200).json({ message: `Usuario ${name} actualizado`, email });

    case "products":
      const { productName, price } = req.body as ProductRequestBody;
      if (!productName || price === undefined) {
        return res.status(400).json({ message: "Datos incompletos para actualizar producto" });
      }
      return res.status(200).json({ message: `Producto ${productName} actualizado`, price });

    default:
      return res.status(404).json({ message: "Endpoint no encontrado" });
  }
}