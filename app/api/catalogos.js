const axios = require('axios');

// Inicialización del objeto catalogos
let catalogos = {
    Cat_Producto: [],
    Cat_Medida: [],
    Cat_Marca: [],
    Cat_Proveedor: [],
};

// Función para obtener los catálogos y separarlos
const fetchCatalogos = async () => {
    try {
        const response = await axios.get('http://localhost/backend/api/Catalogos');

        // Asignar cada sección del JSON a su respectivo array
        catalogos.Cat_Producto = response.data.Cat_Producto || [];
        catalogos.Cat_Medida = response.data.Cat_Medida || [];
        catalogos.Cat_Marca = response.data.Cat_Marca || [];
        catalogos.Cat_Proveedor = response.data.Cat_Proveedor || [];

        console.log('Datos de los catálogos actualizados:', catalogos);
    } catch (error) {
        console.error('Error al obtener los datos del catálogo:', error.message);
    }
};

// Exportar el objeto `catalogos` y la función `fetchCatalogos`
module.exports = {
    catalogos,
    fetchCatalogos,
};
