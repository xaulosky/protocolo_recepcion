/**
 * Boxes Data Module
 * Contiene información de los boxes y pabellón de Clínica Cialo
 */

const boxesData = [
    {
        id: 1,
        nombre: "Box 1",
        alias: "Box Nutrición",
        tipo: "Nutrición / Evaluaciones",
        descripcion: "Box principal de nutrición con equipamiento especializado para evaluaciones nutricionales y composición corporal.",
        usosPrincipales: [
            "Evaluaciones nutricionales",
            "Análisis de composición corporal (InBody)",
            "Calorimetría indirecta",
            "Evaluaciones generales (según disponibilidad)"
        ],
        equipamiento: [
            { nombre: "InBody", tipo: "tecnologia", descripcion: "Analizador de composición corporal" },
            { nombre: "Calorimetría Indirecta", tipo: "tecnologia", descripcion: "Medición del gasto energético en reposo" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Sillón Berger", tipo: "mobiliario", descripcion: "Sillón para pacientes" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Nutricionistas"],
        categorias: ["nutricion", "evaluaciones"],
        icono: "apple",
        color: "emerald"
    },
    {
        id: 2,
        nombre: "Box 2",
        alias: "Box Procedimientos",
        tipo: "Procedimientos Estéticos",
        descripcion: "Box versátil para evaluaciones y procedimientos estéticos como toxina botulínica, láseres y tecnologías faciales.",
        usosPrincipales: [
            "Evaluaciones estéticas",
            "Aplicación de toxina botulínica (Botox)",
            "Tratamientos con láser",
            "Morpheus8",
            "Procedimientos faciales en general"
        ],
        equipamiento: [
            { nombre: "Camilla", tipo: "mobiliario", descripcion: "Camilla de procedimientos" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Dra. Mariane Kiss", "Dr. Nicolás Laucirica"],
        categorias: ["estetica", "procedimientos", "facial"],
        icono: "sparkles",
        color: "purple"
    },
    {
        id: 3,
        nombre: "Box 3",
        alias: "Box Corporal Ultraformer",
        tipo: "Corporal / Evaluaciones",
        descripcion: "Box corporal equipado con tecnologías de ultrasonido focalizado para tratamientos de reafirmación y remodelación.",
        usosPrincipales: [
            "Evaluaciones corporales",
            "Tratamientos con Ultraformer",
            "Tratamientos con Scizer",
            "Procedimientos corporales en general"
        ],
        equipamiento: [
            { nombre: "Camilla", tipo: "mobiliario", descripcion: "Camilla de tratamientos" },
            { nombre: "Ultraformer", tipo: "tecnologia", descripcion: "Ultrasonido microfocalizado HIFU" },
            { nombre: "Scizer", tipo: "tecnologia", descripcion: "Tecnología de reducción de grasa" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Equipo Corporal"],
        categorias: ["corporal", "evaluaciones", "tecnologia"],
        icono: "zap",
        color: "orange"
    },
    {
        id: 4,
        nombre: "Box 4",
        alias: "Box Depilación Láser",
        tipo: "Depilación / Corporal",
        descripcion: "Box más compacto especializado en depilación láser con tecnología Soprano Titanium. También disponible para evaluaciones corporales.",
        usosPrincipales: [
            "Depilación láser",
            "Evaluaciones corporales",
            "Tratamientos láser en general"
        ],
        equipamiento: [
            { nombre: "Camilla", tipo: "mobiliario", descripcion: "Camilla de tratamientos" },
            { nombre: "Soprano Titanium", tipo: "tecnologia", descripcion: "Láser de depilación triple longitud de onda" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Técnicos en depilación"],
        categorias: ["depilacion", "corporal", "laser"],
        icono: "sun",
        color: "amber"
    },
    {
        id: 5,
        nombre: "Box 5",
        alias: "Box Corporal Embody/Exilis",
        tipo: "Corporal",
        descripcion: "Box corporal equipado con tecnologías avanzadas de radiofrecuencia y tonificación muscular.",
        usosPrincipales: [
            "Tratamientos con Embody",
            "Tratamientos con Exilis Ultra 360",
            "Reafirmación corporal",
            "Tonificación muscular",
            "Reducción de grasa"
        ],
        equipamiento: [
            { nombre: "Camilla", tipo: "mobiliario", descripcion: "Camilla de tratamientos" },
            { nombre: "Embody", tipo: "tecnologia", descripcion: "Tecnología de tonificación muscular" },
            { nombre: "Exilis Ultra 360", tipo: "tecnologia", descripcion: "Radiofrecuencia + ultrasonido" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Equipo Corporal"],
        categorias: ["corporal", "tecnologia", "reafirmacion"],
        icono: "activity",
        color: "rose"
    },
    {
        id: 6,
        nombre: "Box 6",
        alias: "Box Criolipólisis",
        tipo: "Corporal / Criolipólisis",
        descripcion: "Box especializado en criolipólisis con tecnología Clatuu Alpha para eliminación de grasa localizada.",
        usosPrincipales: [
            "Evaluaciones corporales",
            "Tratamientos de criolipólisis",
            "Clatuu Alpha",
            "Reducción de grasa localizada"
        ],
        equipamiento: [
            { nombre: "Camilla", tipo: "mobiliario", descripcion: "Camilla de tratamientos" },
            { nombre: "Clatuu Alpha", tipo: "tecnologia", descripcion: "Criolipólisis de última generación" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Equipo Corporal"],
        categorias: ["corporal", "criolipolisis", "tecnologia"],
        icono: "snowflake",
        color: "cyan"
    },
    {
        id: 7,
        nombre: "Box 7",
        alias: "Box Procedimientos 2",
        tipo: "Procedimientos Estéticos",
        descripcion: "Box de procedimientos similar al Box 2, versátil para evaluaciones y diversos tratamientos estéticos.",
        usosPrincipales: [
            "Evaluaciones estéticas",
            "Aplicación de toxina botulínica (Botox)",
            "Tratamientos con láser",
            "Procedimientos faciales",
            "Procedimientos estéticos en general"
        ],
        equipamiento: [
            { nombre: "Camilla", tipo: "mobiliario", descripcion: "Camilla de procedimientos" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Dra. Mariane Kiss", "Dr. Nicolás Laucirica"],
        categorias: ["estetica", "procedimientos", "facial"],
        icono: "sparkles",
        color: "purple"
    },
    {
        id: 8,
        nombre: "Box 8",
        alias: "Box Especialidades",
        tipo: "Ginecología / Urología / Tricología",
        descripcion: "Box más amplio y cómodo con camilla especializada para ginecología. Ideal para urología, tricología y procedimientos que requieren más espacio.",
        usosPrincipales: [
            "Procedimientos ginecológicos",
            "Consultas urológicas",
            "Tratamientos de tricología",
            "Procedimientos que requieren más espacio",
            "Uso general por su comodidad"
        ],
        equipamiento: [
            { nombre: "Camilla Ginecológica", tipo: "mobiliario", descripcion: "Camilla especializada con estribos" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Dra. Villarroel", "Dr. Contreras", "Dra. Araya", "Matrona"],
        categorias: ["ginecologia", "urologia", "tricologia", "especialidades"],
        icono: "heart-pulse",
        color: "pink"
    },
    {
        id: 9,
        nombre: "Box 9",
        alias: "Box Dr. Nicolás",
        tipo: "Consultorio Médico",
        descripcion: "Box asignado al Dr. Nicolás Laucirica. Disponible para otros profesionales cuando el Dr. no está presente.",
        usosPrincipales: [
            "Consultas Dr. Nicolás Laucirica",
            "Evaluaciones médicas",
            "Disponible para otros profesionales (cuando Dr. Nicolás no atiende)"
        ],
        equipamiento: [
            { nombre: "Escritorio", tipo: "mobiliario", descripcion: "Escritorio de consulta" },
            { nombre: "iMac", tipo: "computador", descripcion: "Equipo de escritorio" },
            { nombre: "Impresora", tipo: "oficina", descripcion: "Impresora para documentos" },
            { nombre: "Lavamanos", tipo: "sanitario", descripcion: "Lavamanos integrado" }
        ],
        profesionalesFrecuentes: ["Dr. Nicolás Laucirica"],
        categorias: ["consulta", "medico", "evaluaciones"],
        icono: "stethoscope",
        color: "blue"
    },
    {
        id: 10,
        nombre: "Pabellón",
        alias: "Pabellón Cirugía Menor",
        tipo: "Cirugía Menor",
        descripcion: "Pabellón equipado para procedimientos quirúrgicos menores ambulatorios como circuncisión, vasectomía, varicocelectomía y otros.",
        usosPrincipales: [
            "Cirugías menores ambulatorias",
            "Circuncisión",
            "Vasectomía",
            "Varicocelectomía",
            "Labioplastia",
            "Procedimientos que requieren pabellón"
        ],
        equipamiento: [
            { nombre: "Mesa Quirúrgica", tipo: "mobiliario", descripcion: "Mesa de cirugía" },
            { nombre: "Lámpara Cialítica", tipo: "equipamiento", descripcion: "Iluminación quirúrgica" },
            { nombre: "Monitor de Signos", tipo: "equipamiento", descripcion: "Monitoreo de paciente" },
            { nombre: "Equipamiento Estéril", tipo: "equipamiento", descripcion: "Instrumental quirúrgico" },
            { nombre: "Lavamanos Quirúrgico", tipo: "sanitario", descripcion: "Lavamanos estéril" }
        ],
        profesionalesFrecuentes: ["Dr. Contreras", "Dra. Villarroel", "Equipo Quirúrgico"],
        categorias: ["cirugia", "pabellon", "procedimientos"],
        icono: "syringe",
        color: "red"
    }
];

// Categorías disponibles para filtrado
const boxCategorias = [
    { id: "todas", label: "Todas", icon: "layout-grid" },
    { id: "nutricion", label: "Nutrición", icon: "apple" },
    { id: "estetica", label: "Estética", icon: "sparkles" },
    { id: "corporal", label: "Corporal", icon: "zap" },
    { id: "depilacion", label: "Depilación", icon: "sun" },
    { id: "ginecologia", label: "Ginecología", icon: "heart-pulse" },
    { id: "urologia", label: "Urología", icon: "stethoscope" },
    { id: "cirugia", label: "Cirugía", icon: "syringe" }
];

// Tecnologías disponibles en la clínica
const tecnologiasClinica = [
    { nombre: "InBody", ubicacion: "Box 1", descripcion: "Analizador de composición corporal de grado médico" },
    { nombre: "Calorimetría Indirecta", ubicacion: "Box 1", descripcion: "Medición precisa del gasto energético" },
    { nombre: "Ultraformer", ubicacion: "Box 3", descripcion: "HIFU para lifting y reafirmación" },
    { nombre: "Scizer", ubicacion: "Box 3", descripcion: "Reducción de grasa focalizada" },
    { nombre: "Soprano Titanium", ubicacion: "Box 4", descripcion: "Depilación láser con triple longitud de onda" },
    { nombre: "Embody", ubicacion: "Box 5", descripcion: "Tonificación muscular electromagnética" },
    { nombre: "Exilis Ultra 360", ubicacion: "Box 5", descripcion: "Radiofrecuencia monopolar + ultrasonido" },
    { nombre: "Clatuu Alpha", ubicacion: "Box 6", descripcion: "Criolipólisis de última generación" }
];
