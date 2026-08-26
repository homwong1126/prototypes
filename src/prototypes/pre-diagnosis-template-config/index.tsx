/**
 * @name 预诊模板配置
 * @mode axure
 *
 * 业务说明：
 * - 通过预约单 / 环检单记录的客户问题，对这些问题做深度检查的配置模板
 * - 数据结构：一级分类 → 二级分类 → 故障现象 → (故障原因[]、通用技术检查工位[])
 * - 通用技术检查按工位组织：接车区 / 车内（低压上电）/ 车内（高压上电）/ 举升机工位
 *
 * 参考资料：
 * - /src/prototypes/pre-diagnosis-rule-config/index.tsx
 * - /src/docs/pc-prototype-design-spec.md
 */
import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CarFront,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FilePenLine,
  LayoutTemplate,
  ListTree,
  Plus,
  Search,
  Settings,
  Trash2,
  UploadCloud,
  Wrench,
} from 'lucide-react'
import './style.css'

type TemplateStatus = '启用' | '停用'
type ViewMode = 'list' | 'edit'

// 推荐工位（用作"快捷新增"入口；不限制实际工位名）
const PRESET_STATIONS = [
  '接车区',
  '车内（低压上电，不踩刹车）',
  '车内（高压上电，踩刹车 ready）',
  '举升机工位',
] as const

interface VehicleVariant {
  id: string
  series: string
  model: string
  year: string
  powerType: string
  trimLevel: string
  isDefault?: boolean
}

interface FaultCause {
  id: string
  category: string
  detail: string
}

interface DiagnosisStep {
  id: string
  order: number
  description: string
  reference?: string
}

interface DiagnosisStation {
  id: string
  station: string
  steps: DiagnosisStep[]
}

interface DeepDiagnosisStep {
  id: string
  order: number
  title: string
  operation: string
  keyPoints: string[]
}

interface FaultSymptom {
  id: string
  name: string
  causes: FaultCause[]
  stations: DiagnosisStation[]
  deepDiagnosisGuides?: DeepDiagnosisStep[]
}

interface ProblemCategoryL2 {
  id: string
  name: string
  symptoms: FaultSymptom[]
}

interface ProblemCategoryL1 {
  id: string
  name: string
  l2List: ProblemCategoryL2[]
}

interface DiagnosisTemplate {
  id: string
  name: string
  code: string
  brand: string
  description: string
  status: TemplateStatus
  updatedAt: string
  updatedBy: string
  variants: VehicleVariant[]
  problemCategories: ProblemCategoryL1[]
}

interface ImportedTemplateRow {
  l1Name: string
  l2Name: string
  symptomName: string
  causeCategory: string
  causeDetail: string
  stationName: string
  stepDescription: string
  reference: string
}

interface ImportPreview {
  l1Count: number
  l2Count: number
  symptomCount: number
  causeCount: number
  stationCount: number
  stepCount: number
}

interface ImportMergeResult {
  problemCategories: ProblemCategoryL1[]
  selectedSymptomId: string
  expandedL1Ids: string[]
}

interface ImportHistoryRecord {
  id: string
  importTime: string
  operator: string
  fileName: string
  status: '成功' | '失败'
  total: number
  dataText: string
}

const importFieldAliases: Record<keyof ImportedTemplateRow, string[]> = {
  l1Name: ['一级分类', '一级', '问题分类', '问题一级分类', 'l1', 'l1name', 'category1'],
  l2Name: ['二级分类', '二级', '问题二级分类', 'l2', 'l2name', 'category2'],
  symptomName: ['故障现象', '现象', '问题现象', 'symptom', 'symptomname'],
  causeCategory: ['系统类别', '原因类别', '故障原因类别', 'causecategory'],
  causeDetail: ['故障原因', '原因', '子项', '说明', '原因说明', 'causedetail'],
  stationName: ['工位', '检查工位', 'station', 'stationname'],
  stepDescription: ['步骤描述', '检查步骤', '步骤', '排查步骤', 'step', 'description'],
  reference: ['参考资料', '参考工具', '工具', '资料', 'reference'],
}

const importColumnOrder: (keyof ImportedTemplateRow)[] = [
  'l1Name',
  'l2Name',
  'symptomName',
  'causeCategory',
  'causeDetail',
  'stationName',
  'stepDescription',
  'reference',
]

const importTemplateFileName = '预诊模板导入模板.xlsx'

