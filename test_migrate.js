import fetch from 'node-fetch';

async function testMigrateHtml() {
  const htmlContent = `<h1>Hello World</h1><p>This is a test paragraph.</p><div><p>Another paragraph inside a div.</p></div>`;

  try {
    const response = await fetch('http://localhost:3000/api/admin/migrate-html', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
      },
      body: htmlContent,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Migración exitosa:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error(`Error en la migración: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
}

testMigrateHtml();