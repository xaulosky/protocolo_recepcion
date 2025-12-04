/**
 * Datos de Productos
 * Catálogo completo de productos Cialo
 */

const productsData = [
    {
        "id": 191068,
        "brand": "Avene",
        "name": "Agua Termal 150 ml",
        "price": 11000,
        "category": "Dermocosmética",
        "description": "Calmante. Spray esencial para calmar pieles irritadas, rojeces o post-procedimientos (láser, peeling). Restaura el equilibrio cutáneo."
    },
    {
        "id": 191069,
        "brand": "Avene",
        "name": "Agua Termal 300 ml",
        "price": 15000,
        "category": "Dermocosmética",
        "description": "Calmante. Spray formato grande esencial para calmar pieles irritadas, rojeces o post-procedimientos. Restaura el equilibrio cutáneo."
    },
    {
        "id": 191071,
        "brand": "Avene",
        "name": "Retrinal Crema 0.1 (30 ml)",
        "price": 33500,
        "category": "Dermocosmética",
        "description": "Anti-edad intensivo. Contiene Retinaldehído. Se usa para reducir arrugas profundas y mejorar la textura de la piel sin la irritación del retinol puro."
    },
    {
        "id": 191074,
        "brand": "Avene",
        "name": "Cicalfate Post Acto (40 ml)",
        "price": 17000,
        "category": "Dermocosmética",
        "description": "Reparación post-tratamiento. Emulsión ligera específica para aplicar justo después de procedimientos dermatológicos superficiales (láser, peelings) para calmar y reparar."
    },
    {
        "id": 191075,
        "brand": "Avene",
        "name": "Cicalfate (40 ml)",
        "price": 12500,
        "category": "Dermocosmética",
        "description": "Cicatrizante universal. Crema reparadora y antibacteriana para pieles dañadas, irritaciones secas, rasguños o post-cirugía menor."
    },
    {
        "id": 191076,
        "brand": "Avene",
        "name": "Cicalfate Crema (15 ml)",
        "price": 6500,
        "category": "Dermocosmética",
        "description": "Cicatrizante universal formato bolsillo. Crema reparadora y antibacteriana para pieles dañadas o zonas pequeñas."
    },
    {
        "id": 191077,
        "brand": "Avene",
        "name": "Baume Labios (10 ml)",
        "price": 6500,
        "category": "Dermocosmética",
        "description": "Reparador labial. Bálsamo intensivo para labios agrietados o muy secos, a menudo por uso de medicamentos secantes (ej. isotretinoína)."
    },
    {
        "id": 191078,
        "brand": "Avene",
        "name": "Vitamina C Activ Cg Serum (30 ml)",
        "price": 32000,
        "category": "Dermocosmética",
        "description": "Iluminador antioxidante. Serum para dar luminosidad, unificar el tono y reducir arrugas. Ideal para pieles apagadas."
    },
    {
        "id": 191632,
        "brand": "Avene",
        "name": "Rosamed Crema Concentrada Antirojeces (30 ml)",
        "price": 22000,
        "category": "Dermocosmética",
        "description": "Anti-rojeces. Tratamiento para pieles con rosácea o rojeces crónicas. Calma el calor y disminuye la reactividad vascular."
    },
    {
        "id": 191635,
        "brand": "Avene",
        "name": "Bloqueador Fluido Ultra-Mat Spf50+ Sin Color (50ml)",
        "price": 20000,
        "category": "Dermocosmética",
        "description": "Fotoprotección mate. Protector solar SPF50+ de textura ligera y acabado seco. Ideal para pieles mixtas a grasas que no quieren brillo."
    },
    {
        "id": 191636,
        "brand": "Avene",
        "name": "Bloqueador Cleanance Solar Spf50+ (50ml)",
        "price": 20000,
        "category": "Dermocosmética",
        "description": "Fotoprotección anti-acné. Específico para pieles grasas con tendencia acnéica. Protege del sol y ayuda a controlar el sebo."
    },
    {
        "id": 191637,
        "brand": "Avene",
        "name": "Bloqueador Solar Spray Spf 50+ (200 ml)",
        "price": 19000,
        "category": "Dermocosmética",
        "description": "Fotoprotección corporal. Formato spray fácil de aplicar, ideal para zonas extensas del cuerpo."
    },
    {
        "id": 191639,
        "brand": "Avene",
        "name": "Bloqueador Fluido Mineral Color Spf50+ (40ml)",
        "price": 17000,
        "category": "Dermocosmética",
        "description": "Filtros 100% físicos. Protector sin filtros químicos, ideal para pieles alérgicas, intolerantes o post-procedimientos inmediatos. Aporta un toque de color."
    },
    {
        "id": 191933,
        "brand": "Avene",
        "name": "Bloqueador Compacto Coloreado Spf 50 Dorado (10 gr)",
        "price": 22000,
        "category": "Dermocosmética",
        "description": "Maquillaje fotoprotector. Formato en crema compacta para cubrir imperfecciones (como melasma o cicatrices) mientras protege del sol."
    },
    {
        "id": 191932,
        "brand": "Avene",
        "name": "Ultra Fluid 9 Ultra Mat",
        "price": 17500,
        "category": "Dermocosmética",
        "description": "Fotoprotección diaria invisible. Fluido de muy alta protección y textura imperceptible (como agua), acabado mate instantáneo."
    },
    {
        "id": 192222,
        "brand": "Eucerin",
        "name": "Aquaphor (50 ml)",
        "price": 12000,
        "category": "Dermocosmética",
        "description": "Pomada regeneradora. Crea una barrera protectora para piel extremadamente seca, agrietada o post-procedimientos agresivos."
    },
    {
        "id": 192223,
        "brand": "Eucerin",
        "name": "PH5 Syndet Gel c/ Bomba (400 ml)",
        "price": 16000,
        "category": "Dermocosmética",
        "description": "Limpieza suave. Sustituto del jabón para pieles sensibles. Limpia sin resecar y mantiene el pH fisiológico de la piel."
    },
    {
        "id": 192224,
        "brand": "Eucerin",
        "name": "Antipigmento Crema Día (50 ml)",
        "price": 27000,
        "category": "Dermocosmética",
        "description": "Despigmentante de día. Contiene Thiamidol para reducir manchas y SPF para prevenir su reaparición."
    },
    {
        "id": 192228,
        "brand": "Eucerin",
        "name": "Antipigmento Crema Noche (50 ml)",
        "price": 28000,
        "category": "Dermocosmética",
        "description": "Despigmentante nocturno. Contiene Thiamidol y Dexpantenol para regenerar la piel y reducir manchas mientras duermes."
    },
    {
        "id": 192225,
        "brand": "Eucerin",
        "name": "Antipigmento Contorno de Ojos (15 ml)",
        "price": 25000,
        "category": "Dermocosmética",
        "description": "Ojeras pigmentarias. Formulado para reducir las manchas oscuras alrededor de los ojos y descongestionar."
    },
    {
        "id": 192227,
        "brand": "Eucerin",
        "name": "Antipigmento Serum Facial Clareador Dual (30 ml)",
        "price": 33000,
        "category": "Dermocosmética",
        "description": "Doble acción. Combina Thiamidol (manchas) y Ácido Hialurónico (arrugas). Es el producto más potente de la gama para unificar el tono."
    },
    {
        "id": 192229,
        "brand": "Eucerin",
        "name": "Antipigmento Spot Corrector (5 ml)",
        "price": 16000,
        "category": "Dermocosmética",
        "description": "Lápiz corrector. Aplicación precisa directa sobre manchas pequeñas y localizadas para un tratamiento intensivo."
    },
    {
        "id": 192232,
        "brand": "Eucerin",
        "name": "Antipigment Serum Corporal Áreas Sensibles (75 ml)",
        "price": 24000,
        "category": "Dermocosmética",
        "description": "Manchas corporales. Específico para zonas de roce (axilas, ingles) o manchas en el cuerpo, exfoliando suavemente e iluminando."
    },
    {
        "id": 192226,
        "brand": "Eucerin",
        "name": "Hyaluron Filler Anti Edad Contorno Ojos SPF 15 (15 ml)",
        "price": 28000,
        "category": "Dermocosmética",
        "description": "Relleno de arrugas perioculares. Trata las 'patas de gallo' con ácido hialurónico de alto y bajo peso molecular."
    },
    {
        "id": 193064,
        "brand": "Eucerin",
        "name": "Hyaluron Filler Crema de Día FPS 15",
        "price": 37990,
        "category": "Dermocosmética",
        "description": "Anti-arrugas diario. Rellena líneas de expresión y arrugas profundas, ideal como base de maquillaje."
    },
    {
        "id": 192231,
        "brand": "Eucerin",
        "name": "Epigenetic Serum Hyaluron Filler (30 ml)",
        "price": 46000,
        "category": "Dermocosmética",
        "description": "Rejuvenecimiento celular. Serum innovador que actúa a nivel epigenético para revertir los signos de la edad desde el origen."
    },
    {
        "id": 192230,
        "brand": "Eucerin",
        "name": "Sun Pigment Control Tinted FPS50+ Tono Claro",
        "price": 18000,
        "category": "Dermocosmética",
        "description": "Protector antimanchas con color. Previene nuevas manchas y cubre las existentes. Ideal para pacientes en tratamiento despigmentante."
    },
    {
        "id": 193065,
        "brand": "Eucerin",
        "name": "Dermo Pure Oil Control (400 ml)",
        "price": 17500,
        "category": "Dermocosmética",
        "description": "Limpieza acné. Gel limpiador para pieles grasas con imperfecciones. Elimina el exceso de sebo sin agredir."
    },
    {
        "id": 191079,
        "brand": "Obagi",
        "name": "Retinol 0.5 Smoothing (28g)",
        "price": 83000,
        "category": "Dermocosmética",
        "description": "Renovador celular intermedio. Retinol encapsulado para tratar textura irregular y primeros signos de fotoenvejecimiento."
    },
    {
        "id": 192017,
        "brand": "Obagi",
        "name": "Retinol 1.0",
        "price": 70000,
        "category": "Dermocosmética",
        "description": "Renovador celular potente. Alta concentración de Retinol para recambio celular agresivo, acné y fotoenvejecimiento avanzado."
    },
    {
        "id": 191081,
        "brand": "Obagi",
        "name": "Nu-Cil Eyelash Enhancing Serum",
        "price": 120000,
        "category": "Dermocosmética",
        "description": "Crecimiento de pestañas. Serum diseñado para aumentar la densidad, grosor y longitud de las pestañas en ciclos de 12-16 semanas."
    },
    {
        "id": 191082,
        "brand": "Obagi",
        "name": "Professional-C Serum 20% (30ml)",
        "price": 125000,
        "category": "Dermocosmética",
        "description": "Antioxidante premium. Vitamina C pura (L-ácido ascórbico) al 20%. Máxima penetración para luminosidad y protección contra radicales libres."
    },
    {
        "id": 192019,
        "brand": "Obagi",
        "name": "CLENZIderm M.D. Pore Therapy",
        "price": 44000,
        "category": "Dermocosmética",
        "description": "Tónico para acné. Solución con ácido salicílico al 2%. Desobstruye poros y trata el acné activo. Deja una sensación mentolada fuerte."
    },
    {
        "id": 193281,
        "brand": "Glisodin",
        "name": "Suplemento Glisodin",
        "price": 44000,
        "category": "Suplemento",
    },
    {
        "id": 200001,
        "brand": "ISDIN",
        "name": "Foto Ultra 100 Active Unify SPF 50+ (50 ml)",
        "price": 21990,
        "category": "Dermocosmética",
        "description": "Fotoprotector despigmentante. Protección solar muy alta con acción despigmentante. Previene y reduce las manchas causadas por el sol."
    },
    {
        "id": 200002,
        "brand": "ISDIN",
        "name": "Fusion Water Magic Color Medium SPF50 (50 ml)",
        "price": 21990,
        "category": "Dermocosmética",
        "description": "Fotoprotector con color. Textura ultraligera tipo agua con tono medio que unifica el tono de piel mientras protege del sol."
    },
    {
        "id": 200003,
        "brand": "ISDIN",
        "name": "Fotoprotector UV Mineral Brush SPF50",
        "price": 22490,
        "category": "Dermocosmética",
        "description": "Protector solar en brocha. Filtros 100% minerales en formato brocha para aplicación fácil y retoques durante el día."
    },
    {
        "id": 200004,
        "brand": "ISDIN",
        "name": "Fotoultra Redness FPS50 (50 ml)",
        "price": 22990,
        "category": "Dermocosmética",
        "description": "Fotoprotector anti-rojeces. Específico para pieles con rosácea o rojeces. Protege y calma la piel reactiva."
    },
    {
        "id": 200005,
        "brand": "ISDIN",
        "name": "Glicoisdin Gel 10 (50 mg)",
        "price": 29990,
        "category": "Dermocosmética",
        "description": "Exfoliante suave. Gel con ácido glicólico al 10% para renovación celular suave. Ideal para iniciar tratamientos exfoliantes."
    },
    {
        "id": 200006,
        "brand": "ISDIN",
        "name": "Glicoisdin Gel 15 (50 mg)",
        "price": 31990,
        "category": "Dermocosmética",
        "description": "Exfoliante moderado. Gel con ácido glicólico al 15% para renovación celular moderada. Mejora textura y luminosidad."
    },
    {
        "id": 200007,
        "brand": "ISDIN",
        "name": "Glicoisdin Gel 25 (50 mg)",
        "price": 34990,
        "category": "Dermocosmética",
        "description": "Exfoliante intensivo. Gel con ácido glicólico al 25% para renovación celular profunda. Tratamiento intensivo de manchas y arrugas."
    },
    {
        "id": 200008,
        "brand": "ISDIN",
        "name": "Reparador Labial Stick Granate (4g)",
        "price": 7990,
        "category": "Dermocosmética",
        "description": "Protector labial. Stick reparador para labios secos y agrietados con color granate. Hidratación y protección."
    },
    {
        "id": 200009,
        "brand": "ISDIN",
        "name": "Flavo-C Serum (30 ml)",
        "price": 35990,
        "category": "Dermocosmética",
        "description": "Antioxidante intensivo. Serum con Vitamina C pura que ilumina, previene el envejecimiento y protege contra radicales libres."
    },
    {
        "id": 200010,
        "brand": "ISDIN",
        "name": "Hyaluronic Concentrate",
        "price": 32990,
        "category": "Dermocosmética",
        "description": "Hidratación profunda. Concentrado de ácido hialurónico que rellena arrugas desde el interior y proporciona hidratación intensa."
    },
    {
        "id": 200011,
        "brand": "ISDIN",
        "name": "Melaclear Advanced 3%",
        "price": 43990,
        "category": "Dermocosmética",
        "description": "Despigmentante avanzado. Tratamiento intensivo con 3% de activos despigmentantes para manchas resistentes y melasma."
    }
];
