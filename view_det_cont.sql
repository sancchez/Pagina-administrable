SELECT * FROM view_facturas_detalle_contable WHERE YEAR=2025 AND MES=12;


SELECT 
  cuenta,comprobante,fecha,factura,doc_refe,codigo_instalacion,detalle,tipo,valor,centro_costos,year,mes
FROM 
  public.view_facturas_detalle_contable ;


drop view view_facturas_detalle_contable;
create view view_facturas_detalle_contable as 
SELECT 
 1 AS concepto,
 func_nombre_concepto(1) as n_concepto,
func_retorna_cuenta(1) AS cuenta	,32 AS comprobante
  ,to_char(a.fecha,'MM/DD/YYYY') as fecha
  ,a.codigo::text AS factura
  ,a.codigo::text AS doc_refe
  ,a.instalacion_codigo::text   as codigo_instalacion
  ,func_fecha_letras(a.fecha) ||' - '|| func_nombre_cuenta(1)  AS detalle
  ,func_retorna_tipo(1,a.estrato) AS tipo
  ,(round(func_retorna_valor_cta(1,a.codigo),0))::numeric(12,2) AS valor 
  ,a.centro_costos
   ,year,mes FROM facturas a 
UNION 

SELECT 
3 AS concepto,
 func_nombre_concepto(2) as n_concepto,
func_retorna_cuenta(2) AS cuenta
,32 AS comprobante
,to_char(a.fecha,'MM/DD/YYYY') as fecha
,a.codigo::text as factura
,a.codigo::text AS doc_refe
, a.instalacion_codigo::text  as codigo_instalacion
,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(2) AS detalle
,func_retorna_tipo(2,a.estrato) AS tipo
,(round(func_retorna_valor_cta(2,a.codigo),0))::numeric(12,2) AS valor 
,a.centro_costos
 ,year,mes FROM facturas a  

UNION 

SELECT 
3 AS concepto,
 func_nombre_concepto(3) as n_concepto,
func_retorna_cuenta(3) AS cuenta
,32 AS comprobante
,to_char(a.fecha,'MM/DD/YYYY') as fecha
,a.codigo::text as factura
,a.codigo::text AS doc_refe
, a.instalacion_codigo::text  as codigo_instalacion
,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(3) AS detalle
,func_retorna_tipo(3,a.estrato) AS tipo
,(round(func_retorna_valor_cta(3,a.codigo),0))::numeric(12,2) AS valor 
,a.centro_costos
,year,mes FROM facturas a   
UNION                
SELECT func_retorna_cuenta(4) AS cuenta	,32 AS comprobante,to_char(a.fecha,'MM/DD/YYYY') as fecha ,a.codigo::text as factura,
a.codigo::text AS doc_refe, a.instalacion_codigo::text   as codigo_instalacion,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(4) AS detalle,
func_retorna_tipo(4,a.estrato) AS tipo,(round(func_retorna_valor_cta(4,a.codigo),0))::numeric(12,2) AS valor ,a.centro_costos ,year,mes FROM facturas a 
UNION        
SELECT func_retorna_cuenta(5) AS cuenta,32 AS comprobante,to_char(a.fecha,'MM/DD/YYYY') as fecha ,a.codigo::text as factura,
a.codigo::text AS doc_refe,a.instalacion_codigo::text   as codigo_instalacion,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(5) AS detalle,
func_retorna_tipo(5,a.estrato) AS tipo ,(round(func_retorna_valor_cta(5,a.codigo),0))::numeric(12,2) AS valor  ,a.centro_costos ,year,mes FROM facturas a           
UNION
SELECT func_retorna_cuenta(6) AS cuenta,32 AS comprobante,to_char(a.fecha,'MM/DD/YYYY') as fecha,a.codigo::text as factura,
a.codigo::text AS doc_refe, a.instalacion_codigo::text  as codigo_instalacion,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(6) AS detalle,
func_retorna_tipo(6,a.estrato) AS tipo,(round(func_retorna_valor_cta(6,a.codigo),0))::numeric(12,2) AS valor ,a.centro_costos  ,year,mes FROM facturas a  
UNION SELECT func_retorna_cuenta(7) AS cuenta,32 AS comprobante,to_char(a.fecha,'MM/DD/YYYY') as fecha,a.codigo::text as factura,
a.codigo::text AS doc_refe, a.instalacion_codigo::text   as codigo_instalacion,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(7) AS detalle,
func_retorna_tipo(7,a.estrato) AS tipo,(round(func_retorna_valor_cta(7,a.codigo),0))::numeric(12,2) AS valor ,a.centro_costos  ,year,mes FROM facturas a            
UNION SELECT func_retorna_cuenta(8) AS cuenta	,32 AS comprobante ,to_char(a.fecha,'MM/DD/YYYY') as fecha ,a.codigo::text as factura ,
a.codigo::text AS doc_refe,a.instalacion_codigo::text   as codigo_instalacion ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(8) AS detalle,
func_retorna_tipo(8,a.estrato) AS tipo,(round(func_retorna_valor_cta(8,a.codigo),0))::numeric(12,2) AS valor ,a.centro_costos ,year,mes FROM facturas a          
UNION
SELECT func_retorna_cuenta(9) AS cuenta,32 AS comprobante ,to_char(a.fecha,'MM/DD/YYYY') as fecha,a.codigo::text as factura,a.codigo::text AS doc_refe ,
 a.instalacion_codigo::text  as codigo_instalacion,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(9) AS detalle ,func_retorna_tipo(9,a.estrato) AS tipo
 ,(round(func_retorna_valor_cta(9,a.codigo),0))::numeric(12,2) AS valor  ,a.centro_costos        ,year,mes FROM facturas a
 UNION 
 SELECT func_retorna_cuenta(10) AS cuenta		,32 AS comprobante    ,to_char(a.fecha,'MM/DD/YYYY') as fecha    ,a.codigo::text  as factura  
 ,a.codigo::text AS doc_refe    , a.instalacion_codigo::text  as codigo_instalacion    ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(10) AS detalle    
 ,func_retorna_tipo(10,a.estrato) AS tipo    ,(round(func_retorna_valor_cta(10,a.codigo),0))::numeric(12,2) AS valor  ,a.centro_costos  ,year,mes FROM facturas a 
