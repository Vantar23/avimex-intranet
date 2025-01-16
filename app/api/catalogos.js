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
        console.log('Iniciando solicitud para obtener catálogos...');
        const response = await axios.get('http://localhost/backend/api/Catalogos');

        if (response && response.data) {
            console.log('Respuesta de la API recibida:', response.data);

            // Asigna cada sección del JSON a su respectivo array
            catalogos.Cat_Producto = response.data.Cat_Producto.map(item => ({
                ID: item.ID,
                DESCRIPCION: item.DESCRIPCION
            })) || [];
            catalogos.Cat_Medida = response.data.Cat_Medida.map(item => ({
                ID: item.ID,
                DESCRIPCION: item.DESCRIPCION
            })) || [];
            catalogos.Cat_Marca = response.data.Cat_Marca.map(item => ({
                ID: item.ID,
                DESCRIPCION: item.DESCRIPCION
            })) || [];
            catalogos.Cat_Proveedor = response.data.Cat_Proveedor.map(item => ({
                ID: item.ID,
                DESCRIPCION: item.DESCRIPCION
            })) || [];

            console.log('Datos de los catálogos actualizados:', catalogos);
            return catalogos;
        } else {
            throw new Error('La respuesta de la API está vacía o malformada.');
        }
    } catch (error) {
        console.error('Error al obtener los datos del catálogo:', error.message);
        throw error; // Lanza el error para que pueda ser manejado en otro lugar si es necesario
    }
};

// Exportar la función y los datos para usarlos en otros módulos
module.exports = {
    fetchCatalogos,
    catalogos
};
