/**
 * Script para generar JSON compatible con WooCommerce
 * Convierte tratamientosData.js a formato de productos WooCommerce
 */

const fs = require('fs');
const path = require('path');

// Leer el archivo de tratamientos
const tratamientosPath = path.join(__dirname, 'js', 'tratamientosData.js');
const tratamientosContent = fs.readFileSync(tratamientosPath, 'utf8');

// Extraer el array de tratamientos usando eval (solo para desarrollo local)
const extractedData = tratamientosContent.match(/const tratamientosData = \[([\s\S]*?)\];/);
if (!extractedData) {
    console.error('No se pudo extraer los datos de tratamientos');
    process.exit(1);
}

// Evaluar los datos
let tratamientosData;
try {
    eval('tratamientosData = [' + extractedData[1] + '];');
} catch (e) {
    console.error('Error al parsear tratamientos:', e.message);
    process.exit(1);
}

console.log(`Total de tratamientos encontrados: ${tratamientosData.length}`);

// Convertir a formato WooCommerce
const woocommerceProducts = tratamientosData.map((tratamiento, index) => {
    // Determinar el precio (usar valorDesde como precio principal)
    const regularPrice = tratamiento.valorDesde ? tratamiento.valorDesde.toString() : '';

    // Determinar si tiene rango de precios
    const hasRange = tratamiento.valorHasta && tratamiento.valorHasta !== tratamiento.valorDesde;

    // Construir descripción completa
    let fullDescription = tratamiento.descripcion || '';

    if (tratamiento.duracion) {
        fullDescription += `\n\n<strong>Duración:</strong> ${tratamiento.duracion}`;
    }
    if (tratamiento.sesiones) {
        fullDescription += `\n<strong>Sesiones:</strong> ${tratamiento.sesiones}`;
    }
    if (tratamiento.profesional) {
        fullDescription += `\n<strong>Profesional:</strong> ${tratamiento.profesional}`;
    }
    if (tratamiento.protocolo) {
        fullDescription += `\n\n<strong>Protocolo:</strong> ${tratamiento.protocolo}`;
    }
    if (tratamiento.notas) {
        fullDescription += `\n\n<em>${tratamiento.notas.replace(/\n/g, '<br>')}</em>`;
    }

    // Construir descripción corta
    let shortDescription = `${tratamiento.especialidad || tratamiento.subcategoria}`;
    if (tratamiento.profesional) {
        shortDescription += ` - ${tratamiento.profesional}`;
    }

    // Crear producto WooCommerce
    return {
        // Campos básicos
        id: index + 1,
        sku: tratamiento.id,
        name: tratamiento.nombre,
        slug: tratamiento.id,
        type: hasRange ? 'variable' : 'simple',
        status: 'publish',
        featured: false,
        catalog_visibility: 'visible',
        description: fullDescription,
        short_description: shortDescription,

        // Precios
        regular_price: regularPrice,
        sale_price: '',
        price: regularPrice,

        // Si tiene rango de precios, agregar metadatos
        ...(hasRange && {
            meta_data: [
                { key: 'precio_desde', value: tratamiento.valorDesde?.toString() || '' },
                { key: 'precio_hasta', value: tratamiento.valorHasta?.toString() || '' }
            ]
        }),

        // Categorías
        categories: [
            { name: tratamiento.categoria },
            ...(tratamiento.subcategoria ? [{ name: tratamiento.subcategoria }] : [])
        ],

        // Tags
        tags: [
            { name: tratamiento.especialidad || '' },
            { name: tratamiento.profesional || '' }
        ].filter(t => t.name),

        // Inventario (servicios virtuales)
        manage_stock: false,
        stock_status: 'instock',
        virtual: true,
        downloadable: false,

        // Atributos personalizados
        attributes: [
            {
                name: 'Profesional',
                position: 0,
                visible: true,
                variation: false,
                options: [tratamiento.profesional || 'Por asignar']
            },
            {
                name: 'Especialidad',
                position: 1,
                visible: true,
                variation: false,
                options: [tratamiento.especialidad || tratamiento.subcategoria || '']
            },
            {
                name: 'Duración',
                position: 2,
                visible: true,
                variation: false,
                options: [tratamiento.duracion || 'Según evaluación']
            },
            {
                name: 'Sesiones',
                position: 3,
                visible: true,
                variation: false,
                options: [tratamiento.sesiones || 'Según evaluación']
            },
            {
                name: 'Requiere Evaluación',
                position: 4,
                visible: true,
                variation: false,
                options: [tratamiento.requiereEvaluacion ? 'Sí' : 'No']
            },
            {
                name: 'Evaluación Gratuita',
                position: 5,
                visible: true,
                variation: false,
                options: [tratamiento.evaluacionGratuita ? 'Sí' : 'No']
            }
        ].filter(attr => attr.options[0]),

        // Metadatos adicionales
        meta_data: [
            { key: '_categoria_tratamiento', value: tratamiento.categoria },
            { key: '_subcategoria_tratamiento', value: tratamiento.subcategoria || '' },
            { key: '_profesional', value: tratamiento.profesional || '' },
            { key: '_especialidad', value: tratamiento.especialidad || '' },
            { key: '_duracion', value: tratamiento.duracion || '' },
            { key: '_sesiones', value: tratamiento.sesiones || '' },
            { key: '_requiere_evaluacion', value: tratamiento.requiereEvaluacion ? 'yes' : 'no' },
            { key: '_evaluacion_gratuita', value: tratamiento.evaluacionGratuita ? 'yes' : 'no' },
            ...(tratamiento.protocolo ? [{ key: '_protocolo', value: tratamiento.protocolo }] : []),
            ...(tratamiento.notas ? [{ key: '_notas', value: tratamiento.notas }] : []),
            ...(tratamiento.espacio ? [{ key: '_espacio', value: tratamiento.espacio }] : []),
            ...(tratamiento.equipo ? [{ key: '_equipo', value: tratamiento.equipo }] : [])
        ]
    };
});