UNION 
SELECT func_retorna_cuenta(11) AS cuenta		,32 AS comprobante    ,to_char(a.fecha,'MM/DD/YYYY') as fecha    ,a.codigo::text  as factura  
,a.codigo::text AS doc_refe    , a.instalacion_codigo::text   as codigo_instalacion    ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(11) AS detalle    
,func_retorna_tipo(11,a.estrato) AS tipo    ,(round(func_retorna_valor_cta(11,a.codigo),0))::numeric(12,2) AS valor,a.centro_costos  ,year,mes FROM facturas a 
UNION
SELECT func_retorna_cuenta(12) AS cuenta
		,32 AS comprobante
    ,to_char(a.fecha,'MM/DD/YYYY') as fecha
    ,a.codigo::text as factura
    ,a.codigo::text AS doc_refe
    ,a.instalacion_codigo::text  as codigo_instalacion
    ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(12) AS detalle
    ,func_retorna_tipo(12,a.estrato) AS tipo
    ,(round(func_retorna_valor_cta(12,a.codigo),0))::numeric(12,2) AS valor
    ,a.centro_costos   
  ,year,mes FROM facturas a          
UNION
SELECT func_retorna_cuenta(13) AS cuenta
		,32 AS comprobante
    ,to_char(a.fecha,'MM/DD/YYYY') as fecha
    ,a.codigo::text as factura
    ,a.codigo::text AS doc_refe
    ,func_nit_cuenta(13) AS nit
    ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(13) AS detalle
    ,func_retorna_tipo(13,a.estrato) AS tipo
     ,(round(func_retorna_valor_cta(13,a.codigo),0))::numeric(12,2) AS valor 
    ,a.centro_costos
  ,year,mes FROM facturas a 
UNION
SELECT func_retorna_cuenta(14) AS cuenta
	,32 AS comprobante
  ,to_char(a.fecha,'MM/DD/YYYY') as fecha
  ,a.codigo::text as factura
  ,a.codigo::text AS doc_refe
  --,CASE WHEN a.prefijo IS NULL THEN a.instalacion_codigo ELSE a.instalacion_codigo||'-'||a.prefijo END  as codigo_instalacion
  ,func_nit_cuenta(13) AS nit
  ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(14) AS detalle
  ,func_retorna_tipo(14,a.estrato) AS tipo
  ,(round(func_retorna_valor_cta(14,a.codigo),0))::numeric(12,2) AS valor 

  ,a.centro_costos
  ,year,mes FROM facturas a 
UNION
   SELECT func_retorna_cuenta(15) AS cuenta
    ,32 AS comprobante
    ,to_char(a.fecha,'MM/DD/YYYY') as fecha
    ,a.codigo::text as factura
    ,a.codigo::text AS doc_refe
    , a.instalacion_codigo::text   as codigo_instalacion
    ,func_fecha_letras(a.fecha)  ||' - '|| func_nombre_cuenta(15) AS detalle
    ,func_retorna_tipo(15,a.estrato) AS tipo
    ,(round(func_retorna_valor_cta(15,a.codigo),0))::numeric(12,2) AS valor 
    ,a.centro_costos
    ,year,mes FROM facturas a ;