const importTemplateRows = [
  ['一级分类', '二级分类', '故障现象', '系统类别', '故障原因', '工位', '步骤描述', '参考资料'],
  ['三电系统', '高压电池', '高压电池报警', '三电系统', 'BMS 上报电芯压差异常', '接车区', '读取高压电池报警码并记录故障码', '诊断仪 / BMS 数据流'],
  ['智能座舱系统', '中控屏', '中控屏黑屏', '座舱系统', '屏幕供电异常', '车内（低压上电）', '检查中控屏供电、搭铁与保险状态', '万用表 / 电路图'],
]

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getExcelColumnName(index: number) {
  let value = index + 1
  let name = ''
  while (value > 0) {
    const remainder = (value - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    value = Math.floor((value - 1) / 26)
  }
  return name
}

function buildImportTemplateSheetXml(rows: string[][]) {
  const sheetRows = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1
    const cells = row.map((cell, columnIndex) => {
      const ref = `${getExcelColumnName(columnIndex)}${rowNumber}`
      return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`
    }).join('')
    return `<row r="${rowNumber}">${cells}</row>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols><col min="1" max="8" width="24" customWidth="1"/></cols><sheetData>${sheetRows}</sheetData></worksheet>`
}

function buildCrcTable() {
  const table: number[] = []
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }
  return table
}

const crcTable = buildCrcTable()

function getCrc32(data: Uint8Array) {
  let crc = 0xffffffff
  data.forEach(byte => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  })
  return (crc ^ 0xffffffff) >>> 0
}

function writeZipUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
}

function writeZipUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
  target[offset + 2] = (value >>> 16) & 0xff
  target[offset + 3] = (value >>> 24) & 0xff
}

function createZipArchive(files: Record<string, string>) {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name)
    const data = encoder.encode(content)
    const crc = getCrc32(data)
    const localHeader = new Uint8Array(30 + nameBytes.length)
    writeZipUint32(localHeader, 0, 0x04034b50)
    writeZipUint16(localHeader, 4, 20)
    writeZipUint16(localHeader, 6, 0)
    writeZipUint16(localHeader, 8, 0)
    writeZipUint16(localHeader, 10, 0)
    writeZipUint16(localHeader, 12, 0)
    writeZipUint32(localHeader, 14, crc)
    writeZipUint32(localHeader, 18, data.length)
    writeZipUint32(localHeader, 22, data.length)
    writeZipUint16(localHeader, 26, nameBytes.length)
    writeZipUint16(localHeader, 28, 0)
    localHeader.set(nameBytes, 30)
    localParts.push(localHeader, data)

    const centralHeader = new Uint8Array(46 + nameBytes.length)
    writeZipUint32(centralHeader, 0, 0x02014b50)
    writeZipUint16(centralHeader, 4, 20)
    writeZipUint16(centralHeader, 6, 20)
    writeZipUint16(centralHeader, 8, 0)
    writeZipUint16(centralHeader, 10, 0)
    writeZipUint16(centralHeader, 12, 0)
    writeZipUint16(centralHeader, 14, 0)
    writeZipUint32(centralHeader, 16, crc)
    writeZipUint32(centralHeader, 20, data.length)
    writeZipUint32(centralHeader, 24, data.length)
    writeZipUint16(centralHeader, 28, nameBytes.length)
    writeZipUint16(centralHeader, 30, 0)
    writeZipUint16(centralHeader, 32, 0)
    writeZipUint16(centralHeader, 34, 0)
    writeZipUint16(centralHeader, 36, 0)
    writeZipUint32(centralHeader, 38, 0)
    writeZipUint32(centralHeader, 42, offset)
    centralHeader.set(nameBytes, 46)
    centralParts.push(centralHeader)

    offset += localHeader.length + data.length
  })

  const centralOffset = offset
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const endHeader = new Uint8Array(22)
  writeZipUint32(endHeader, 0, 0x06054b50)
  writeZipUint16(endHeader, 4, 0)
  writeZipUint16(endHeader, 6, 0)
  writeZipUint16(endHeader, 8, centralParts.length)
  writeZipUint16(endHeader, 10, centralParts.length)
  writeZipUint32(endHeader, 12, centralSize)
  writeZipUint32(endHeader, 16, centralOffset)
  writeZipUint16(endHeader, 20, 0)

  const size = localParts.reduce((sum, part) => sum + part.length, 0) + centralSize + endHeader.length
  const archive = new Uint8Array(size)
  let position = 0
  ;[...localParts, ...centralParts, endHeader].forEach(part => {
    archive.set(part, position)
    position += part.length
  })
  return archive
}

function createImportTemplateWorkbookBlob() {
  const createdAt = new Date().toISOString()
  const files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'docProps/app.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Axhub Make</Application></Properties>',
    'docProps/core.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(importTemplateFileName)}</dc:title><dc:creator>Axhub Make</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified></cp:coreProperties>`,
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="导入模板" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Arial"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>',
    'xl/worksheets/sheet1.xml': buildImportTemplateSheetXml(importTemplateRows),
  }

  return new Blob([createZipArchive(files)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function parseTableImportRows(table: string[][]) {
  if (table.length === 0) return []
  const header = hasImportHeader(table[0]) ? table[0] : null
  const dataRows = header ? table.slice(1) : table
  return dataRows.map(row => readDelimitedRow(row, header)).filter(hasRequiredImportFields)
}

function bytesToText(bytes: Uint8Array) {
  return new TextDecoder('utf-8').decode(bytes)
}

function readZipUint16(source: Uint8Array, offset: number) {
  return source[offset] | (source[offset + 1] << 8)
}

function readZipUint32(source: Uint8Array, offset: number) {
  return (source[offset] | (source[offset + 1] << 8) | (source[offset + 2] << 16) | (source[offset + 3] << 24)) >>> 0
}

async function inflateZipData(method: number, data: Uint8Array) {
  if (method === 0) return data
  if (method !== 8) throw new Error('暂不支持该 Excel 压缩格式，请使用页面下载的导入模板')
  if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持解析压缩 Excel，请使用 CSV 或 TXT 导入')
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('deflate-raw' as CompressionFormat))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function readZipEntries(source: Uint8Array) {
  const entries = new Map<string, string>()
  let offset = 0
  while (offset + 30 < source.length) {
    const signature = readZipUint32(source, offset)
    if (signature !== 0x04034b50) break
    const method = readZipUint16(source, offset + 8)
    const compressedSize = readZipUint32(source, offset + 18)
    const nameLength = readZipUint16(source, offset + 26)
    const extraLength = readZipUint16(source, offset + 28)
    const nameStart = offset + 30
    const dataStart = nameStart + nameLength + extraLength
    const dataEnd = dataStart + compressedSize
    const name = bytesToText(source.slice(nameStart, nameStart + nameLength))
    const data = await inflateZipData(method, source.slice(dataStart, dataEnd))
    entries.set(name, bytesToText(data))
    offset = dataEnd
  }
  return entries
}

function stripXmlTags(value: string) {
  return value.replace(/<[^>]*>/g, '')
}

function decodeXmlText(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function parseSharedStringsXml(xml: string) {
  const items = xml.match(/<si\b[\s\S]*?<\/si>/g) ?? []
  return items.map(item => decodeXmlText(stripXmlTags(item)).trim())
}

function parseWorksheetXml(xml: string, sharedStrings: string[] = []) {
  const rows: string[][] = []
  const rowMatches = xml.match(/<row\b[\s\S]*?<\/row>/g) ?? []
  rowMatches.forEach(rowXml => {
    const row: string[] = []
    const cellMatches = rowXml.match(/<c\b[\s\S]*?<\/c>/g) ?? []
    cellMatches.forEach(cellXml => {
      const ref = cellXml.match(/\br="([A-Z]+)\d+"/)?.[1]
      const cellType = cellXml.match(/\bt="([^"]+)"/)?.[1]
      const columnIndex = ref
        ? ref.split('').reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1
        : row.length
      const inlineText = cellXml.match(/<is\b[\s\S]*?<\/is>/)?.[0] ?? ''
      const valueText = cellXml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? ''
      const sharedText = cellType === 's' ? sharedStrings[Number(valueText)] ?? '' : ''
      row[columnIndex] = decodeXmlText(stripXmlTags(inlineText || sharedText || valueText)).trim()
    })
    if (row.some(cell => cell)) rows.push(row)
  })
  return rows
}

async function parseXlsxImportRows(buffer: ArrayBuffer) {
  const entries = await readZipEntries(new Uint8Array(buffer))
  const sheetXml = entries.get('xl/worksheets/sheet1.xml')
  if (!sheetXml) throw new Error('Excel 模板中未找到工作表数据')
  const sharedStrings = entries.get('xl/sharedStrings.xml')
  return parseTableImportRows(parseWorksheetXml(sheetXml, sharedStrings ? parseSharedStringsXml(sharedStrings) : []))
}

function createImportIdFactory() {
  const timestamp = Date.now()
  let counter = 0
  return (prefix: string) => `${prefix}-${timestamp}-${counter++}`
}

function normalizeColumnName(value: string) {
  return value.replace(/[\s_\-（）()]/g, '').toLowerCase()
}

function normalizeComparableName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function toText(value: unknown) {
  return value === undefined || value === null ? '' : String(value).trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toRecordArray(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function readFieldByAliases(record: Record<string, unknown>, aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeColumnName)
  for (const [key, value] of Object.entries(record)) {
    if (normalizedAliases.includes(normalizeColumnName(key))) return toText(value)
  }
  return ''
}

function readImportField(record: Record<string, unknown>, field: keyof ImportedTemplateRow) {
  return readFieldByAliases(record, importFieldAliases[field])
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find(line => line.trim()) ?? ''
  if (firstLine.includes('\t')) return '\t'
  if (firstLine.includes(';') && !firstLine.includes(',')) return ';'
  return ','
}

function parseDelimitedTable(text: string) {
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell)
  rows.push(row)

  return rows
    .map(columns => columns.map(column => column.trim()))
    .filter(columns => columns.some(column => column.length > 0))
}

function hasImportHeader(row: string[]) {
  const normalizedHeaders = new Set(row.map(normalizeColumnName))
  return importColumnOrder.some(field => (
    importFieldAliases[field].some(alias => normalizedHeaders.has(normalizeColumnName(alias)))
  ))
}

function readDelimitedRow(row: string[], header: string[] | null): ImportedTemplateRow {
  const headerMap = new Map<string, number>()
  header?.forEach((column, index) => headerMap.set(normalizeColumnName(column), index))

  const readCell = (field: keyof ImportedTemplateRow, fallbackIndex: number) => {
    if (header) {
      for (const alias of importFieldAliases[field]) {
        const columnIndex = headerMap.get(normalizeColumnName(alias))
        if (columnIndex !== undefined) return row[columnIndex]?.trim() ?? ''
      }
      return ''
    }
    return row[fallbackIndex]?.trim() ?? ''
  }

  return {
    l1Name: readCell('l1Name', 0),
    l2Name: readCell('l2Name', 1),
    symptomName: readCell('symptomName', 2),
    causeCategory: readCell('causeCategory', 3),
    causeDetail: readCell('causeDetail', 4),
    stationName: readCell('stationName', 5),
    stepDescription: readCell('stepDescription', 6),
    reference: readCell('reference', 7),
  }
}

function hasRequiredImportFields(row: ImportedTemplateRow) {
  return Boolean(row.l1Name && row.l2Name && row.symptomName)
}

function parseDelimitedImportRows(text: string) {
  const table = parseDelimitedTable(text)
  return parseTableImportRows(table)
}

function buildCategoriesFromRows(rows: ImportedTemplateRow[]) {
  const createId = createImportIdFactory()
  const l1Map = new Map<string, ProblemCategoryL1>()

  rows.forEach(importRow => {
    const l1Key = normalizeComparableName(importRow.l1Name)
    const l2Key = normalizeComparableName(importRow.l2Name)
    const symptomKey = normalizeComparableName(importRow.symptomName)
    let l1 = l1Map.get(l1Key)

    if (!l1) {
      l1 = { id: createId('il1'), name: importRow.l1Name, l2List: [] }
      l1Map.set(l1Key, l1)
    }

    let l2 = l1.l2List.find(item => normalizeComparableName(item.name) === l2Key)
    if (!l2) {
      l2 = { id: createId('il2'), name: importRow.l2Name, symptoms: [] }
      l1.l2List.push(l2)
    }

    let symptom = l2.symptoms.find(item => normalizeComparableName(item.name) === symptomKey)
    if (!symptom) {
      symptom = { id: createId('isym'), name: importRow.symptomName, causes: [], stations: [] }
      l2.symptoms.push(symptom)
    }

    if (importRow.causeCategory || importRow.causeDetail) {
      const causeExists = symptom.causes.some(cause => (
        normalizeComparableName(cause.category) === normalizeComparableName(importRow.causeCategory) &&
        normalizeComparableName(cause.detail) === normalizeComparableName(importRow.causeDetail)
      ))
      if (!causeExists) {
        symptom.causes.push({
          id: createId('ic'),
          category: importRow.causeCategory || '未分类',
          detail: importRow.causeDetail,
        })
      }
    }

    if (importRow.stationName || importRow.stepDescription) {
      const stationName = importRow.stationName || '未指定工位'
      let station = symptom.stations.find(item => normalizeComparableName(item.station) === normalizeComparableName(stationName))
      if (!station) {
        station = { id: createId('ist'), station: stationName, steps: [] }
        symptom.stations.push(station)
      }
      if (importRow.stepDescription) {
        const stepExists = station.steps.some(step => (
          normalizeComparableName(step.description) === normalizeComparableName(importRow.stepDescription) &&
          normalizeComparableName(step.reference || '') === normalizeComparableName(importRow.reference)
        ))
        if (!stepExists) {
          station.steps.push({
            id: createId('istep'),
            order: station.steps.length + 1,
            description: importRow.stepDescription,
            reference: importRow.reference,
          })
        }
      }
    }
  })

  return Array.from(l1Map.values())
}

function normalizeNestedCategories(source: unknown) {
  const createId = createImportIdFactory()
  return toRecordArray(source).map(l1Record => {
    const l1Name = readFieldByAliases(l1Record, ['name', 'title', '一级分类', 'l1Name'])
    const l2Source = l1Record.l2List ?? l1Record.children ?? l1Record['二级分类']
    const l2List = toRecordArray(l2Source).map(l2Record => {
      const l2Name = readFieldByAliases(l2Record, ['name', 'title', '二级分类', 'l2Name'])
      const symptomSource = l2Record.symptoms ?? l2Record.children ?? l2Record['故障现象']
      const symptoms = toRecordArray(symptomSource).map(symptomRecord => {
        const symptomName = readFieldByAliases(symptomRecord, ['name', 'title', '故障现象', 'symptomName'])
        const causeSource = symptomRecord.causes ?? symptomRecord.reasonList ?? symptomRecord['故障原因']
        const stationSource = symptomRecord.stations ?? symptomRecord.stationList ?? symptomRecord['工位']
        const causes = toRecordArray(causeSource).map(causeRecord => ({
          id: toText(causeRecord.id) || createId('ic'),
          category: readFieldByAliases(causeRecord, ['category', '系统类别', '原因类别', 'causeCategory']) || '未分类',
          detail: readFieldByAliases(causeRecord, ['detail', '故障原因', '原因', '子项', '说明', 'causeDetail']),
        })).filter(cause => cause.category || cause.detail)
        const stations = toRecordArray(stationSource).map(stationRecord => {
          const stationName = readFieldByAliases(stationRecord, ['station', 'name', 'title', '工位', 'stationName']) || '未指定工位'
          const stepSource = stationRecord.steps ?? stationRecord.stepList ?? stationRecord['步骤']
          const steps = toRecordArray(stepSource).map((stepRecord, index) => ({
            id: toText(stepRecord.id) || createId('istep'),
            order: Number(toText(stepRecord.order ?? stepRecord['步骤序号'])) || index + 1,
            description: readFieldByAliases(stepRecord, ['description', '步骤描述', '检查步骤', '步骤', 'step']),
            reference: readFieldByAliases(stepRecord, ['reference', '参考资料', '参考工具', '工具']),
          })).filter(step => step.description)
          return { id: toText(stationRecord.id) || createId('ist'), station: stationName, steps }
        }).filter(station => station.station || station.steps.length)
        return {
          id: toText(symptomRecord.id) || createId('isym'),
          name: symptomName,
          causes,
          stations,
        }
      }).filter(symptom => symptom.name)
      return { id: toText(l2Record.id) || createId('il2'), name: l2Name, symptoms }
    }).filter(l2 => l2.name && l2.symptoms.length)
    return { id: toText(l1Record.id) || createId('il1'), name: l1Name, l2List }
  }).filter(l1 => l1.name && l1.l2List.length)
}

function getJsonArraySource(json: unknown) {
  if (Array.isArray(json)) return json
  if (!isRecord(json)) return []
  const keys = ['problemCategories', 'rows', 'data', 'list']
  for (const key of keys) {
    const value = json[key]
    if (Array.isArray(value)) return value
  }
  return []
}

function parseImportText(text: string) {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('文件内容为空，请选择包含导入数据的文件')

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    let json: unknown
    try {
      json = JSON.parse(trimmed)
    } catch {
      throw new Error('JSON 文件格式不正确，请检查文件内容')
    }

    const arraySource = getJsonArraySource(json)
    const nestedCategories = normalizeNestedCategories(arraySource)
    if (nestedCategories.length) return nestedCategories

    const rows = toRecordArray(arraySource).map(record => ({
      l1Name: readImportField(record, 'l1Name'),
      l2Name: readImportField(record, 'l2Name'),
      symptomName: readImportField(record, 'symptomName'),
      causeCategory: readImportField(record, 'causeCategory'),
      causeDetail: readImportField(record, 'causeDetail'),
      stationName: readImportField(record, 'stationName'),
      stepDescription: readImportField(record, 'stepDescription'),
      reference: readImportField(record, 'reference'),
    })).filter(hasRequiredImportFields)
    const categories = buildCategoriesFromRows(rows)
    if (categories.length) return categories

    throw new Error('JSON 中未识别到可导入数据，请检查字段结构')
  }

  const categories = buildCategoriesFromRows(parseDelimitedImportRows(trimmed))
  if (!categories.length) throw new Error('未识别到可导入数据，请确认包含一级分类、二级分类、故障现象字段')
  return categories
}

function parseImportFile(file: File) {
  if (/\.xlsx$/i.test(file.name)) {
    return file.arrayBuffer().then(async buffer => {
      const rows = await parseXlsxImportRows(buffer)
      const categories = buildCategoriesFromRows(rows)
      if (!categories.length) throw new Error('Excel 中未识别到可导入数据，请确认包含一级分类、二级分类、故障现象字段')
      return categories
    })
  }

  return file.text().then(parseImportText)
}

function cloneDeepDiagnosisGuides(guides: DeepDiagnosisStep[] = []) {
  return guides.map(guide => ({
    ...guide,
    keyPoints: [...guide.keyPoints],
  }))
}

function cloneProblemCategories(categories: ProblemCategoryL1[]) {
  return categories.map(l1 => ({
    ...l1,
    l2List: l1.l2List.map(l2 => ({
      ...l2,
      symptoms: l2.symptoms.map(symptom => ({
        ...symptom,
        causes: symptom.causes.map(cause => ({ ...cause })),
        stations: symptom.stations.map(station => ({
          ...station,
          steps: station.steps.map(step => ({ ...step })),
        })),
        deepDiagnosisGuides: cloneDeepDiagnosisGuides(symptom.deepDiagnosisGuides),
      })),
    })),
  }))
}

function mergeProblemCategories(existing: ProblemCategoryL1[], imported: ProblemCategoryL1[]): ImportMergeResult {
  const next = cloneProblemCategories(existing)
  const expandedL1Ids: string[] = []
  let selectedSymptomId = ''

  imported.forEach(importedL1 => {
    const l1Key = normalizeComparableName(importedL1.name)
    let targetL1 = next.find(l1 => normalizeComparableName(l1.name) === l1Key)
    if (!targetL1) {
      targetL1 = cloneProblemCategories([importedL1])[0]
      next.push(targetL1)
    }
    expandedL1Ids.push(targetL1.id)

    importedL1.l2List.forEach(importedL2 => {
      const l2Key = normalizeComparableName(importedL2.name)
      let targetL2 = targetL1.l2List.find(l2 => normalizeComparableName(l2.name) === l2Key)
      if (!targetL2) {
        targetL2 = cloneProblemCategories([{ id: 'tmp', name: 'tmp', l2List: [importedL2] }])[0].l2List[0]
        targetL1.l2List.push(targetL2)
      }

      importedL2.symptoms.forEach(importedSymptom => {
        const symptomKey = normalizeComparableName(importedSymptom.name)
        let targetSymptom = targetL2.symptoms.find(symptom => normalizeComparableName(symptom.name) === symptomKey)
        if (!targetSymptom) {
          targetSymptom = {
            ...importedSymptom,
            causes: importedSymptom.causes.map(cause => ({ ...cause })),
            stations: importedSymptom.stations.map(station => ({ ...station, steps: station.steps.map(step => ({ ...step })) })),
            deepDiagnosisGuides: cloneDeepDiagnosisGuides(importedSymptom.deepDiagnosisGuides),
          }
          targetL2.symptoms.push(targetSymptom)
        }
        if (!selectedSymptomId) selectedSymptomId = targetSymptom.id

        importedSymptom.causes.forEach(importedCause => {
          const exists = targetSymptom.causes.some(cause => (
            normalizeComparableName(cause.category) === normalizeComparableName(importedCause.category) &&
            normalizeComparableName(cause.detail) === normalizeComparableName(importedCause.detail)
          ))
          if (!exists) targetSymptom.causes.push({ ...importedCause })
        })

        importedSymptom.stations.forEach(importedStation => {
          const stationName = importedStation.station || '未指定工位'
          let targetStation = targetSymptom.stations.find(station => normalizeComparableName(station.station) === normalizeComparableName(stationName))
          if (!targetStation) {
            targetStation = {
              ...importedStation,
              station: stationName,
              steps: importedStation.steps.map((step, index) => ({ ...step, order: index + 1 })),
            }
            targetSymptom.stations.push(targetStation)
          } else {
            const existingStation = targetStation
            importedStation.steps.forEach(importedStep => {
              const exists = existingStation.steps.some(step => (
                normalizeComparableName(step.description) === normalizeComparableName(importedStep.description) &&
                normalizeComparableName(step.reference || '') === normalizeComparableName(importedStep.reference || '')
              ))
              if (!exists) existingStation.steps.push({ ...importedStep })
            })
            existingStation.steps = existingStation.steps.map((step, index) => ({ ...step, order: index + 1 }))
          }
        })
      })
    })
  })

  return { problemCategories: next, selectedSymptomId, expandedL1Ids }
}

function getImportPreview(categories: ProblemCategoryL1[]): ImportPreview {
  return categories.reduce<ImportPreview>((total, l1) => {
    total.l1Count += 1
    l1.l2List.forEach(l2 => {
      total.l2Count += 1
      l2.symptoms.forEach(symptom => {
        total.symptomCount += 1
        total.causeCount += symptom.causes.length
        total.stationCount += symptom.stations.length
        total.stepCount += symptom.stations.reduce((sum, station) => sum + station.steps.length, 0)
      })
    })
    return total
  }, { l1Count: 0, l2Count: 0, symptomCount: 0, causeCount: 0, stationCount: 0, stepCount: 0 })
}

function getImportPreviewTotal(preview: ImportPreview | null) {
  return preview ? preview.symptomCount : 0
}

function downloadImportTemplate() {
  const blob = createImportTemplateWorkbookBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = importTemplateFileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const sidebarGroups = [
  {
    title: '售后服务',
    items: [
      '预诊模板配置',
    ],
  },
]

const workspaceTabs = ['工作台', '维修工单管理', '维修项目查询', '预诊模板配置']
const statusOptions: TemplateStatus[] = ['启用', '停用']

function renderStatusTone(status: TemplateStatus) {
  return status === '启用' ? 'enabled' : 'disabled'
}

function getDefaultVariant(template: DiagnosisTemplate) {
  return template.variants.find(v => v.isDefault) ?? template.variants[0] ?? null
}

function countSymptoms(template: DiagnosisTemplate) {
  return template.problemCategories.reduce(
    (sum, l1) => sum + l1.l2List.reduce((s2, l2) => s2 + l2.symptoms.length, 0),
    0,
  )
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────

const templatesSeed: DiagnosisTemplate[] = [
  {
    id: 'tpl-fr-cabin',
    name: 'FR 智能座舱深度预诊模板',
    code: 'FR-PD-001',
    brand: 'FR',
    description: '面向预约单 / 环检单中"智能座舱系统"类问题的检查指导，沉淀工位级排查步骤。',
    status: '启用',
    updatedAt: '2026-05-26 09:42',
    updatedBy: '王泓',
    variants: [
      { id: 'v1', series: 'FR E-SUV', model: 'E-SUV 620 Pro', year: '2026', powerType: '纯电', trimLevel: 'Pro', isDefault: true },
      { id: 'v2', series: 'FR E-Sedan', model: 'E-Sedan 580 Max', year: '2025', powerType: '增程', trimLevel: 'Max' },
      { id: 'v3', series: 'FR X-Pro', model: 'X-Pro 四驱高配', year: '2026', powerType: '纯电', trimLevel: '四驱高配' },
    ],
    problemCategories: [
      {
        id: 'l1-cabin',
        name: '智能座舱系统',
        l2List: [
          {
            id: 'l2-screen',
            name: '屏幕/显示',
            symptoms: [
              {
                id: 'sym-blackscreen',
                name: '车机屏幕黑屏',
                causes: [
                  { id: 'c1', category: '低压电气系统', detail: '供电/搭铁' },
                  { id: 'c2', category: '智能座舱系统', detail: '屏幕硬件/主机硬件' },
                  { id: 'c3', category: '智能座舱系统', detail: '软件/系统' },
                  { id: 'c4', category: '低压电气系统', detail: '网络通讯' },
                ],
                stations: [
                  {
                    id: 'st-1',
                    station: '接车区',
                    steps: [
                      { id: 'step-1-1', order: 1, description: '确认客户主诉与黑屏发生场景（行驶中 / 停车 / 上电瞬间）', reference: '环检单-座舱栏' },
                      { id: 'step-1-2', order: 2, description: '检查 12V 蓄电池电压，记录开路电压与 SOC', reference: '万用表' },
                    ],
                  },
                  {
                    id: 'st-2',
                    station: '车内（低压上电，不踩刹车）',
                    steps: [
                      { id: 'step-2-1', order: 1, description: '尝试唤醒车机：按 HOME 键 / 长按 5 秒强制重启', reference: '—' },
                      { id: 'step-2-2', order: 2, description: '观察仪表与中控同步显示是否正常，是否伴随 CAN 通讯故障码', reference: '诊断仪' },
                      { id: 'step-2-3', order: 3, description: '确认主机供电保险（F19 / F22）是否完好', reference: '电路图 EFE-2025' },
                    ],
                  },
                  {
                    id: 'st-3',
                    station: '车内（高压上电，踩刹车 ready）',
                    steps: [
                      { id: 'step-3-1', order: 1, description: 'Ready 后再次确认中控显示恢复时长，若超过 10s 记录环境温度', reference: '诊断仪' },
                      { id: 'step-3-2', order: 2, description: '使用诊断仪读取座舱域控制器（CCM）DTC，截图留档', reference: 'OBD' },
                    ],
                  },
                  {
                    id: 'st-4',
                    station: '举升机工位',
                    steps: [
                      { id: 'step-4-1', order: 1, description: '拆下中控屏 B 柱后部线束接插件，检查针脚氧化与接触', reference: '维修手册 Ch.07' },
                      { id: 'step-4-2', order: 2, description: '用代用主机替换法（仅当确诊为主机硬件时）验证', reference: '专用工具' },
                    ],
                  },
                ],
                deepDiagnosisGuides: [
                  {
                    id: 'dg-black-1',
                    order: 1,
                    title: '接车区确认症状操作',
                    operation: '向用户确认：是偶尔黑还是彻底不亮？黑屏时有没有声音（导航/音乐还在响吗）？黑屏前有没有花屏、闪屏、过热、卡顿的前兆？\n\n确认触发条件：暴晒后？颠簸后？洗车后？还是毫无规律？',
                    keyPoints: [
                      '屏幕不亮但声音正常/触控有反馈：倾向背光问题、屏幕硬件或背光供电故障',
                      '屏幕不亮且完全无声音：倾向主机不开机或系统崩溃，问题在主机端',
                      '偶尔黑屏自动恢复：倾向过热保护、软件卡死、接插件虚接',
                    ],
                  },
                  {
                    id: 'dg-black-2',
                    order: 2,
                    title: '车内低压上电，基础供电检查',
                    operation: '车辆低压上电后确认中控屏是否点亮，检查屏幕背光、主机启动声、触控反馈、保险状态与主机供电/搭铁状态，必要时读取座舱域控制器 DTC。',
                    keyPoints: [
                      '低压上电后屏幕无背光但系统声音存在：优先检查屏幕背光供电与屏幕硬件',
                      '低压上电后屏幕、声音、触控均无反馈：优先检查主机供电、保险、搭铁与主机启动状态',
                      '供电正常但偶发黑屏：继续核查软件版本、过热日志与接插件虚接',
                    ],
                  },
                ],
              },
              {
                id: 'sym-flicker',
                name: '车机屏幕闪烁/花屏',
                causes: [
                  { id: 'c-fl-1', category: '智能座舱系统', detail: '屏幕硬件/主机硬件' },
                  { id: 'c-fl-2', category: '智能座舱系统', detail: '软件/系统' },
                  { id: 'c-fl-3', category: '低压电气系统', detail: '供电/搭铁' },
                ],
                stations: [
                  {
                    id: 'st-fl-1',
                    station: '接车区',
                    steps: [
                      { id: 'step-fl-1-1', order: 1, description: '复现闪烁场景，记录频率与触发条件', reference: '客户描述' },
                    ],
                  },
                  {
                    id: 'st-fl-2',
                    station: '车内（低压上电，不踩刹车）',
                    steps: [
                      { id: 'step-fl-2-1', order: 1, description: '调节屏幕亮度 0%→100%，观察是否有色块抖动', reference: '—' },
                      { id: 'step-fl-2-2', order: 2, description: '尝试 OTA 升级到最新版本后复测', reference: 'OTA 后台' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'l2-hmi',
            name: '人机交互',
            symptoms: [
              {
                id: 'sym-touch',
                name: '触控无响应/漂移',
                causes: [
                  { id: 'c-tc-1', category: '智能座舱系统', detail: '屏幕硬件/主机硬件' },
                  { id: 'c-tc-2', category: '智能座舱系统', detail: '软件/系统' },
                ],
                stations: [
                  {
                    id: 'st-tc-1',
                    station: '车内（低压上电，不踩刹车）',
                    steps: [
                      { id: 'step-tc-1-1', order: 1, description: '使用屏幕校准工具进行触控漂移测试', reference: '工程模式' },
                      { id: 'step-tc-1-2', order: 2, description: '读取触控控制器 IIC 通讯日志', reference: '诊断仪' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]


// ─── AppShell ────────────────────────────────────────────────────────────────

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="prediag-template-shell">
      <aside className="prediag-template-sidebar">
        <div className="prediag-template-brand">
          <div className="prediag-template-brand-mark" aria-hidden="true">CHERY</div>
          <div className="prediag-template-brand-text">
            <span>ODIN</span>
            <small>售后服务后台</small>
          </div>
        </div>
        <div className="prediag-template-side-search">
          <Search size={13} />
          <span>搜索菜单</span>
        </div>
        <div className="prediag-template-side-nav">
          {sidebarGroups.map(group => (
            <div key={group.title} className="prediag-template-side-group">
              <div className="prediag-template-side-group-title">{group.title}</div>
              {group.items.map(item => (
                <button
                  key={item}
                  type="button"
                  className={`prediag-template-side-item ${item === '预诊模板配置' ? 'active' : ''}`}
                >
                  <span>{item}</span>
                  {item === '预诊模板配置' ? <ChevronRight size={14} /> : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>
      <div className="prediag-template-main">
        <header className="prediag-template-topbar">
          <div className="prediag-template-tabs">
            {workspaceTabs.map(tab => (
              <div key={tab} className={`prediag-template-tab ${tab === '预诊模板配置' ? 'active' : ''}`}>
                <span>{tab}</span>
                <span className="close">×</span>
              </div>
            ))}
          </div>
          <div className="prediag-template-topbar-user">王泓</div>
        </header>
        <main className="prediag-template-content">{children}</main>
      </div>
    </div>
  )
}

// ─── 列表页 ──────────────────────────────────────────────────────────────────

function ListPage({
  templates,
  keyword,
  setKeyword,
  statusFilter,
  setStatusFilter,
  createTemplate,
  openEditor,
  toggleStatus,
}: {
  templates: DiagnosisTemplate[]
  keyword: string
  setKeyword: React.Dispatch<React.SetStateAction<string>>
  statusFilter: TemplateStatus | '全部'
  setStatusFilter: React.Dispatch<React.SetStateAction<TemplateStatus | '全部'>>
  createTemplate: () => void
  openEditor: (id: string) => void
  toggleStatus: (id: string) => void
}) {
  return (
    <>
      <div className="prediag-template-breadcrumb">售后基础配置 / 预诊模板配置</div>

      <section className="prediag-template-page-head">
        <h1>预诊模板配置</h1>
        <button type="button" className="prediag-template-primary-button" onClick={createTemplate}>
          <Plus size={16} />
          <span>新建模板</span>
        </button>
      </section>

      <section className="prediag-template-panel">
        <div className="prediag-template-panel-head">
          <div className="prediag-template-panel-title">
            <LayoutTemplate size={16} />
            <span>模板查询</span>
          </div>
        </div>
        <div className="prediag-template-filter-grid">
          <label className="prediag-template-field">
            <span>模板名称 / 车型关键字</span>
            <div className="prediag-template-input-wrap">
              <Search size={14} />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="请输入模板名称、车系或车型"
              />
            </div>
          </label>
          <label className="prediag-template-field">
            <span>状态</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TemplateStatus | '全部')}>
              <option value="全部">全部</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="prediag-template-panel">
        <div className="prediag-template-panel-head">
          <div className="prediag-template-panel-title">
            <ClipboardList size={16} />
            <span>模板列表</span>
          </div>
          <span className="prediag-template-panel-subtitle">共 {templates.length} 条</span>
        </div>
        <div className="prediag-template-table-wrap">
          <table className="prediag-template-table">
            <thead>
              <tr>
                <th>模板名称</th>
                <th>所属品牌</th>
                <th>适配车型</th>
                <th>问题分类 / 故障现象</th>
                <th>更新时间</th>
                <th>更新人</th>
                <th>状态</th>
                <th className="align-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id}>
                  <td>
                    <div className="prediag-template-name-cell">
                      <strong>{template.name}</strong>
                      <span>{template.code}</span>
                    </div>
                  </td>
                  <td>{template.brand}</td>
                  <td>
                    <div className="prediag-template-model-list">
                      {template.variants.slice(0, 2).map(v => <span key={v.id}>{v.model}</span>)}
                      {template.variants.length > 2 ? <em>+{template.variants.length - 2}</em> : null}
                    </div>
                  </td>
                  <td>
                    <div className="prediag-template-stat-cell">
                      <span><b>{template.problemCategories.length}</b> 类</span>
                      <span><b>{countSymptoms(template)}</b> 个故障现象</span>
                    </div>
                  </td>
                  <td>{template.updatedAt}</td>
                  <td>{template.updatedBy}</td>
                  <td>
                    <span className={`prediag-template-status ${renderStatusTone(template.status)}`}>{template.status}</span>
                  </td>
                  <td className="align-right">
                    <div className="prediag-template-actions">
                      <button type="button" onClick={() => openEditor(template.id)}>编辑</button>
                      <button type="button" onClick={() => toggleStatus(template.id)}>
                        {template.status === '启用' ? '停用' : '启用'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}


// ─── 编辑页 ──────────────────────────────────────────────────────────────────

interface EditPageProps {
  template: DiagnosisTemplate
  selectedVariantId: string
  setSelectedVariantId: (id: string) => void
  selectedSymptomId: string
  setSelectedSymptomId: (id: string) => void
  goBack: () => void
  saveTemplate: () => void
  toggleStatus: (id: string) => void
  updateSymptom: (symptomId: string, updater: (s: FaultSymptom) => FaultSymptom) => void
  updateTemplate: (updater: (t: DiagnosisTemplate) => DiagnosisTemplate) => void
}

// 在模板中查找选中的故障现象及其上下文
function findSymptomContext(template: DiagnosisTemplate, symptomId: string) {
  for (const l1 of template.problemCategories) {
    for (const l2 of l1.l2List) {
      const sym = l2.symptoms.find(s => s.id === symptomId)
      if (sym) return { l1, l2, symptom: sym }
    }
  }
  const fallbackL1 = template.problemCategories[0]
  const fallbackL2 = fallbackL1?.l2List[0]
  const fallbackSym = fallbackL2?.symptoms[0]
  return fallbackSym ? { l1: fallbackL1!, l2: fallbackL2!, symptom: fallbackSym } : null
}

function EditPage({
  template,
  selectedVariantId,
  setSelectedVariantId,
  selectedSymptomId,
  setSelectedSymptomId,
  goBack,
  saveTemplate,
  toggleStatus,
  updateSymptom,
  updateTemplate,
}: EditPageProps) {
  const selectedVariant = template.variants.find(v => v.id === selectedVariantId) ?? template.variants[0] ?? null
  const ctx = findSymptomContext(template, selectedSymptomId)

  // 导入弹框可见性
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const [importError, setImportError] = useState('')
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importCategories, setImportCategories] = useState<ProblemCategoryL1[]>([])
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>([])
  const [importStartTime, setImportStartTime] = useState('')
  const [importEndTime, setImportEndTime] = useState('')
  const [isImportDragging, setIsImportDragging] = useState(false)

  // 默认所有一级分类展开
  const [expandedL1, setExpandedL1] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    template.problemCategories.forEach(l1 => { init[l1.id] = true })
    return init
  })
  const toggleL1 = (id: string) => setExpandedL1(s => ({ ...s, [id]: !s[id] }))
  const deepDiagnosisGuides = ctx?.symptom.deepDiagnosisGuides ?? []

  // 锚点导航激活状态
  const [activeAnchor, setActiveAnchor] = useState('基础信息')

  const resetImportState = () => {
    setImportFileName('')
    setImportError('')
    setImportPreview(null)
    setImportCategories([])
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    resetImportState()
  }

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    handleImportFile(file)
  }

  const handleImportFile = (file: File) => {
    setImportFileName(file.name)
    setImportError('')
    setImportPreview(null)
    setImportCategories([])

    parseImportFile(file)
      .then(categories => {
        const preview = getImportPreview(categories)
        setImportCategories(categories)
        setImportPreview(preview)
        setImportHistory(records => [{
          id: `IMP-${Date.now()}`,
          importTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          operator: 'ka-admin',
          fileName: file.name,
          status: '成功',
          total: getImportPreviewTotal(preview),
          dataText: JSON.stringify(categories, null, 2),
        }, ...records])
      })
      .catch(error => {
        setImportError(error instanceof Error ? error.message : '文件解析失败，请检查导入内容')
        setImportHistory(records => [{
          id: `IMP-${Date.now()}`,
          importTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          operator: 'ka-admin',
          fileName: file.name,
          status: '失败',
          total: 0,
          dataText: error instanceof Error ? error.message : '文件解析失败，请检查导入内容',
        }, ...records])
      })
  }

  const handleImportDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsImportDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleImportFile(file)
  }

  const filteredImportHistory = importHistory.filter(record => {
    if (importStartTime && record.importTime < importStartTime) return false
    if (importEndTime && record.importTime > importEndTime) return false
    return true
  })

  const handleDownloadImportRecord = (record: ImportHistoryRecord) => {
    downloadTextFile(`${record.fileName || record.id}.txt`, record.dataText)
  }

  const handleConfirmImport = () => {
    if (!importCategories.length) return
    const result = mergeProblemCategories(template.problemCategories, importCategories)
    const updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    updateTemplate(t => ({ ...t, problemCategories: result.problemCategories, updatedAt, updatedBy: '王泓' }))
    setExpandedL1(s => {
      const next = { ...s }
      result.expandedL1Ids.forEach(id => { next[id] = true })
      return next
    })
    if (result.selectedSymptomId) setSelectedSymptomId(result.selectedSymptomId)
    closeImportModal()
  }

  return (
    <>
      <div className="prediag-template-breadcrumb">售后基础配置 / 预诊模板配置 / 模板编辑</div>

      <section className="prediag-template-page-head">
        <div className="prediag-template-head-row">
          <button type="button" className="prediag-template-back-button" onClick={goBack}>
            <ArrowLeft size={16} />
            <span>返回列表</span>
          </button>
          <div>
            <h1>{template.name}</h1>
            <div className="prediag-template-head-caption">{template.code}</div>
          </div>
        </div>
        <div className="prediag-template-head-meta">
          <span className={`prediag-template-status ${renderStatusTone(template.status)}`}>{template.status}</span>
          <span>最近更新：{template.updatedAt}</span>
          <span>更新人：{template.updatedBy}</span>
        </div>
      </section>

      <section className="prediag-template-editor-layout">
        <aside className="prediag-template-anchor-card">
          <div className="prediag-template-anchor-title">配置导航</div>
          <button 
            type="button" 
            className={`prediag-template-anchor-item${activeAnchor === '基础信息' ? ' active' : ''}`}
            onClick={() => setActiveAnchor('基础信息')}
          >
            <span className="icon"><Settings size={18} /></span>
            <span>基础信息</span>
          </button>
          <button 
            type="button" 
            className={`prediag-template-anchor-item${activeAnchor === '适配车型' ? ' active' : ''}`}
            onClick={() => setActiveAnchor('适配车型')}
          >
            <span className="icon"><CarFront size={18} /></span>
            <span>适配车型</span>
          </button>
          <button 
            type="button" 
            className={`prediag-template-anchor-item${activeAnchor === '问题分类与故障现象' ? ' active' : ''}`}
            onClick={() => setActiveAnchor('问题分类与故障现象')}
          >
            <span className="icon"><ListTree size={18} /></span>
            <span>问题分类与故障现象</span>
          </button>
          <button 
            type="button" 
            className={`prediag-template-anchor-item${activeAnchor === '通用技术检查' ? ' active' : ''}`}
            onClick={() => setActiveAnchor('通用技术检查')}
          >
            <span className="icon"><Wrench size={18} /></span>
            <span>通用技术检查</span>
          </button>
          <button 
            type="button" 
            className={`prediag-template-anchor-item${activeAnchor === '诊断指导' ? ' active' : ''}`}
            onClick={() => setActiveAnchor('诊断指导')}
          >
            <span className="icon"><ClipboardList size={18} /></span>
            <span>诊断指导</span>
          </button>
        </aside>

        <div className="prediag-template-editor-main">
          {/* 基础信息 */}
          <section className="prediag-template-panel">
            <div className="prediag-template-panel-head">
              <div className="prediag-template-panel-title">
                <FilePenLine size={16} />
                <span>基础信息</span>
              </div>
            </div>
            <div className="prediag-template-form-grid two-columns">
              <label className="prediag-template-field">
                <span>模板名称</span>
                <input value={template.name} readOnly />
              </label>
              <label className="prediag-template-field">
                <span>模板编码</span>
                <input value={template.code} readOnly />
              </label>
              <label className="prediag-template-field">
                <span>所属品牌</span>
                <input value={template.brand} readOnly />
              </label>
              <label className="prediag-template-field">
                <span>模板状态</span>
                <input value={template.status} readOnly />
              </label>
              <label className="prediag-template-field full-width">
                <span>模板说明</span>
                <textarea value={template.description} rows={3} readOnly />
              </label>
            </div>
          </section>

          {/* 适配车型 */}
          <section className="prediag-template-panel">
            <div className="prediag-template-panel-head">
              <div className="prediag-template-panel-title">
                <CarFront size={16} />
                <span>适配车型</span>
              </div>
              <span className="prediag-template-panel-subtitle">
                {template.variants.length === 0
                  ? '未选择车型 · 默认全车型适用'
                  : `已配置 ${template.variants.length} 个车型`}
              </span>
            </div>
            {template.variants.length === 0 && (
              <div className="prediag-template-variant-empty">
                <CarFront size={20} />
                <div>
                  <strong>当前未选择适配车型</strong>
                  <small>该模板将默认适用于 FR 品牌全部车型；如需限定，请点击下方"添加车型"</small>
                </div>
              </div>
            )}
            <div className="prediag-template-variant-grid">
              {template.variants.map(variant => (
                <div
                  key={variant.id}
                  className={`prediag-template-variant-card ${variant.id === selectedVariant?.id ? 'active' : ''}`}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  <div className="prediag-template-variant-top">
                    <strong>{variant.model}</strong>
                    <div className="prediag-template-variant-top-actions">
                      {variant.isDefault ? <span>默认适配</span> : null}
                      <button
                        type="button"
                        className="prediag-template-icon-button"
                        title="移除该车型"
                        onClick={e => {
                          e.stopPropagation()
                          if (!window.confirm(`确认移除车型「${variant.model}」？`)) return
                          updateTemplate(t => ({ ...t, variants: t.variants.filter(v => v.id !== variant.id) }))
                          if (selectedVariantId === variant.id) {
                            const next = template.variants.find(v => v.id !== variant.id)
                            if (next) setSelectedVariantId(next.id)
                          }
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="prediag-template-variant-meta">
                    <span>{variant.series}</span>
                    <span>{variant.year} 年款</span>
                    <span>{variant.powerType}</span>
                    <span>{variant.trimLevel}</span>
                  </div>
                </div>
              ))}

              {/* 添加车型卡片 */}
              <button
                type="button"
                className="prediag-template-variant-add"
                onClick={() => {
                  const model = window.prompt('请输入车型名称（例如：Concept 97）')?.trim()
                  if (!model) return
                  const series = window.prompt(`请输入「${model}」所属车系（可留空）`, 'FR')?.trim() || 'FR'
                  const year = window.prompt('请输入年款（可留空）', '2026')?.trim() || '—'
                  const powerType = window.prompt('请输入动力类型（纯电 / 增程 / 混动 / 燃油，可留空）', '纯电')?.trim() || '—'
                  const trimLevel = window.prompt('请输入配置版本（可留空）', '标准')?.trim() || '—'
                  const id = `v-new-${Date.now()}`
                  updateTemplate(t => ({
                    ...t,
                    variants: [...t.variants, { id, series, model, year, powerType, trimLevel }],
                  }))
                  setSelectedVariantId(id)
                }}
              >
                <Plus size={20} />
                <span>添加车型</span>
                <small>未配置即视为全车型适用</small>
              </button>
            </div>
          </section>

          {/* 问题分类 + 故障现象详情：左右分栏 */}
          <section className="prediag-template-panel prediag-template-symptom-panel">
            <div className="prediag-template-panel-head">
              <div className="prediag-template-panel-title">
                <ListTree size={16} />
                <span>问题分类与故障现象</span>
              </div>
              <span className="prediag-template-panel-subtitle">
                {template.problemCategories.length} 个一级分类 · {countSymptoms(template)} 个故障现象
              </span>
            </div>

            <div className="prediag-template-symptom-layout">
              {/* 左侧分类树 */}
              <div className="prediag-template-tree-col">
                <div className="prediag-template-tree-toolbar">
                  <strong>问题分类树</strong>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="prediag-template-text-button"
                      onClick={() => setShowImportModal(true)}
                      title="批量导入"
                    >
                      导入
                    </button>
                    <button
                      type="button"
                      className="prediag-template-text-button"
                      onClick={() => {
                        const name = window.prompt('请输入一级分类名称（如：智能座舱系统）')?.trim()
                        if (!name) return
                        const id = `nl1-${Date.now()}`
                        updateTemplate(t => ({
                          ...t,
                          problemCategories: [...t.problemCategories, { id, name, l2List: [] }],
                        }))
                        setExpandedL1(s => ({ ...s, [id]: true }))
                      }}
                    >
                      <Plus size={12} />一级
                    </button>
                  </div>
                </div>
                <div className="prediag-template-tree">
                  {template.problemCategories.length === 0 && (
                    <div className="prediag-template-tree-empty">
                      暂无问题分类，点击右上 <strong>+ 一级</strong> 开始构建
                    </div>
                  )}
                  {template.problemCategories.map(l1 => {
                    const expanded = expandedL1[l1.id] !== false
                    return (
                      <div key={l1.id} className="prediag-template-tree-l1">
                        <div className="prediag-template-tree-l1-row">
                          <span style={{ display: 'inline-flex', cursor: 'pointer' }} onClick={() => toggleL1(l1.id)}>
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                          <span
                            className="prediag-template-tree-l1-name"
                            onClick={() => toggleL1(l1.id)}
                            style={{ cursor: 'pointer', flex: 1 }}
                          >
                            {l1.name}
                          </span>
                          <em>{l1.l2List.length}</em>
                          <button
                            type="button"
                            className="prediag-template-icon-button"
                            title="新增二级分类"
                            onClick={e => {
                              e.stopPropagation()
                              const name = window.prompt(`在「${l1.name}」下新增二级分类，请输入名称`)?.trim()
                              if (!name) return
                              const id = `nl2-${Date.now()}`
                              updateTemplate(t => ({
                                ...t,
                                problemCategories: t.problemCategories.map(x => x.id === l1.id
                                  ? { ...x, l2List: [...x.l2List, { id, name, symptoms: [] }] }
                                  : x),
                              }))
                              setExpandedL1(s => ({ ...s, [l1.id]: true }))
                            }}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            className="prediag-template-icon-button"
                            title="删除该一级分类"
                            onClick={e => {
                              e.stopPropagation()
                              if (!window.confirm(`确认删除一级分类「${l1.name}」及其下全部内容？`)) return
                              updateTemplate(t => ({
                                ...t,
                                problemCategories: t.problemCategories.filter(x => x.id !== l1.id),
                              }))
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {expanded && (
                          <div className="prediag-template-tree-l2-wrap">
                            {l1.l2List.map(l2 => (
                              <div key={l2.id} className="prediag-template-tree-l2">
                                <div className="prediag-template-tree-l2-row">
                                  <span className="prediag-template-tree-l2-name">{l2.name}</span>
                                  <em>{l2.symptoms.length} 现象</em>
                                  <button
                                    type="button"
                                    className="prediag-template-icon-button"
                                    title="新增故障现象"
                                    onClick={() => {
                                      const name = window.prompt(`在「${l2.name}」下新增故障现象，请输入名称`)?.trim()
                                      if (!name) return
                                      const id = `nsym-${Date.now()}`
                                      updateTemplate(t => ({
                                        ...t,
                                        problemCategories: t.problemCategories.map(x => x.id === l1.id
                                          ? {
                                              ...x,
                                              l2List: x.l2List.map(y => y.id === l2.id
                                                ? { ...y, symptoms: [...y.symptoms, { id, name, causes: [], stations: [] }] }
                                                : y),
                                            }
                                          : x),
                                      }))
                                      setSelectedSymptomId(id)
                                    }}
                                  >
                                    <Plus size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    className="prediag-template-icon-button"
                                    title="删除该二级分类"
                                    onClick={() => {
                                      if (!window.confirm(`确认删除二级分类「${l2.name}」及其下全部故障现象？`)) return
                                      updateTemplate(t => ({
                                        ...t,
                                        problemCategories: t.problemCategories.map(x => x.id === l1.id
                                          ? { ...x, l2List: x.l2List.filter(y => y.id !== l2.id) }
                                          : x),
                                      }))
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="prediag-template-tree-symptom-list">
                                  {l2.symptoms.map(sym => (
                                    <button
                                      key={sym.id}
                                      type="button"
                                      className={`prediag-template-tree-symptom ${ctx?.symptom.id === sym.id ? 'active' : ''}`}
                                      onClick={() => setSelectedSymptomId(sym.id)}
                                    >
                                      <span>{sym.name}</span>
                                      <small>{sym.causes.length} 因 · {sym.stations.length} 工位</small>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 右侧详情 */}
              <div className="prediag-template-symptom-detail">
                {ctx ? (
                  <>
                    <div className="prediag-template-symptom-head">
                      <div className="prediag-template-symptom-breadcrumb">
                        <span>{ctx.l1.name}</span>
                        <ChevronRight size={12} />
                        <span>{ctx.l2.name}</span>
                        <ChevronRight size={12} />
                        <strong>{ctx.symptom.name}</strong>
                      </div>
                      <div className="prediag-template-form-grid two-columns">
                        <label className="prediag-template-field full-width">
                          <span>故障现象</span>
                          <input
                            value={ctx.symptom.name}
                            onChange={e => updateSymptom(ctx.symptom.id, s => ({ ...s, name: e.target.value }))}
                          />
                        </label>
                      </div>
                    </div>

                    {/* 故障原因列表 */}
                    <div className="prediag-template-detail-block">
                      <div className="prediag-template-detail-block-head">
                        <strong>可能的故障原因</strong>
                        <button
                          type="button"
                          className="prediag-template-text-button"
                          onClick={() => updateSymptom(ctx.symptom.id, s => ({
                            ...s,
                            causes: [...s.causes, { id: `c-new-${Date.now()}`, category: '请选择', detail: '' }],
                          }))}
                        >
                          <Plus size={12} />新增原因
                        </button>
                      </div>
                      <table className="prediag-template-cause-table">
                        <thead>
                          <tr>
                            <th style={{ width: 60 }}>序号</th>
                            <th>系统类别</th>
                            <th>子项 / 说明</th>
                            <th style={{ width: 80 }} className="align-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ctx.symptom.causes.map((cause, idx) => (
                            <tr key={cause.id}>
                              <td>{idx + 1}</td>
                              <td>
                                <input
                                  value={cause.category}
                                  onChange={e => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    causes: s.causes.map(c => c.id === cause.id ? { ...c, category: e.target.value } : c),
                                  }))}
                                />
                              </td>
                              <td>
                                <input
                                  value={cause.detail}
                                  placeholder="如：供电/搭铁、屏幕硬件等"
                                  onChange={e => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    causes: s.causes.map(c => c.id === cause.id ? { ...c, detail: e.target.value } : c),
                                  }))}
                                />
                              </td>
                              <td className="align-right">
                                <button
                                  type="button"
                                  className="prediag-template-icon-button"
                                  onClick={() => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    causes: s.causes.filter(c => c.id !== cause.id),
                                  }))}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="prediag-template-rule-empty">请在左侧选择一个故障现象</div>
                )}
              </div>
            </div>
          </section>
          {/* 通用技术检查 */}
          {ctx && (
            <section className="prediag-template-panel">
              <div className="prediag-template-panel-head">
                <div className="prediag-template-panel-title">
                  <Wrench size={16} />
                  <span>通用技术检查</span>
                </div>
                <span className="prediag-template-panel-subtitle">{ctx.symptom.name} · 按工位组织排查步骤</span>
              </div>

              {/* 工位快捷新增条 */}
              <div className="prediag-template-station-toolbar">
                <span className="prediag-template-station-toolbar-label">添加工位：</span>
                {PRESET_STATIONS.filter(name => !ctx.symptom.stations.find(s => s.station === name)).map(name => (
                  <button
                    key={name}
                    type="button"
                    className="prediag-template-text-button"
                    onClick={() => updateSymptom(ctx.symptom.id, s => ({
                      ...s,
                      stations: [...s.stations, { id: `st-new-${Date.now()}`, station: name, steps: [] }],
                    }))}
                  >
                    <Plus size={12} />{name}
                  </button>
                ))}
                <button
                  type="button"
                  className="prediag-template-text-button prediag-template-text-button-strong"
                  onClick={() => {
                    const input = window.prompt('请输入自定义工位名称（如：机电工位、外观工位）')
                    const trimmed = input?.trim()
                    if (!trimmed) return
                    if (ctx.symptom.stations.find(s => s.station === trimmed)) {
                      window.alert(`工位「${trimmed}」已存在`)
                      return
                    }
                    updateSymptom(ctx.symptom.id, s => ({
                      ...s,
                      stations: [...s.stations, { id: `st-new-${Date.now()}`, station: trimmed, steps: [] }],
                    }))
                  }}
                >
                  <Plus size={12} />自定义工位
                </button>
              </div>

              <div className="prediag-template-station-grid">
                {ctx.symptom.stations.length === 0 ? (
                  <div className="prediag-template-station-empty-full">
                    暂未配置工位，可从上方"添加工位"快捷按钮选择预设工位，或自定义工位名称
                  </div>
                ) : ctx.symptom.stations.map(station => {
                  const stationName = station.station
                  const isEmpty = station.steps.length === 0
                  return (
                    <div key={station.id} className={`prediag-template-station-card ${isEmpty ? 'empty' : ''}`}>
                      <div className="prediag-template-station-head">
                        <strong>{stationName}</strong>
                        <div className="prediag-template-station-head-actions">
                          <button
                            type="button"
                            className="prediag-template-text-button"
                            onClick={() => updateSymptom(ctx.symptom.id, s => ({
                              ...s,
                              stations: s.stations.map(x => x.id === station.id
                                ? { ...x, steps: [...x.steps, { id: `step-new-${Date.now()}`, order: x.steps.length + 1, description: '', reference: '' }] }
                                : x),
                            }))}
                          >
                            <Plus size={12} />新增步骤
                          </button>
                          <button
                            type="button"
                            className="prediag-template-icon-button"
                            title="删除该工位"
                            onClick={() => {
                              if (!window.confirm(`确认删除工位「${stationName}」及其所有步骤？`)) return
                              updateSymptom(ctx.symptom.id, s => ({
                                ...s,
                                stations: s.stations.filter(x => x.id !== station.id),
                              }))
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {isEmpty ? (
                        <div className="prediag-template-station-empty">该工位暂未配置步骤</div>
                      ) : (
                        <ol className="prediag-template-step-list">
                          {station.steps.map(step => (
                            <li key={step.id} className="prediag-template-step-item">
                              <div className="prediag-template-step-order">第 {step.order} 步</div>
                              <div className="prediag-template-step-fields">
                                <input
                                  className="prediag-template-step-desc"
                                  value={step.description}
                                  placeholder="步骤描述"
                                  onChange={e => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    stations: s.stations.map(x => x.id === station.id
                                      ? { ...x, steps: x.steps.map(y => y.id === step.id ? { ...y, description: e.target.value } : y) }
                                      : x),
                                  }))}
                                />
                                <input
                                  className="prediag-template-step-ref"
                                  value={step.reference || ''}
                                  placeholder="参考资料 / 工具"
                                  onChange={e => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    stations: s.stations.map(x => x.id === station.id
                                      ? { ...x, steps: x.steps.map(y => y.id === step.id ? { ...y, reference: e.target.value } : y) }
                                      : x),
                                  }))}
                                />
                              </div>
                              <button
                                type="button"
                                className="prediag-template-icon-button"
                                onClick={() => updateSymptom(ctx.symptom.id, s => ({
                                  ...s,
                                  stations: s.stations.map(x => x.id === station.id
                                    ? { ...x, steps: x.steps.filter(y => y.id !== step.id).map((y, i) => ({ ...y, order: i + 1 })) }
                                    : x),
                                }))}
                              >
                                <Trash2 size={13} />
                              </button>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
          {ctx && (
            <section className="prediag-template-panel">
              <div className="prediag-template-panel-head">
                <div className="prediag-template-panel-title">
                  <ClipboardList size={16} />
                  <span>诊断指导</span>
                </div>
                <span className="prediag-template-panel-subtitle">{ctx.symptom.name} · 最后维护专项诊断步骤</span>
              </div>
              <div className="prediag-template-detail-block prediag-template-deep-diagnosis-block">
                <div className="prediag-template-detail-block-head">
                  <div>
                    <strong>指导步骤</strong>
                    <span>{ctx.l1.name} / {ctx.l2.name} / {ctx.symptom.name}</span>
                  </div>
                  <button
                    type="button"
                    className="prediag-template-text-button"
                    onClick={() => updateSymptom(ctx.symptom.id, s => {
                      const guides = s.deepDiagnosisGuides ?? []
                      return {
                        ...s,
                        deepDiagnosisGuides: [
                          ...guides,
                          {
                            id: `dg-new-${Date.now()}`,
                            order: guides.length + 1,
                            title: `第 ${guides.length + 1} 步专项诊断`,
                            operation: '',
                            keyPoints: [''],
                          },
                        ],
                      }
                    })}
                  >
                    <Plus size={12} />新增指导步骤
                  </button>
                </div>
                {deepDiagnosisGuides.length ? (
                  <div className="prediag-template-deep-guide-list">
                    {deepDiagnosisGuides.map(guide => (
                      <div key={guide.id} className="prediag-template-deep-guide-card">
                        <div className="prediag-template-deep-guide-order">第 {guide.order} 步</div>
                        <div className="prediag-template-deep-guide-fields">
                          <input
                            value={guide.title}
                            placeholder="步骤标题，如：接车区确认症状操作"
                            onChange={e => updateSymptom(ctx.symptom.id, s => ({
                              ...s,
                              deepDiagnosisGuides: (s.deepDiagnosisGuides ?? []).map(item => item.id === guide.id ? { ...item, title: e.target.value } : item),
                            }))}
                          />
                          <textarea
                            value={guide.operation}
                            placeholder="操作指导，可填写多行说明"
                            onChange={e => updateSymptom(ctx.symptom.id, s => ({
                              ...s,
                              deepDiagnosisGuides: (s.deepDiagnosisGuides ?? []).map(item => item.id === guide.id ? { ...item, operation: e.target.value } : item),
                            }))}
                          />
                          <div className="prediag-template-deep-keypoints">
                            <div className="prediag-template-deep-keypoints-head">
                              <span>关键判断点</span>
                              <button
                                type="button"
                                className="prediag-template-text-button"
                                onClick={() => updateSymptom(ctx.symptom.id, s => ({
                                  ...s,
                                  deepDiagnosisGuides: (s.deepDiagnosisGuides ?? []).map(item => item.id === guide.id ? { ...item, keyPoints: [...item.keyPoints, ''] } : item),
                                }))}
                              >
                                <Plus size={12} />新增判断点
                              </button>
                            </div>
                            {guide.keyPoints.map((point, pointIndex) => (
                              <div key={`${guide.id}-${pointIndex}`} className="prediag-template-deep-keypoint-row">
                                <input
                                  value={point}
                                  placeholder="如：屏幕不亮但声音正常，优先判断背光/屏幕硬件"
                                  onChange={e => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    deepDiagnosisGuides: (s.deepDiagnosisGuides ?? []).map(item => item.id === guide.id
                                      ? { ...item, keyPoints: item.keyPoints.map((value, index) => index === pointIndex ? e.target.value : value) }
                                      : item),
                                  }))}
                                />
                                <button
                                  type="button"
                                  className="prediag-template-icon-button"
                                  onClick={() => updateSymptom(ctx.symptom.id, s => ({
                                    ...s,
                                    deepDiagnosisGuides: (s.deepDiagnosisGuides ?? []).map(item => item.id === guide.id
                                      ? { ...item, keyPoints: item.keyPoints.filter((_, index) => index !== pointIndex) }
                                      : item),
                                  }))}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="prediag-template-icon-button"
                          onClick={() => updateSymptom(ctx.symptom.id, s => ({
                            ...s,
                            deepDiagnosisGuides: (s.deepDiagnosisGuides ?? [])
                              .filter(item => item.id !== guide.id)
                              .map((item, index) => ({ ...item, order: index + 1 })),
                          }))}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prediag-template-deep-guide-empty">
                    当前故障现象暂未配置诊断指导，新增后将与该问题分类和故障现象绑定。
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* 右侧预览 */}
        <aside className="prediag-template-preview-card">
          <div className="prediag-template-preview-head">
            <div><strong>实时预览</strong></div>
            <div className="prediag-template-preview-badge">
              <Eye size={14} />
              <span>{selectedVariant ? selectedVariant.model : '全车型适用'}</span>
            </div>
          </div>
          <div className="prediag-template-preview-meta">
            {selectedVariant ? (
              <>
                <span>{selectedVariant.series}</span>
                <span>{selectedVariant.year} 年款</span>
                <span>{selectedVariant.powerType}</span>
              </>
            ) : (
              <span>未限定车型范围 · 适用 FR 品牌全车型</span>
            )}
          </div>
          {ctx ? (
            <div className="prediag-template-preview-symptom">
              <div className="prediag-template-preview-symptom-title">
                <small>当前预览的故障现象</small>
                <strong>{ctx.symptom.name}</strong>
                <em>{ctx.l1.name} / {ctx.l2.name}</em>
              </div>
              <div className="prediag-template-preview-section">
                <div className="prediag-template-preview-section-title">可能原因（{ctx.symptom.causes.length}）</div>
                <ul className="prediag-template-preview-cause-list">
                  {ctx.symptom.causes.map(c => (
                    <li key={c.id}>
                      <em>{c.category}</em>
                      <span>{c.detail || '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="prediag-template-preview-section">
                <div className="prediag-template-preview-section-title">技术检查工位（{ctx.symptom.stations.length}）</div>
                <div className="prediag-template-preview-station-list">
                  {ctx.symptom.stations.map(st => (
                    <div key={st.id} className="prediag-template-preview-station">
                      <strong>{st.station}</strong>
                      <ol>
                        {st.steps.map(step => (
                          <li key={step.id}>{step.description || '—'}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
              <div className="prediag-template-preview-section">
                <div className="prediag-template-preview-section-title">诊断指导（{deepDiagnosisGuides.length}）</div>
                {deepDiagnosisGuides.length ? (
                  <div className="prediag-template-preview-guide-list">
                    {deepDiagnosisGuides.map(guide => (
                      <div key={guide.id} className="prediag-template-preview-guide">
                        <strong>第 {guide.order} 步：{guide.title}</strong>
                        <p>{guide.operation || '—'}</p>
                        {guide.keyPoints.length ? (
                          <ul>
                            {guide.keyPoints.filter(Boolean).map((point, index) => (
                              <li key={`${guide.id}-preview-${index}`}>{point}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prediag-template-preview-empty">暂未配置专项诊断步骤</div>
                )}
              </div>
            </div>
          ) : (
            <div className="prediag-template-rule-empty">请在左侧选择一个故障现象</div>
          )}
        </aside>
      </section>

      {showImportModal && (
        <div className="prediag-template-modal-overlay" onClick={closeImportModal}>
          <div className="prediag-template-modal prediag-template-import-modal" onClick={e => e.stopPropagation()}>
            <div className="prediag-template-modal-head">
              <span>导入文件</span>
              <button type="button" className="prediag-template-download-link" onClick={downloadImportTemplate}>
                下载模板
              </button>
              <button type="button" className="prediag-template-icon-button" onClick={closeImportModal} aria-label="关闭导入弹框">×</button>
            </div>
            <div className="prediag-template-modal-body">
              <label
                className={`prediag-template-import-upload ${isImportDragging ? 'dragging' : ''}`}
                onDragOver={event => {
                  event.preventDefault()
                  setIsImportDragging(true)
                }}
                onDragLeave={() => setIsImportDragging(false)}
                onDrop={handleImportDrop}
              >
                <UploadCloud size={36} />
                <strong>点击或拖拽文件上传</strong>
                <span>{importFileName || '支持 XLSX、JSON、CSV、TSV、TXT；推荐使用右上角模板填写后导入'}</span>
                <input
                  type="file"
                  accept=".xlsx,.json,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json,text/csv,text/tab-separated-values,text/plain"
                  onChange={handleImportFileChange}
                />
              </label>
              {importError ? (
                <div className="prediag-template-modal-error">{importError}</div>
              ) : null}
              {importPreview ? (
                <div className="prediag-template-modal-preview">
                  <span>一级分类 {importPreview.l1Count}</span>
                  <span>二级分类 {importPreview.l2Count}</span>
                  <span>故障现象 {importPreview.symptomCount}</span>
                  <span>原因 {importPreview.causeCount}</span>
                  <span>工位 {importPreview.stationCount}</span>
                  <span>步骤 {importPreview.stepCount}</span>
                </div>
              ) : (
                <div className="prediag-template-modal-tip">
                  表头示例：一级分类、二级分类、故障现象、系统类别、故障原因、工位、步骤描述、参考资料
                </div>
              )}
              <div className="prediag-template-import-filter">
                <label>
                  <span>导入时间</span>
                  <div className="prediag-template-import-date-range">
                    <input type="text" placeholder="开始时间" value={importStartTime} onChange={e => setImportStartTime(e.target.value)} />
                    <em>→</em>
                    <input type="text" placeholder="结束时间" value={importEndTime} onChange={e => setImportEndTime(e.target.value)} />
                  </div>
                </label>
                <div className="prediag-template-import-filter-actions">
                  <button type="button" className="prediag-template-primary-button">查询</button>
                  <button
                    type="button"
                    className="prediag-template-secondary-button"
                    onClick={() => {
                      setImportStartTime('')
                      setImportEndTime('')
                    }}
                  >
                    重置
                  </button>
                </div>
              </div>
              <div className="prediag-template-import-table-card">
                <div className="prediag-template-import-table-title">
                  <span>数据列表</span>
                  <Settings size={14} />
                </div>
                <table className="prediag-template-import-table">
                  <thead>
                    <tr>
                      <th>记录ID</th>
                      <th>导入时间</th>
                      <th>操作人</th>
                      <th>文件名</th>
                      <th>状态</th>
                      <th>总数</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImportHistory.length ? filteredImportHistory.map(record => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.importTime}</td>
                        <td>{record.operator}</td>
                        <td>{record.fileName}</td>
                        <td>{record.status}</td>
                        <td>{record.total}</td>
                        <td>
                          <button type="button" className="prediag-template-table-link" onClick={() => handleDownloadImportRecord(record)}>
                            下载
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="prediag-template-import-empty">暂无导入记录</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="prediag-template-modal-foot">
              <button type="button" className="prediag-template-secondary-button" onClick={closeImportModal}>取消</button>
              <button
                type="button"
                className="prediag-template-primary-button"
                onClick={handleConfirmImport}
                disabled={!importCategories.length}
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="prediag-template-editor-footer">
        <button type="button" className="prediag-template-secondary-button" onClick={goBack}>返回</button>
        <div className="prediag-template-editor-footer-actions">
          <button type="button" className="prediag-template-secondary-button" onClick={saveTemplate}>保存配置</button>
          <button
            type="button"
            className={template.status === '启用' ? 'prediag-template-danger-button' : 'prediag-template-primary-button'}
            onClick={() => toggleStatus(template.id)}
          >
            {template.status === '启用' ? '停用模板' : '启用模板'}
          </button>
        </div>
      </div>
    </>
  )
}




// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function Component() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [templates, setTemplates] = useState<DiagnosisTemplate[]>(templatesSeed)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | '全部'>('全部')
  const [activeTemplateId, setActiveTemplateId] = useState(templatesSeed[0].id)
  const activeTemplate = templates.find(t => t.id === activeTemplateId) ?? templates[0]

  const firstSymptomId =
    activeTemplate.problemCategories[0]?.l2List[0]?.symptoms[0]?.id ?? ''
  const [selectedVariantId, setSelectedVariantId] = useState(getDefaultVariant(activeTemplate)?.id ?? '')
  const [selectedSymptomId, setSelectedSymptomId] = useState(firstSymptomId)

  // 切换模板时，重置选中
  useEffect(() => {
    setSelectedVariantId(getDefaultVariant(activeTemplate)?.id ?? '')
    setSelectedSymptomId(activeTemplate.problemCategories[0]?.l2List[0]?.symptoms[0]?.id ?? '')
  }, [activeTemplate.id])

  const filteredTemplates = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return templates.filter(t => {
      if (statusFilter !== '全部' && t.status !== statusFilter) return false
      if (!k) return true
      const hay = [t.name, t.code, t.description, ...t.variants.flatMap(v => [v.series, v.model])]
      return hay.some(s => s.toLowerCase().includes(k))
    })
  }, [keyword, statusFilter, templates])

  const openEditor = (templateId: string) => {
    const next = templates.find(t => t.id === templateId)
    if (!next) return
    setActiveTemplateId(templateId)
    setViewMode('edit')
  }

  const toggleStatus = (templateId: string) => {
    setTemplates(curr => curr.map(t => t.id === templateId
      ? { ...t, status: t.status === '启用' ? '停用' : '启用', updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '), updatedBy: '王泓' }
      : t))
  }

  const saveTemplate = () => {
    setTemplates(curr => curr.map(t => t.id === activeTemplateId
      ? { ...t, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '), updatedBy: '王泓' }
      : t))
  }

  const updateSymptom = (symptomId: string, updater: (s: FaultSymptom) => FaultSymptom) => {
    setTemplates(curr => curr.map(t => {
      if (t.id !== activeTemplateId) return t
      return {
        ...t,
        problemCategories: t.problemCategories.map(l1 => ({
          ...l1,
          l2List: l1.l2List.map(l2 => ({
            ...l2,
            symptoms: l2.symptoms.map(s => s.id === symptomId ? updater(s) : s),
          })),
        })),
      }
    }))
  }

  const updateTemplate = (updater: (t: DiagnosisTemplate) => DiagnosisTemplate) => {
    setTemplates(curr => curr.map(t => t.id === activeTemplateId ? updater(t) : t))
  }

  const createTemplate = () => {
    const ts = Date.now()
    const seed = templatesSeed[0]
    const variantIdMap = new Map(seed.variants.map((v, i) => [v.id, `nv-${i + 1}-${ts}`]))
    const newTemplate: DiagnosisTemplate = {
      ...seed,
      id: `tpl-new-${ts}`,
      name: 'FR 新建预诊模板',
      code: `FR-PD-${String(templates.length + 1).padStart(3, '0')}`,
      description: '新建预诊模板',
      status: '停用',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedBy: '王泓',
      variants: seed.variants.map((v, i) => ({ ...v, id: variantIdMap.get(v.id) ?? `nv-${i + 1}-${ts}` })),
      problemCategories: seed.problemCategories.map((l1, i) => ({
        ...l1,
        id: `nl1-${i + 1}-${ts}`,
        l2List: l1.l2List.map((l2, j) => ({
          ...l2,
          id: `nl2-${i + 1}-${j + 1}-${ts}`,
          symptoms: l2.symptoms.map((sym, k) => ({
            ...sym,
            id: `nsym-${i + 1}-${j + 1}-${k + 1}-${ts}`,
            causes: sym.causes.map((c, m) => ({ ...c, id: `nc-${i + 1}-${j + 1}-${k + 1}-${m + 1}-${ts}` })),
            stations: sym.stations.map((st, n) => ({
              ...st,
              id: `nst-${i + 1}-${j + 1}-${k + 1}-${n + 1}-${ts}`,
              steps: st.steps.map((stp, p) => ({ ...stp, id: `nstep-${i + 1}-${j + 1}-${k + 1}-${n + 1}-${p + 1}-${ts}` })),
            })),
            deepDiagnosisGuides: (sym.deepDiagnosisGuides ?? []).map((guide, g) => ({
              ...guide,
              id: `ndg-${i + 1}-${j + 1}-${k + 1}-${g + 1}-${ts}`,
              keyPoints: [...guide.keyPoints],
            })),
          })),
        })),
      })),
    }
    setTemplates(curr => [newTemplate, ...curr])
    setActiveTemplateId(newTemplate.id)
    setViewMode('edit')
  }

  return (
    <AppShell>
      {viewMode === 'list' ? (
        <ListPage
          templates={filteredTemplates}
          keyword={keyword}
          setKeyword={setKeyword}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          createTemplate={createTemplate}
          openEditor={openEditor}
          toggleStatus={toggleStatus}
        />
      ) : (
        <EditPage
          template={activeTemplate}
          selectedVariantId={selectedVariantId}
          setSelectedVariantId={setSelectedVariantId}
          selectedSymptomId={selectedSymptomId}
          setSelectedSymptomId={setSelectedSymptomId}
          goBack={() => setViewMode('list')}
          saveTemplate={saveTemplate}
          toggleStatus={toggleStatus}
          updateSymptom={updateSymptom}
          updateTemplate={updateTemplate}
        />
      )}
    </AppShell>
  )
}

