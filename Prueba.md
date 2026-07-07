# PROPUESTA TÉCNICA Y ECONÓMICA
## Desarrollo de Power BI Comercial Operativo

**Cliente:** [Nombre del Cliente]  
**Fecha:** 7 de julio de 2026  
**Versión:** 1.0  
**Ref.:** PBI-COM-2026-001

**Elaborado por:**  
[Nombre de tu empresa]  
Departamento de Data & Analytics

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Entendimiento del Negocio y Objetivos](#2-entendimiento-del-negocio-y-objetivos)
3. [Propuesta de Arquitectura Tecnológica](#3-propuesta-de-arquitectura-tecnológica)
4. [Alcance Funcional del Informe](#4-alcance-funcional-del-informe)
5. [Metodología de Trabajo](#5-metodología-de-trabajo)
6. [Equipo y Esfuerzo](#6-equipo-y-esfuerzo)
7. [Propuesta Económica](#7-propuesta-económica)
8. [Prerrequisitos por Parte del Cliente](#8-prerrequisitos-por-parte-del-cliente)
9. [Entregables del Proyecto](#9-entregables-del-proyecto)
10. [Mantenimiento y Evolutivos](#10-mantenimiento-y-evolutivos)
11. [Valor Añadido y Recomendaciones Estratégicas](#11-valor-añadido-y-recomendaciones-estratégicas)
12. [Condiciones Comerciales](#12-condiciones-comerciales)
13. [Anexos](#13-anexos)

---

## 1. RESUMEN EJECUTIVO

[Nombre de tu empresa] presenta la presente propuesta técnica y económica para el desarrollo de un **Power BI Comercial Operativo** orientado a convertirse en la herramienta de trabajo diaria del equipo comercial del cliente.

El objetivo no es crear un informe de ventas tradicional, sino una **plataforma operativa centralizada** que permita a los comerciales consultar en tiempo real el estado de sus clientes, pedidos pendientes, riesgo financiero, caída de consumo y evolución comercial, facilitando la toma de decisiones y la gestión proactiva de la cartera.

La solución propuesta se basa en la **arquitectura de datos moderna de Microsoft** (Medallion Architecture sobre Lakehouse), garantizando escalabilidad, rendimiento y gobernanza, con una distribución mediante Power BI App y seguridad a nivel de fila (RLS) para que cada comercial acceda únicamente a su información.

**Plazo estimado:** 12-14 semanas  
**Inversión total:** 28.000 € – 35.000 €  
**Enfoque:** Ágil con entregas incrementales (2 Releases)

---

## 2. ENTENDIMIENTO DEL NEGOCIO Y OBJETIVOS

### 2.1. Situación Actual

El equipo comercial carece de una herramienta unificada que le permita consultar de forma rápida y operativa el estado diario de su cartera de clientes. Actualmente, la información se encuentra dispersa en el ERP, hojas de cálculo y comunicaciones internas, lo que provoca:

- Duplicidad de esfuerzos en la consulta de datos.
- Falta de visibilidad proactiva sobre riesgos financieros.
- Dificultad para detectar caídas de consumo a tiempo.
- Retrasos en la gestión de pedidos e incidencias.

### 2.2. Objetivos del Proyecto

1. **Centralizar** la información comercial, financiera y logística en una única herramienta.
2. **Operativizar** la consulta diaria: el comercial debe poder responder en menos de 30 segundos a preguntas clave sobre sus clientes.
3. **Detectar proactivamente** oportunidades (próximas compras estimadas) y riesgos (facturas vencidas, clientes bloqueados, caída de referencias).
4. **Empoderar al comercial** con una herramienta de trabajo, no solo de consulta.
5. **Mantener la solución escalable** para futuras evoluciones (IA, alertas automáticas, integraciones con Teams).

---

## 3. PROPUESTA DE ARQUITECTURA TECNOLÓGICA

### 3.1. Principios Arquitectónicos

La solución se basa en los siguientes principios:

- **Separación de capas:** ingestión, almacenamiento, modelado semántico y presentación.
- **Modelo en estrella (Star Schema):** optimizado para consultas analíticas y rendimiento en Power BI.
- **Medallion Architecture:** datos crudos (Bronze), limpios (Silver) y curados para negocio (Gold).
- **Seguridad por diseño:** Row-Level Security (RLS) integrado con Azure Active Directory.
- **Reutilización:** un único modelo semántico compartido entre las 7 páginas.

### 3.2. Diagrama de Arquitectura

*(Insertar aquí el diagrama de arquitectura generado)*

### 3.3. Descripción de Capas

#### Capa 1: Fuentes de Datos (Data Sources)
- **ERP / Base de datos transaccional:** clientes, pedidos, líneas de pedido, ventas, facturas, vencimientos, riesgo, reservas, muestras, transporte, órdenes de carga, albaranes.
- **SharePoint:** fichas técnicas de productos (referencias, marcas, grupos, orígenes, tallas).
- **CRM (opcional):** información comercial adicional si aplica.

#### Capa 2: Integración de Datos (Data Integration)
- **Azure Data Factory / Dataflows Gen2:** extracción incremental y programada de las fuentes.
- **Conectores nativos:** SQL Server, SharePoint REST API, conectores estándar de Microsoft.
- **Programación:** refresco diario nocturno + refresco incremental cada 2 horas para datos operativos (pedidos del día).

#### Capa 3: Lakehouse – Arquitectura Medallion
- **Bronze (Raw):** datos crudos sin transformación, conservando la estructura original del ERP.
- **Silver (Cleansed):** limpieza, tipado, estandarización de formatos (fechas, códigos, decimales), deduplicación.
- **Gold (Star Schema):** modelo dimensional optimizado para análisis:
  - Tablas de hechos: Ventas, Pedidos, Facturas, Vencimientos, Eventos de Pedido.
  - Tablas de dimensión: Cliente, Comercial, Zona, Provincia, Referencia, Marca, Grupo, Origen, Talla, Calendario.

#### Capa 4: Capa Semántica (Semantic Layer)
- **Power BI Dataset (Import Mode con Incremental Refresh):** modelo único compartido por todas las páginas.
- **Medidas DAX centralizadas:** +150 medidas estandarizadas (ventas del día, frecuencia media, próxima compra estimada, riesgo consumido, venta perdida, etc.).
- **Row-Level Security (RLS):** filtrado automático por comercial/zona según el usuario logueado.

#### Capa 5: Presentación y Consumo
- **Power BI Service:** publicación en área de trabajo corporativa.
- **Power BI App:** distribución con navegación por secciones (Dirección, Comercial, Finanzas).
- **Power Automate + Microsoft Teams:** alertas automáticas sobre eventos críticos (facturas vencidas, clientes bloqueados).
- **Integración SharePoint:** enlaces directos a fichas técnicas desde el informe.

### 3.4. Licenciamiento Recomendado

| Opción | Licencia | Ventajas | Recomendado para |
| :--- | :--- | :--- | :--- |
| A | Power BI Pro + Premium Per User (PPU) | RLS, Incremental Refresh, modelos grandes | Equipos < 50 usuarios |
| B | Microsoft Fabric (Capacidad F64) | Direct Lake, IA, Unificación datos | Roadmap analítico amplio |
| C | Power BI Premium (P1) | Capacidades compartidas | Equipos > 100 usuarios |

**Recomendación inicial:** Opción A (PPU) por coste-eficiencia en la primera fase.

---

## 4. ALCANCE FUNCIONAL DEL INFORME

### 4.1. Páginas del Informe

#### Página 1: Inicio Comercial
Pantalla principal con visión diaria del comercial.

**KPIs y tarjetas:**
- Ventas del día / Ventas del mes.
- Pedidos del día.
- Clientes sin compra reciente.
- Referencias con caída de consumo.
- Pedidos pendientes o con incidencia.
- Facturas vencidas / próximas a vencer.
- Clientes con riesgo bajo o bloqueado.
- Alertas principales.

**Visuales:** Tarjetas KPI, gráficos de barras comparativos, tabla de alertas priorizadas.

#### Página 2: Cliente 360
Ficha completa e interactiva del cliente.

**Datos incluidos:**
- Datos básicos, zona, provincia, comercial asignado.
- Última fecha de pedido y días desde el último pedido.
- Frecuencia media de compra y próxima compra estimada.
- Consumo mensual y anual.
- Últimos pedidos y precios aplicados.
- Descuentos vigentes.
- Top 5 referencias por volumen.
- Referencias habituales dejadas de comprar.
- Reservas pendientes y muestras enviadas.
- Riesgo concedido, consumido y disponible.
- Facturas vencidas y próxima a vencer (nº factura, nº albarán).

**Interacción:** Selección de cliente en tabla → todas las tarjetas y visuales se filtran automáticamente.

#### Página 3: Hoja de Ventas Diaria / Pedidos
Consulta operativa de pedidos por fecha.

**Columnas:** Fecha, Cliente, Zona, Provincia, Comercial, Nº Pedido, Referencias, Cantidades, Importe, Precio, Descuento, Estado, Diferencias pedido pasado vs gestionado.

**Funcionalidad:** Filtros por fecha, comercial, cliente. Exportación a Excel habilitada.

#### Página 4: Seguimiento de Pedido / Transporte
Seguimiento del estado del pedido con flujo de eventos.

**Estados:** Pedido recibido → Validado → Preparado → Orden de carga → En transporte → Albarán generado → Facturado → Entregado / Incidencia.

**Datos:** Nº Pedido, Cliente, Fecha pedido, Fecha prevista entrega, Estado, Orden de carga, Transporte, Albarán (sí/no + nº), Facturado (sí/no + nº factura), Entregado (sí/no), Incidencia, Días de retraso.

#### Página 5: Pérdida de Venta / Periodicidad
Análisis comercial para detectar caídas de consumo.

**Datos:** Cliente, Referencia, Última compra, Frecuencia habitual, Próxima compra estimada, Días de retraso, Venta esperada vs real, Venta perdida estimada, Último precio vs precio medio histórico, Evolución de consumo.

**Posibles motivos de caída (etiquetado manual o automático):** Rotura, Precio, Calidad, Falta de reposición, Cambio de tendencia, No pedido del cliente.

#### Página 6: Productos / Referencias / Marcas
Análisis multidimensional por producto.

**Datos:** Referencia, Marca, Grupo, Origen, Talla, Clientes compradores, Provincias de venta, Última fecha de venta, Último precio, Precio medio, Evolución mensual, Comparativa año actual vs anterior, Clientes que han dejado de comprar.

**Visuales agregados:** Ventas por marca, ventas por grupo, ranking de referencias.

#### Página 7: Facturación, Riesgo y Vencimientos
Consulta financiera/comercial.

**Datos:** Facturas vencidas, vencen esta semana, vencen la semana próxima. Importe vencido, pendiente. Riesgo concedido/consumido/disponible. Cobertura libre. Clientes bloqueados/en alerta.

**Detalle:** Nº factura, fecha factura, fecha vencimiento, estado factura.

### 4.2. Filtros Globales

El informe dispondrá de un panel de filtros lateral persistente con:
- Año / Mes / Semana / Día
- Zona / Provincia / Comercial
- Cliente / Referencia / Marca / Grupo / Origen / Talla
- Estado de pedido / Estado de factura

---

## 5. METODOLOGÍA DE TRABAJO

### 5.1. Enfoque: Ágil (Scrum)

- **Sprints de 2 semanas** con entregables funcionales al final de cada uno.
- **Ceremonias:** Kick-off, Sprint Planning, Daily (internas), Sprint Review con cliente, Retrospectiva.
- **Herramientas de gestión:** Azure DevOps o Jira para seguimiento de tareas y backlog.

### 5.2. Fases del Proyecto

| Fase | Descripción | Duración |
| :--- | :--- | :--- |
| 1. Descubrimiento | Talleres de negocio, análisis de datos, definición de reglas | 2 semanas |
| 2. Ingesta y Modelado | Extracción, limpieza, construcción del Star Schema | 3 semanas |
| 3. Desarrollo DAX y Lógica | Medidas, cálculos de periodicidad, riesgo, predicción | 3 semanas |
| 4. Front-End y UX | Diseño visual, navegación, integración SharePoint | 2 semanas |
| 5. Testing y UAT | Pruebas, cuadre con ERP, validación usuarios clave | 2 semanas |
| 6. Despliegue y Formación | Publicación App, RLS, formación usuarios y administradores | 1 semana |
| 7. Hiper-cuidado | Soporte intensivo post go-live | 2 semanas |

**Total:** 14 semanas (3,5 meses)

### 5.3. Releases Propuestos

**Release 1 (MVP Operativo) – Semanas 1 a 6:**
- Páginas 1, 2, 3 y 7.
- Objetivo: Cuadro de mando diario y control de riesgo.

**Release 2 (Analítico Avanzado) – Semanas 7 a 12:**
- Páginas 4, 5 y 6.
- Objetivo: Análisis de causas, predicción y seguimiento logístico.

---

## 6. EQUIPO Y ESFUERZO

### 6.1. Equipo Asignado

| Rol | Perfil | Dedicación |
| :--- | :--- | :--- |
| Arquitecto de Soluciones Data / PM | Senior (+10 años) | 20% |
| Data Engineer | Senior (+7 años) | 60% |
| Power BI Developer / DAX Expert | Senior (+5 años) | 80% |
| QA / Tester | Mid (+3 años) | 30% |

### 6.2. Desglose de Esfuerzo

| Fase | Horas |
| :--- | :--- |
| Descubrimiento y análisis | 60 h |
| Ingesta y modelado de datos | 120 h |
| Desarrollo DAX y lógica de negocio | 90 h |
| Front-End, UI/UX e integración SharePoint | 100 h |
| Testing, UAT y despliegue | 50 h |
| Formación y documentación | 30 h |
| Gestión de proyecto | 40 h |
| **TOTAL** | **~490 h** |

*Nota: El esfuerzo total puede reducirse a ~360 h si el cliente aporta datos ya normalizados y reglas de negocio documentadas.*

---

## 7. PROPUESTA ECONÓMICA

### 7.1. Coste del Proyecto

| Concepto | Importe |
| :--- | :--- |
| Desarrollo Release 1 (MVP) | 14.000 € |
| Desarrollo Release 2 (Analítico) | 16.000 € |
| Formación y documentación | 3.000 € |
| **TOTAL PROYECTO** | **33.000 €** |

*Precios no sujetos a IVA. Posible descuento del 5% por pago anticipado.*

### 7.2. Condiciones de Pago

- 30% al inicio del proyecto.
- 30% al finalizar Release 1.
- 30% al finalizar Release 2.
- 10% tras aceptación final y go-live.

---

## 8. PRERREQUISITOS POR PARTE DEL CLIENTE

Para garantizar el cumplimiento de plazos y calidad, el cliente deberá facilitar:

1. **Accesos técnicos:**
   - Credenciales de lectura a la base de datos del ERP/CRM.
   - Acceso al SharePoint corporativo con permisos de lectura.
   - Acceso al entorno de Power BI Service (área de trabajo).

2. **Recursos humanos:**
   - 1 Sponsor del proyecto (Director Comercial o equivalente).
   - 1-2 SMEs (Subject Matter Experts) disponibles para talleres y validaciones.
   - 1 Administrador IT para gestión de accesos y licencias.

3. **Documentación:**
   - Diccionario de datos del ERP (tablas y campos clave).
   - Reglas de cálculo actuales (frecuencia de compra, riesgo, etc.).
   - Estructura de zonas, provincias y asignación de comerciales.

4. **Licenciamiento Microsoft:**
   - Licencias Power BI PPU o Premium para usuarios finales.
   - Licencias Azure (si aplica Data Factory o Fabric).

---

## 9. ENTREGABLES DEL PROYECTO

1. Modelo de datos en Star Schema documentado.
2. Informe Power BI con 7 páginas publicadas como App.
3. Medidas DAX documentadas en catálogo interno.
4. Configuración de Row-Level Security (RLS).
5. Integración con SharePoint para fichas técnicas.
6. Documentación técnica del modelo y uso del informe.
7. Manual de usuario para comerciales.
8. Sesión de formación (2 horas) para usuarios clave.
9. Sesión de formación técnica (1 hora) para administradores.
10. Código fuente del modelo (archivo .pbix) entregado al cliente.

---

## 10. MANTENIMIENTO Y EVOLUTIVOS

### 10.1. Bolsa de Horas Mensual

Tras el go-live, se recomienda contratar una bolsa de horas para:
- Soporte correctivo (incidencias).
- Evolutivos menores (nuevas medidas, ajustes visuales).
- Optimización de rendimiento.
- Adaptación a cambios en el ERP.

| Concepto | Importe mensual |
| :--- | :--- |
| Bolsa de 10 horas/mes | 1.200 € |
| Bolsa de 20 horas/mes | 2.200 € |

*Horas no consumidas no son acumulables. SLA de respuesta: 24h para incidencias críticas, 48h para el resto.*

### 10.2. Evolutivos Futuros Recomendados

- Integración con Microsoft Teams para alertas automáticas.
- Uso de Copilot / IA para resúmenes automáticos de pérdida de venta.
- Página de forecasting avanzado con Machine Learning.
- Integración con Dynamics 365 Sales si aplica.

---

## 11. VALOR AÑADIDO Y RECOMENDACIONES ESTRATÉGICAS

1. **Alertas automáticas:** Configuración de Data Alerts en Power BI conectadas a Power Automate para notificar en Teams/email ante eventos críticos (facturas vencidas, clientes bloqueados).

2. **Tooltips interactivos:** Al pasar el ratón sobre un cliente en la página de Inicio, se desplegará un mini-informe con su Cliente 360 resumido, mejorando la UX.

3. **Navegación tipo App:** Diseño con botones interactivos y bookmarks para una experiencia similar a una aplicación móvil/web moderna.

4. **Escalabilidad hacia IA:** El modelo en estrella propuesto está preparado para integrar capacidades de IA (Copilot, forecasting) en fases posteriores sin rehacer la arquitectura.

5. **Gobernanza de datos:** El modelo Medallion garantiza que los datos estén limpios, documentados y reutilizables para futuros proyectos analíticos.

---

## 12. CONDICIONES COMERCIALES

- **Validez de la oferta:** 30 días desde la fecha de emisión.
- **Propiedad intelectual:** El código fuente y modelos desarrollados serán propiedad del cliente tras el pago íntegro.
- **Confidencialidad:** Ambas partes firmarán un NDA antes del inicio del proyecto.
- **Fuerza mayor:** Los plazos podrán verse afectados por retrasos en la entrega de accesos o documentación por parte del cliente.

---

## 13. ANEXOS

### Anexo A: Glosario de Términos

- **RLS (Row-Level Security):** Seguridad a nivel de fila que filtra datos según el usuario.
- **Star Schema:** Modelo de datos con tablas de hechos y dimensiones.
- **Medallion Architecture:** Arquitectura de datos en capas Bronze/Silver/Gold.
- **DAX (Data Analysis Expressions):** Lenguaje de fórmulas de Power BI.
- **Incremental Refresh:** Refresco incremental de datos para optimizar rendimiento.

### Anexo B: Referencias Técnicas

- Microsoft Fabric Documentation: https://learn.microsoft.com/fabric
- Power BI Best Practices: https://learn.microsoft.com/power-bi/guidance
- Medallion Architecture: https://learn.microsoft.com/azure/databricks/lakehouse/medallion

---

**[FIN DEL DOCUMENTO]**

---

## INSTRUCCIONES PARA USAR ESTE ARCHIVO MARKDOWN

1. **Visualización:** Puedes abrir este archivo en cualquier editor de Markdown (VS Code, Typora, Obsidian, etc.) o en visualizadores online.

2. **Conversión a PDF/Word:**
   - Usa herramientas como Pandoc: `pandoc propuesta.md -o propuesta.docx`
   - O usa conversores online de Markdown a Word/PDF
   - O copia el contenido renderizado en un documento Word

3. **Para insertar el diagrama:**
   - Guarda la imagen del diagrama en la misma carpeta que este archivo MD
   - Añade en la sección 3.2: `![Diagrama de Arquitectura](nombre_archivo_diagrama.png)`

4. **Personalización:**
   - Reemplaza `[Nombre del Cliente]` y `[Nombre de tu empresa]` con los datos reales
   - Ajusta los importes según tu tarifario
   - Modifica plazos según disponibilidad del equipo