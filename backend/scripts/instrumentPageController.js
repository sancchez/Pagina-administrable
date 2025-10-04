const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'controllers', 'pageController.ts');
let src = fs.readFileSync(filePath, 'utf8');

function addAfter(regex, insertion) {
  const newSrc = src.replace(regex, (m) => m + insertion);
  const changed = newSrc !== src; src = newSrc; return changed;
}

function addBefore(regex, insertion) {
  const newSrc = src.replace(regex, (m) => insertion + m);
  const changed = newSrc !== src; src = newSrc; return changed;
}

// saveGrapesData
addAfter(/static async saveGrapesData\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.saveGrapesData] start', { id: req.params.id });\n");
addAfter(/await PageService\.saveGrapesData\([\s\S]*?\);\s*\n/, "      console.log('[PageController.saveGrapesData] done', { id: req.params.id });\n");

// getGrapesData
addAfter(/static async getGrapesData\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.getGrapesData] start', { id: req.params.id });\n");
addAfter(/await PageService\.getGrapesData\([\s\S]*?\);\s*\n/, "      console.log('[PageController.getGrapesData] done', { id: req.params.id });\n");

// saveContent
addAfter(/static async saveContent\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.saveContent] start', { id: req.params.id });\n");
addAfter(/await PageService\.saveContent\([\s\S]*?\);\s*\n/, "      console.log('[PageController.saveContent] done', { id: req.params.id });\n");

// publishPage
addAfter(/static async publishPage\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.publishPage] start', { id: req.params.id });\n");
addBefore(/\n\s*return res\.json\([\s\S]*?success:\s*true[\s\S]*?\);\s*\n\s*\}\s*catch/, "      console.log('[PageController.publishPage] done', { id: req.params.id });\n");

// publishPageBySlug
addAfter(/static async publishPageBySlug\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.publishPageBySlug] start', { slug: req.params.slug });\n");
addBefore(/\n\s*return res\.json\([\s\S]*?success:\s*true[\s\S]*?\);\s*\n\s*\}\s*catch/, "      console.log('[PageController.publishPageBySlug] done', { slug: req.params.slug });\n");

// togglePublishStatus
addAfter(/static async togglePublishStatus\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.togglePublishStatus] start', { id: req.params.id });\n");
addAfter(/await PageService\.togglePublishStatus\([\s\S]*?\);\s*\n/, "      console.log('[PageController.togglePublishStatus] done', { id: req.params.id });\n");

// getPageStats
addAfter(/static async getPageStats\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.getPageStats] start');\n");
addBefore(/\n\s*return res\.json\([\s\S]*?success:\s*true[\s\S]*?\);\s*\n\s*\}\s*catch/, "      console.log('[PageController.getPageStats] done');\n");

// getPageBackups
addAfter(/static async getPageBackups\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.getPageBackups] start', { id: req.params.id, limit: req.query.limit });\n");
addBefore(/\n\s*return res\.json\([\s\S]*?success:\s*true[\s\S]*?\);\s*\n\s*\}\s*catch/, "      console.log('[PageController.getPageBackups] done', { id: req.params.id });\n");

// restoreFromBackup
addAfter(/static async restoreFromBackup\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.restoreFromBackup] start', { id: req.params.id, backupId: req.params.backupId });\n");
addBefore(/\n\s*return res\.json\([\s\S]*?success:\s*true[\s\S]*?\);\s*\n\s*\}\s*catch/, "      console.log('[PageController.restoreFromBackup] done', { id: req.params.id, backupId: req.params.backupId });\n");

// createManualBackup
addAfter(/static async createManualBackup\([\s\S]*?\)\s*\{\s*try\s*\{\n/, "      console.log('[PageController.createManualBackup] start', { id: req.params.id });\n");
addBefore(/\n\s*return res\.json\([\s\S]*?success:\s*true[\s\S]*?\);\s*\n\s*\}\s*catch/, "      console.log('[PageController.createManualBackup] done', { id: req.params.id });\n");

fs.writeFileSync(filePath, src, 'utf8');
console.log('Instrumentation applied to', filePath);
