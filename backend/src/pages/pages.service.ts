import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { Page } from '@prisma/client';
import * as createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Ajv from 'ajv';
import { craftJsSchema } from './schemas/craftjs.schema';

enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export { PageStatus };

interface PageBackup {
  timestamp: string;
  data: any;
  size: number;
}

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const ajv = new Ajv();
const validate = ajv.compile(craftJsSchema);

@Injectable()
export class PagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Page[]> {
    return this.databaseService.page.findMany();
  }

  async findOne(id: string): Promise<Page | null> {
    return this.databaseService.page.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.databaseService.page.findUnique({ where: { id: slug } });
  }

  async create(createPageDto: CreatePageDto, userId: string): Promise<Page> {
    const { page } = await this.updateOrCreate(null, createPageDto, userId);
    return page;
  }

  async update(id: string, updatePageDto: UpdatePageDto, userId: string): Promise<Page> {
    const { page } = await this.updateOrCreate(id, updatePageDto, userId);
    return page;
  }

  async remove(id: string, userId: string): Promise<Page> {
    const existingPage = await this.databaseService.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return this.databaseService.page.delete({ where: { id } });
  }

  async publishPage(id: string): Promise<Page> {
    const page = await this.databaseService.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    if (!page.draft_json) {
      throw new BadRequestException('Cannot publish a page without draft_json content.');
    }

    return this.databaseService.page.update({
      where: { id },
      data: { published_json: page.draft_json, status: PageStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async unpublishPage(id: string): Promise<Page> {
    const existingPage = await this.databaseService.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    if (!existingPage.published_json) {
      throw new BadRequestException(`Page with ID ${id} is not published`);
    }

    return this.databaseService.page.update({
      where: { id },
      data: { published_json: null, status: PageStatus.DRAFT },
    });
  }

  async revertToPublished(id: string): Promise<Page> {
    const existingPage = await this.databaseService.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    if (!existingPage.published_json) {
      throw new BadRequestException(`Page with ID ${id} has no published version to revert to`);
    }

    return this.databaseService.page.update({
      where: { id },
      data: {
        draft_json: existingPage.published_json,
        status: PageStatus.PUBLISHED,
      },
    });
  }

  private sanitizeHtmlContent(htmlContent: string): string {
    return DOMPurify.sanitize(htmlContent);
  }

  async updateOrCreate(
    id: string | null,
    pageDto: CreatePageDto | UpdatePageDto,
    userId: string,
  ): Promise<{ page: Page; created: boolean }> {
    let existingPage: Page | null = null;
    if (id) {
      existingPage = await this.databaseService.page.findUnique({ where: { id } });
    }
    let created = false;

    if (pageDto.published_json) {
      pageDto.status = PageStatus.PUBLISHED;
    }

    if (pageDto.draft_json) {
      if (!this.validateCraftJsJson(pageDto.draft_json)) {
        throw new BadRequestException('Invalid Craft.js JSON structure.');
      }
    }

    if (existingPage) {
      const updatedPage = await this.databaseService.page.update({
        where: { id: existingPage.id },
        data: { ...pageDto },
      });
      return { page: updatedPage, created: false };
    } else {
      // Si no existe, creamos una nueva página
      if (!pageDto.title) {
        throw new BadRequestException('Title is required for new pages.');
      }
      const createPageData: CreatePageDto = pageDto as CreatePageDto;
      const newPage = await this.databaseService.page.create({
            data: { ...createPageData, id: createPageData.id },
          });
      created = true;
      return { page: newPage, created: true };
    }
  }

  async getPublishedPage(id: string): Promise<Page | null> {
    const page = await this.databaseService.page.findUnique({
      where: { id, status: PageStatus.PUBLISHED },
    });
    if (!page) {
      throw new NotFoundException(`Published page with ID ${id} not found`);
    }
    return page;
  }

  async getAdminPage(id: string): Promise<Page | null> {
    const page = await this.databaseService.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return page;
  }

  async createBackup(pageId: string, userId: string): Promise<{ timestamp: string; data: any; size: number }> {
    const pages = await this.databaseService.page.findMany();
    const backupData = { timestamp: new Date().toISOString(), pages, createdBy: userId };
    const backupJson = JSON.stringify(backupData);
    const sizeInBytes = Buffer.byteLength(backupJson, 'utf8');
    // Aquí deberías guardar el backup en algún lugar, por ejemplo, en un archivo o en una base de datos de backups.
    // Por ahora, solo lo logearemos.
    console.log(`Backup created for page ${pageId} by user ${userId}:`, backupData);
    return { timestamp: backupData.timestamp, data: backupData, size: sizeInBytes };
  }

  private validateCraftJsJson(jsonContent: any): boolean {
    const isValid = validate(jsonContent);
    if (!isValid) {
      console.error('Craft.js JSON validation errors:', validate.errors);
    }
    return isValid;
  }

  async restoreBackup(backupData: any, userId: string): Promise<{ pagesRestored: number; timestamp: string }> {
    if (!backupData || !backupData.pages || !Array.isArray(backupData.pages)) {
      throw new BadRequestException('Invalid backup data format.');
    }

    let pagesRestored = 0;
    for (const pageData of backupData.pages) {
      const { id, createdAt, updatedAt, publishedAt, createdBy, updatedBy, ...dataToRestore } = pageData;
      await this.databaseService.page.upsert({
        where: { id: pageData.id },
        update: { ...dataToRestore, updatedBy: userId },
        create: { ...dataToRestore, id: pageData.id, createdBy: userId, updatedBy: userId },
      });
      pagesRestored++;
    }
    return { pagesRestored, timestamp: new Date().toISOString() };
  }

  async migrateHtmlToCraftJs(htmlContent: string, userId: string): Promise<any> {
    const dom = new JSDOM('').window.document;
    const document = dom;

    const convertNodeToCraftJs = (node: Node): any => {
      if (node.nodeType === dom.TEXT_NODE) {
        return { type: { resolvedName: 'Text' }, props: { text: node.textContent } };
      }

      if (node.nodeType !== dom.ELEMENT_NODE) {
        return null;
      }

      const element = node as HTMLElement;
      let craftJsNode: any = { type: { resolvedName: 'Container' }, props: {}, nodes: [] };

      switch (element.tagName.toLowerCase()) {
        case 'p':
          craftJsNode.type.resolvedName = 'Text';
          craftJsNode.props.text = element.textContent;
          break;
        case 'h1':
          craftJsNode.type.resolvedName = 'Text';
          craftJsNode.props.text = element.textContent;
          craftJsNode.props.fontSize = '30px'; // Example: set font size for H1
          break;
        case 'div':
          craftJsNode.type.resolvedName = 'Container';
          break;
        // Add more cases for other HTML tags as needed
        default:
          // For unsupported tags, treat them as a container or just process their children
          craftJsNode.type.resolvedName = 'Container';
          break;
      }

      // Process children
      if (element.hasChildNodes()) {
        element.childNodes.forEach(child => {
          const childCraftJsNode = convertNodeToCraftJs(child);
          if (childCraftJsNode) {
            craftJsNode.nodes.push(childCraftJsNode);
          }
        });
      }

      return craftJsNode;
    };

    const rootNodes: any[] = [];
    document.body.childNodes.forEach(node => {
      const craftNode = convertNodeToCraftJs(node);
      if (craftNode) {
        rootNodes.push(craftNode);
      }
    });

    const craftJsJson = {
      ROOT: {
        type: { resolvedName: 'Container' },
        is: 'root',
        nodes: rootNodes.map((_, index) => `node-${index}`),
        props: {},
        custom: {},
        linkedNodes: {},
      },
      // Add individual nodes to the craftJsJson object
      ...rootNodes.reduce((acc, node, index) => ({
        ...acc,
        [`node-${index}`]: node,
      }), {}),
    };

    // Validate the generated Craft.js JSON
    if (!this.validateCraftJsJson(craftJsJson)) {
      console.error('Generated Craft.js JSON is invalid.');
      throw new BadRequestException('Generated Craft.js JSON is invalid.');
    }

    return craftJsJson;
  }
}