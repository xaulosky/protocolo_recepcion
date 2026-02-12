
const ExcelExporter = {
    exportToExcel: function (data, fileName = 'tratamientos_catalogo.xlsx') {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        // 1. Transform data for Excel
        const excelData = data.map(t => {
            // Helper to join arrays with newlines
            const formatList = (list) => Array.isArray(list) ? list.join('\n') : (list || '');

            // Helper to format insumos
            const formatInsumos = (insumos) => {
                if (!insumos || !Array.isArray(insumos)) return '';
                return insumos.map(i => {
                    const nota = i.nota ? ` (${i.nota})` : '';
                    const valor = i.valor ? ` - ${i.valor}` : '';
                    return `• ${i.cantidad}x ${i.item}${nota}${valor}`;
                }).join('\n');
            };

            // Helper to format personal
            const formatPersonal = (personal) => {
                if (!personal || !Array.isArray(personal)) return '';
                return personal.map(p => `• ${p}`).join('\n');
            };

            return {
                'ID': t.id,
                'Categoría': t.categoria,
                'Subcategoría': t.subcategoria || '',
                'Nombre Tratamiento': t.nombre,
                'Profesional': t.profesional || 'Clínica',
                'Especialidad': t.especialidad || '',
                'Descripción': t.descripcion || '',
                'Valor Desde': t.valorDesde || '',
                'Valor Hasta': t.valorHasta || '',
                'Duración': t.duracion || '',
                'Sesiones': t.sesiones || '',
                'Indicaciones': formatList(t.indicaciones),
                'Contraindicaciones': formatList(t.contraindicaciones),
                'Pre-Tratamiento': formatList(t.preTratamiento),
                'Post-Tratamiento': formatList(t.postTratamiento),
                'Personal Requerido': formatPersonal(t.personal),
                'Insumos / Costos': formatInsumos(t.insumos),
                'Detalle Zonas (Láser)': t.zonas ? t.zonas.map(cat =>
                    `${cat.categoria}:\n` +
                    cat.items.map(z => `  - ${z.zona}: $${z.precioSesion} (Sesión) / $${z.precioPack} (Pack)`).join('\n')
                ).join('\n\n') : '',
                'Evaluación Gratuita': t.evaluacionGratuita ? 'Sí' : 'No',
                'Requiere Evaluación': t.requiereEvaluacion ? 'Sí' : 'No',
                'Notas Adicionales': t.notas || ''
            };
        });

        // 2. Create Worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // 3. Auto-adjust column widths (naive approach)
        const colWidths = [
            { wch: 20 }, // ID
            { wch: 15 }, // Categoria
            { wch: 20 }, // Subcategoria
            { wch: 40 }, // Nombre
            { wch: 25 }, // Profesional
            { wch: 25 }, // Especialidad
            { wch: 50 }, // Descripcion
            { wch: 12 }, // Valor D
            { wch: 12 }, // Valor H
            { wch: 15 }, // Duracion
            { wch: 20 }, // Sesiones
            { wch: 40 }, // Indicaciones
            { wch: 40 }, // Contra
            { wch: 40 }, // Pre
            { wch: 40 }, // Post
            { wch: 30 }, // Personal
            { wch: 40 }, // Insumos
            { wch: 10 }, // Eval Grat
            { wch: 10 }, // Req Eval
            { wch: 30 }  // Notas
        ];
        ws['!cols'] = colWidths;

        // 4. Create Workbook and Append Sheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tratamientos");

        // 5. Export
        XLSX.writeFile(wb, fileName);
    }
};
