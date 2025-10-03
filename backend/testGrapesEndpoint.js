const fetch = require('node-fetch');

async function login() {
  const credentials = {
    email: 'admin@acueducto.com',
    password: 'admin123'
  };
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Login failed: ${res.status} ${res.statusText} - ${t}`);
  }
  const json = await res.json();
  const token = json?.data?.tokens?.accessToken;
  if (!token) {
    throw new Error(`Login response missing accessToken: ${JSON.stringify(json)}`);
  }
  return token;
}

async function testGrapesEndpoint() {
  try {
    console.log('🧪 Probando el endpoint de guardado de GrapesJS...');

    const testData = {
      grapesData: JSON.stringify({
        'gjs-html': '<div>Test HTML</div>',
        'gjs-css': '.test { color: red; }',
        'gjs-components': [ { type: 'text', content: 'Test content' } ],
        'gjs-styles': [ { selectors: ['.test'], style: { color: 'red' } } ]
      }),
      html: '<div>Test HTML</div>',
      css: '.test { color: red; }',
      gjsHtml: '<div>Test HTML</div>',
      gjsCss: '.test { color: red; }',
      gjsComponents: JSON.stringify([{ type: 'text', content: 'Test content' }]),
      gjsStyles: JSON.stringify([{ selectors: ['.test'], style: { color: 'red' } }])
    };

    console.log('🔐 Iniciando sesión como admin...');
    const token = await login();
    console.log('✅ Login exitoso, token obtenido');

    console.log('📄 Obteniendo páginas publicadas...');
    const pagesResponse = await fetch('http://localhost:3001/api/pages/published');
    if (!pagesResponse.ok) {
      const t = await pagesResponse.text();
      throw new Error(`No se pudieron obtener páginas: ${pagesResponse.status} ${pagesResponse.statusText} - ${t}`);
    }
    const pagesData = await pagesResponse.json();
    const pages = Array.isArray(pagesData.data) ? pagesData.data : pagesData.data?.pages || [];
    if (!pages || pages.length === 0) {
      throw new Error('No hay páginas publicadas disponibles para probar');
    }
    const page = pages.find(p => p.slug === 'home') || pages[0];
    console.log(`✅ Usando página: ${page.title} (slug: ${page.slug}, id: ${page.id})`);

    console.log('💾 Enviando datos de prueba al endpoint con autenticación...');
    const saveResponse = await fetch(`http://localhost:3001/api/pages/${page.id}/grapes-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status de respuesta:', saveResponse.status, saveResponse.statusText);
    const responseText = await saveResponse.text();
    console.log('📄 Respuesta completa:', responseText);

    if (!saveResponse.ok) {
      console.log('❌ Error en el endpoint:', saveResponse.status, saveResponse.statusText);
      try {
        const errorData = JSON.parse(responseText);
        console.log('🔍 Detalles del error:', errorData);
      } catch (e) {
        console.log('🔍 Respuesta no es JSON válido');
      }
    } else {
      console.log('✅ Endpoint funcionó correctamente');
      try {
        const successData = JSON.parse(responseText);
        console.log('🎉 Datos guardados:', successData);
      } catch (e) {
        console.log('⚠️ Respuesta exitosa pero no es JSON válido');
      }
    }
  } catch (error) {
    console.error('💥 Error durante la prueba:', error.message);
    console.error('📋 Stack trace:', error.stack);
  }
}

testGrapesEndpoint();