// Crear objeto de exportación WooCommerce
const woocommerceExport = {
    products: woocommerceProducts,
    metadata: {
        total_products: woocommerceProducts.length,
        exported_at: new Date().toISOString(),
        version: '1.0',
        source: 'Clínica Cialo - Protocolo Recepción'
    }
};

// Guardar archivo JSON
const outputPath = path.join(__dirname, 'woocommerce-products.json');
fs.writeFileSync(outputPath, JSON.stringify(woocommerceExport, null, 2), 'utf8');

console.log(`\n✅ Archivo generado exitosamente: ${outputPath}`);
console.log(`📦 Total de productos exportados: ${woocommerceProducts.length}`);

// Generar también un formato alternativo para WP All Import
const wpAllImportFormat = woocommerceProducts.map(p => ({
    post_title: p.name,
    post_content: p.description,
    post_excerpt: p.short_description,
    post_status: 'publish',
    post_type: 'product',
    sku: p.sku,
    regular_price: p.regular_price,
    sale_price: '',
    stock_status: 'instock',
    manage_stock: 'no',
    virtual: 'yes',
    category: p.categories.map(c => c.name).join(' > '),
    tags: p.tags.map(t => t.name).join(', '),
    attribute_profesional: p.attributes.find(a => a.name === 'Profesional')?.options[0] || '',
    attribute_especialidad: p.attributes.find(a => a.name === 'Especialidad')?.options[0] || '',
    attribute_duracion: p.attributes.find(a => a.name === 'Duración')?.options[0] || '',
    attribute_sesiones: p.attributes.find(a => a.name === 'Sesiones')?.options[0] || '',
    _categoria_tratamiento: p.meta_data.find(m => m.key === '_categoria_tratamiento')?.value || '',
    _subcategoria_tratamiento: p.meta_data.find(m => m.key === '_subcategoria_tratamiento')?.value || '',
    _profesional: p.meta_data.find(m => m.key === '_profesional')?.value || '',
    _requiere_evaluacion: p.meta_data.find(m => m.key === '_requiere_evaluacion')?.value || '',
    _evaluacion_gratuita: p.meta_data.find(m => m.key === '_evaluacion_gratuita')?.value || ''
}));

const wpAllImportPath = path.join(__dirname, 'woocommerce-products-wpallimport.json');
fs.writeFileSync(wpAllImportPath, JSON.stringify(wpAllImportFormat, null, 2), 'utf8');

console.log(`📄 Formato WP All Import: ${wpAllImportPath}`);

// Resumen por categorías
const categorias = {};
woocommerceProducts.forEach(p => {
    const cat = p.categories[0]?.name || 'Sin categoría';
    categorias[cat] = (categorias[cat] || 0) + 1;
});

console.log('\n📊 Resumen por categorías:');
Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} productos`);
});
