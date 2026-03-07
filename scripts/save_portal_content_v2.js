import fs from 'fs';
import path from 'path';

async function fetchAndSave() {
    try {
        const tmpDir = path.join(process.cwd(), '.tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const response = await fetch('http://localhost:4000/api/pages/public/portal-usuario');
        if (!response.ok) {
            console.error('API Error:', response.status);
            return;
        }
        const data = await response.json();

        fs.writeFileSync(path.join(tmpDir, 'portal_content.json'), JSON.stringify(data, null, 2));
        console.log('✅ Page content saved to .tmp/portal_content.json');

        const page = data?.data?.page || data?.data;
        const html = page?.publishedHtml || page?.html || '';
        const css = page?.publishedCss || page?.css || '';

        console.log('HTML Length:', html.length);
        console.log('CSS Length:', css.length);

        // Check for weird positioning in CSS
        if (css.toLowerCase().includes('position: fixed') || css.toLowerCase().includes('position: absolute')) {
            console.log('⚠️ Potential positioning issue in CSS');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndSave();
