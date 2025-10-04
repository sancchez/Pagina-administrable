const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'services', 'pageService.ts');
let src = fs.readFileSync(filePath, 'utf8');

function injectAfterRegex(regex, insertion) {
  const newSrc = src.replace(regex, (m) => m + insertion);
  const changed = newSrc !== src; src = newSrc; return changed;
}
function addBefore(regex, insertion) {
  const newSrc = src.replace(regex, (m) => insertion + m);
  const changed = newSrc !== src; src = newSrc; return changed;
}
function addAfter(regex, insertion) {
  const newSrc = src.replace(regex, (m) => m + insertion);
  const changed = newSrc !== src; src = newSrc; return changed;
}

// saveGrapesData start log at try {
injectAfterRegex(/static async saveGrapesData\([\s\S]*?\)\s*:\s*Promise[^{]*\{\s*try\s*\{\n/, "      console.log('[PageService.saveGrapesData] start', { id, payloadLen: (grapesDataString || '').length, htmlLen: (html || '').length, cssLen: (css || '').length });\n");

// log before backup creation
addBefore(/\s*await this\.createBackup\(page\);/, "        console.log('[PageService.saveGrapesData] creating backup before save', { pageId: page.id, slug: page.slug });\n");

// warn when generatedContent is set to null after catch
addBefore(/\s*generatedContent\s*=\s*null\s*;/g, "      console.warn('[PageService.saveGrapesData] generatePublicContent failed, continuing');\n");

// log resolved content lengths after html/css to save
addAfter(/const htmlToSave\s*=\s*[^;]*;\s*\n\s*const cssToSave\s*=\s*[^;]*;/, "\n      console.log('[PageService.saveGrapesData] resolved content lengths', { htmlLen: (htmlToSave || '').length, cssLen: (cssToSave || '').length });\n");

// after prisma update in saveGrapesData
addAfter(/const updatedPage\s*=\s*await prisma\.page\.update\([\s\S]*?\);\s*\n/, "      console.log('[PageService.saveGrapesData] page updated', { id, slug: updatedPage.slug });\n");

// auto publish logs around publish call
addBefore(/\s*const published\s*=\s*await PageService\.publishPage\(page\.slug\);\s*\n/, "      console.log('[PageService.saveGrapesData] auto publish start', { slug: page.slug });\n");
addAfter(/\s*const published\s*=\s*await PageService\.publishPage\(page\.slug\);\s*\n/, "      console.log('[PageService.saveGrapesData] auto publish done', { slug: page.slug, htmlLen: (published.publishedHtml || '').length, cssLen: (published.publishedCss || '').length });\n");

// saveContent start log
injectAfterRegex(/static async saveContent\([\s\S]*?\)\s*:\s*Promise[^{]*\{\s*try\s*\{\n/, "      console.log('[PageService.saveContent] start', { id, contentLen: (content || '').length });\n");

// saveContent after update
addAfter(/const updatedPage\s*=\s*await prisma\.page\.update\([\s\S]*?content[\s\S]*?updatedAt:\s*new Date\([\s\S]*?\);\s*\n/, "      console.log('[PageService.saveContent] page updated', { id });\n");

// publishPage start
addAfter(/static async publishPage\(slug:\s*string\):\s*Promise<any>\s*\{\s*\n/, "    console.log('[PageService.publishPage] start', { slug });\n");

// publishPage resolved lengths
addAfter(/const htmlToPublish\s*=\s*[^;]*;\s*\n\s*const cssToPublish\s*=\s*[^;]*;/, "\n    console.log('[PageService.publishPage] resolved publish lengths', { htmlLen: (htmlToPublish || '').length, cssLen: (cssToPublish || '').length });\n");

// publishPage done before return
addBefore(/\n\s*return published;\s*\n\s*\}/, "\n    console.log('[PageService.publishPage] done', { id: page.id, slug });\n");

// togglePublishStatus start
injectAfterRegex(/static async togglePublishStatus\([\s\S]*?\)\s*:\s*Promise[^{]*\{\s*try\s*\{\n/, "      console.log('[PageService.togglePublishStatus] start', { id });\n");

// togglePublishStatus done
addAfter(/const updatedPage\s*=\s*await prisma\.page\.update\([\s\S]*?isActive[\s\S]*?updatedAt:\s*new Date\([\s\S]*?\);\s*\n/, "      console.log('[PageService.togglePublishStatus] done', { id, isActive: updatedPage.isActive });\n");

// createBackup start/done
injectAfterRegex(/static async createBackup\([\s\S]*?\)\s*:\s*Promise<PageBackup>\s*\{\s*try\s*\{\n/, "      console.log('[PageService.createBackup] start', { pageId: page.id, slug: page.slug });\n");
addBefore(/\n\s*return backup;\s*\n\s*\}\s*catch/, "      console.log('[PageService.createBackup] done', { backupId: backup.id });\n");

// restoreFromBackup start/done
injectAfterRegex(/static async restoreFromBackup\([\s\S]*?\)\s*:\s*Promise<Page>\s*\{\s*try\s*\{\n/, "      console.log('[PageService.restoreFromBackup] start', { pageId, backupId });\n");
addBefore(/\n\s*return restoredPage;\s*\n\s*\}\s*catch/, "      console.log('[PageService.restoreFromBackup] done', { pageId });\n");

fs.writeFileSync(filePath, src, 'utf8');
console.log('Instrumentation applied to', filePath);
