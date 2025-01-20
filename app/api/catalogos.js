const axios = require('axios');

// Inicialización de los catálogos con tipos consistentes
let catalogos = {
    Cat_Producto: [],
    Cat_Medida: [],
    Cat_Marca: [],
    Cat_Proveedor: [],
};

// Función para obtener y asignar los catálogos
const fetchCatalogos = async () => {
    try {
        console.log('Iniciando solicitud para obtener catálogos...');
        
        // Realiza la solicitud a la API
        const response = await axios.get('http://localhost/backend/api/Catalogos');

        // Verifica si la respuesta tiene datos válidos
        if (response && response.data) {
            console.log('Respuesta de la API recibida:', response.data);

            // Mapeo seguro de cada catálogo
            catalogos.Cat_Producto = Array.isArray(response.data.Cat_Producto)
                ? response.data.Cat_Producto.map(item => ({
                    ID: item.ID || null,
                    DESCRIPCION: item.DESCRIPCION || 'Sin descripción'
                }))
                : [];
                
            catalogos.Cat_Medida = Array.isArray(response.data.Cat_Medida)
                ? response.data.Cat_Medida.map(item => ({
                    ID: item.ID || null,
                    DESCRIPCION: item.DESCRIPCION || 'Sin descripción'
                }))
                : [];
                
            catalogos.Cat_Marca = Array.isArray(response.data.Cat_Marca)
                ? response.data.Cat_Marca.map(item => ({
                    ID: item.ID || null,
                    DESCRIPCION: item.DESCRIPCION || 'Sin descripción'
                }))
                : [];
                
            catalogos.Cat_Proveedor = Array.isArray(response.data.Cat_Proveedor)
                ? response.data.Cat_Proveedor.map(item => ({
                    ID: item.ID || null,
                    DESCRIPCION: item.DESCRIPCION || 'Sin descripción'
                }))
                : [];

            console.log('Datos de los catálogos actualizados correctamente:', catalogos);
            return catalogos;
        } else {
            throw new Error('La respuesta de la API está vacía o malformada.');
        }
    } catch (error) {
        // Manejo de errores más detallado
        console.error('Error al obtener los datos del catálogo:', error.message);
        return Promise.reject({
            message: 'No se pudieron obtener los catálogos.',
            details: error.message
        });
    }
};

// Exportar la función y el objeto de catálogos para su reutilización
module.exports = {
    fetchCatalogos,
    catalogos
};
