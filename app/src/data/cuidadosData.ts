export interface CuidadoSeccion {
  titulo: string;
  items: string[];
}

export interface CuidadoPost {
  id: string;
  titulo: string;
  tratamiento: string;
  intro: string;
  secciones: CuidadoSeccion[];
}

export const cuidadosPostData: CuidadoPost[] = [
  {
    id: 'telangiectasias-venas-reticulares',
    titulo: 'CUIDADOS POST-TRATAMIENTO TELANGIECTASIAS Y VENAS RETICULARES',
    tratamiento: 'Telangiectasias y Venas Reticulares',
    intro: 'A continuación encontrará las recomendaciones para los días posteriores a su tratamiento. Seguir estas indicaciones ayuda a mejorar los resultados y disminuir el riesgo de efectos indeseados.',
    secciones: [
      {
        titulo: '1. COMPRESIÓN',
        items: [
          'Use las medias de compresión indicadas por su médico.',
          '24 horas continuas después del procedimiento (sin retirar, salvo indicación contraria).',
          'Luego: solo durante el día por _____ días / semanas (según indicación médica).',
          'Colóquelas por la mañana, antes de levantarse completamente de la cama, y retírelas por la noche.',
        ],
      },
      {
        titulo: '2. ACTIVIDAD FÍSICA Y MOVILIDAD',
        items: [
          'Se recomienda caminar desde el mismo día del procedimiento (ej. 10–20 minutos, varias veces al día).',
          'Puede realizar sus actividades habituales que no impliquen esfuerzo intenso.',
          'Durante los primeros 3–5 días, evite: ejercicio de alto impacto (trote, saltos, crossfit, etc.), levantar peso excesivo.',
          'Evite permanecer muchas horas de pie o sentado sin moverse; levántese y camine unos minutos cada 1–2 horas.',
        ],
      },
      {
        titulo: '3. CUIDADO DE LA PIEL Y DUCHA',
        items: [
          'Puede ducharse al día siguiente, con agua tibia, evitando el agua muy caliente sobre la zona tratada.',
          'No frotar con fuerza la piel; séquela con toques suaves con la toalla.',
          'No use cremas, aceites, productos irritantes ni medicamentos tópicos en las zonas tratadas, salvo indicación médica.',
          'Si se colocaron apósitos o gasas, siga la indicación de su médico sobre cuándo retirarlos.',
        ],
      },
      {
        titulo: '4. EXPOSICIÓN AL SOL',
        items: [
          'Evite la exposición directa al sol o solarium sobre las zonas tratadas por al menos 4 semanas o el tiempo indicado.',
          'Si se expone al exterior, use ropa que cubra la zona o aplique protector solar FPS 50+ una vez que la piel esté íntegra.',
          'La exposición al sol sin protección aumenta el riesgo de manchas (hiperpigmentación).',
        ],
      },
      {
        titulo: '5. DOLOR, MOLESTIAS Y MEDICACIÓN',
        items: [
          'Es normal: molestia leve, sensación de tirantez o sensibilidad en las venas tratadas; moretones (hematomas) o pequeños cordones duros bajo la piel.',
          'Puede usar analgésicos habituales que tolere bien (por ejemplo, paracetamol), salvo que su médico indique otra cosa.',
          'Compresas frías (siempre con un paño de por medio) durante 10–15 minutos, varias veces al día, en las primeras 24–48 horas si hay molestia o calor local.',
          'No use antiinflamatorios ni medicamentos adicionales sin consultar a su médico si tiene otras enfermedades, toma anticoagulantes u otros fármacos habituales.',
        ],
      },
      {
        titulo: '6. ¿QUÉ ES ESPERABLE DESPUÉS DEL TRATAMIENTO?',
        items: [
          'Aparición de moretones en el sitio de las inyecciones o disparos de láser.',
          'Pequeñas manchas rojizas o moradas, que irán cambiando de color y desapareciendo con el tiempo.',
          'Sensación de cordones venosos duros o nódulos pequeños a lo largo de las venas tratadas.',
          'Ligero enrojecimiento o inflamación local.',
          'Estos cambios suelen mejorar progresivamente en las semanas siguientes. El resultado estético no es inmediato; la mejoría se aprecia de forma gradual.',
        ],
      },
      {
        titulo: '7. SIGNOS DE ALERTA – CUÁNDO CONSULTAR',
        items: [
          'Dolor intenso, creciente y localizado en una zona tratada que no mejora con analgésicos simples.',
          'Enrojecimiento importante, calor, inflamación y dolor que sugieran infección o celulitis.',
          'Aparición de ampollas, costras extensas, heridas o zonas negras en la piel.',
          'Inflamación marcada de una pierna con dolor y aumento de volumen, especialmente con sensación de calor.',
          'Fiebre, malestar general intenso o escalofríos.',
          'Dificultad para respirar, dolor en el pecho, mareos intensos o hinchazón brusca de una extremidad → acudir INMEDIATAMENTE a urgencias.',
        ],
      },
      {
        titulo: '8. CONTROLES Y PRÓXIMAS SESIONES',
        items: [
          'Su médico le indicará la fecha del próximo control y si serán necesarias nuevas sesiones de tratamiento.',
          'Es importante asistir a los controles para evaluar la evolución, tomar fotografías comparativas y ajustar el plan terapéutico.',
        ],
      },
    ],
  },
];
