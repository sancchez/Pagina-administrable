import fs from 'fs';
import path from 'path';

async function fetchAndSave() {
    try {
        const response = await fetch('http://localhost:4000/api/pages/public/portal-usuario');
        const data = await response.json();

        fs.writeFileSync(path.join(process.cwd(), '.tmp', 'portal_content.json'), JSON.stringify(data, null, 2));
        console.log('✅ Page content saved to .tmp/portal_content.json');

        const html = data?.data?.page?.publishedHtml || data?.data?.page?.html || '';
        if (html.toLowerCase().includes('entendiendo nuestra factura')) {
            console.log('✅ "Entendiendo nuestra factura" found in HTML');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndSave();
