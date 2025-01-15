const axios = require('axios');

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

        // Asigna cada sección del JSON a su respectivo array
        catalogos.Cat_Producto = response.data.Cat_Producto || [];
        catalogos.Cat_Medida = response.data.Cat_Medida || [];
        catalogos.Cat_Marca = response.data.Cat_Marca || [];
        catalogos.Cat_Proveedor = response.data.Cat_Proveedor || [];

        console.log('Datos de los catálogos actualizados.');
    } catch (error) {
        console.error('Error al obtener los datos del catálogo:', error.message);
    }
};

// Ejecutar la extracción de datos
fetchCatalogos();

// Exportar los datos para usarlos en otros módulos
module.exports = catalogos;
