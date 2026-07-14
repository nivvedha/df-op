let data = []
let columns = []

const csvFileInput = document.getElementById('csvFile')
const categorySelect = document.getElementById('categorySelect')
const operationSelect = document.getElementById('operationSelect')
const operationInputs = document.getElementById('operationInputs')
const runBtn = document.getElementById('runBtn')
const summary = document.getElementById('summary')
const tableContainer = document.getElementById('tableContainer')
// columnsDatalist removed; selects are generated dynamically

async function loadCsvText(text) {
  parseCsv(text)
  showTable(data)
  showSummary(`Loaded ${data.length} rows and ${columns.length} columns from the active dataset.`)
}

csvFileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const text = await file.text()
  loadCsvText(text)
})

async function loadBundledCsv() {
  try {
    showSummary('Loading bundled orders.csv...')
    const response = await fetch('orders.csv', { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    loadCsvText(text)
  } catch (error) {
    showSummary(`Could not load bundled orders.csv: ${error.message}`)
    tableContainer.innerHTML = '<p style="padding:16px;">The bundled CSV could not be loaded. You can still upload one manually.</p>'
  }
}

loadBundledCsv()

categorySelect && categorySelect.addEventListener('change', () => {
  populateOperationsForCategory(categorySelect.value)
  operationInputs.innerHTML = ''
  if (!categorySelect.value) {
    showSummary('Choose a category first.')
  } else {
    showSummary(`Category set to ${categorySelect.options[categorySelect.selectedIndex].text}. Choose an operation.`)
  }
})

operationSelect.addEventListener('change', () => {
  if (!operationSelect.value) {
    operationInputs.innerHTML = ''
    showSummary('Choose an operation from the selected category.')
    return
  }
  renderOperationInputs(operationSelect.value)
})

operationSelect.addEventListener('click', () => {
  if (!categorySelect.value) {
    showSummary('Choose a category first.')
  }
})

runBtn.addEventListener('click', () => {
  const operation = operationSelect.value
  if (!operation) {
    showSummary('Choose an operation first.')
    return
  }
  if (!data.length) {
    showSummary('Load orders.csv before running operations.')
    return
  }
  runOperation(operation)
})

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/)
  columns = rows.shift().split(',').map((col) => col.trim())
  data = rows.map((line) => {
    const values = line.split(',').map((value) => value.trim())
    return columns.reduce((obj, col, index) => {
      const value = values[index]
      obj[col] = isNumeric(value) ? Number(value) : value
      return obj
    }, {})
  })
}

function buildColumnSelect(id, includeEmpty = true, multiple = false, size = 6) {
  const multipleAttr = multiple ? ' multiple' : ''
  const sizeAttr = multiple ? ` size="${size}"` : ''
  const emptyOpt = includeEmpty ? '<option value="">-- choose column --</option>' : ''
  const opts = columns.map(c => `<option value="${c}">${c}</option>`).join('')
  return `<select id="${id}"${multipleAttr}${sizeAttr}>${emptyOpt}${opts}</select>`
}

function isNumeric(value) {
  return value !== undefined && value !== '' && !Number.isNaN(Number(value))
}

function renderOperationInputs(operation) {
  let html = ''

  if (operation === 'select') {
    // keep multi-select for choosing multiple columns
    html = `
      <label>Columns (select multiple with Ctrl/Cmd)<br />${buildColumnSelect('selectColumnsInput', false, true, 6)}</label>
    `
  } else if (operation === 'selectRow') {
    html = `
      <label>Column<br />${buildColumnSelect('selectRowColInput')}</label>
      <label>Value<br /><input id="selectRowValueInput" placeholder="KFC" /></label>
    `
  } else if (operation === 'filter') {
    html = `
      <label>Column<br />${buildColumnSelect('filterColInput')}</label>
      <label>Value<br /><input id="filterValueInput" placeholder="KFC" /></label>
    `
  } else if (operation === 'range') {
    html = `
      <label>Column<br />${buildColumnSelect('rangeColInput')}</label>
      <label>Min<br /><input id="rangeMinInput" type="number" placeholder="100" /></label>
      <label>Max<br /><input id="rangeMaxInput" type="number" placeholder="200" /></label>
    `
  } else if (operation === 'sort') {
    html = `
      <label>Column<br />${buildColumnSelect('sortColInput')}</label>
      <label>Direction<br />
        <select id="sortDirectionInput">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    `
  } else if (operation === 'aggregate') {
    html = `
      <label>Column<br />${buildColumnSelect('aggColInput')}</label>
      <label>Function<br />
        <select id="aggFuncInput">
          <option value="min">Min</option>
          <option value="max">Max</option>
          <option value="avg">Average</option>
        </select>
      </label>
    `
  } else if (operation === 'removeDuplicates') {
    html = `
      <label>Columns to dedupe (select multiple)<br />${buildColumnSelect('dedupeColsInput', false, true, 6)}</label>
    `
  } else if (operation === 'countRows') {
    html = `
      <p>Counts the current number of rows in the loaded dataset.</p>
    `
  } else if (operation === 'indexMatch') {
    html = `
      <label>Index column<br />${buildColumnSelect('indexColInput')}</label>
      <label>Index value<br /><input id="indexValInput" placeholder="123" /></label>
      <label>Return column (optional)<br />${buildColumnSelect('returnColInput')}</label>
    `
  } else if (operation === 'findDuplicates') {
    html = `
      <label>Column<br />${buildColumnSelect('dupColInput')}</label>
    `
  } else if (operation === 'group' || operation === 'pivot') {
    html = `
      <label>Group by / Index<br />${buildColumnSelect('groupColInput')}</label>
      <label>Value column<br />${buildColumnSelect('groupAggColInput')}</label>
      <label>Function<br />
        <select id="groupAggTypeInput">
          <option value="sum">Sum</option>
          <option value="count">Count</option>
          <option value="avg">Average</option>
          <option value="max">Max</option>
          <option value="min">Min</option>
        </select>
      </label>
    `
  }

  operationInputs.innerHTML = html
}

let allOperations = []

function populateOperationsForCategory(category) {
  const mapping = {
    selection: [
      { v: 'filter', t: 'Filter Rows' },
      { v: 'select', t: 'Select Columns' },
      { v: 'selectRow', t: 'Select Rows by Column' },
      { v: 'range', t: 'Filter Range' }
    ],
    structure: [
      { v: 'removeDuplicates', t: 'Remove Duplicates' },
      { v: 'sort', t: 'Sort' },
      { v: 'countRows', t: 'Count Rows' }
    ],
    aggregations: [
      { v: 'aggregate', t: 'Aggregate (Min/Max/Avg)' }
    ],
    lookups: [
      { v: 'indexMatch', t: 'Index Match' },
      { v: 'findDuplicates', t: 'Find Duplicate Values' }
    ],
    pivot: [
      { v: 'pivot', t: 'Group / Pivot' }
    ]
  }

  allOperations = mapping[category] || []
  filterOperations('')
}

function filterOperations() {
  operationSelect.innerHTML = '<option value="">-- choose operation --</option>' + allOperations.map((o) => `<option value="${o.v}">${o.t}</option>`).join('')
  operationSelect.value = ''
  operationInputs.innerHTML = ''
}

function runOperation(operation) {
  switch (operation) {
    case 'select': return selectColumns()
    case 'selectRow': return selectRowsByColumn()
    case 'filter': return filterByCondition()
    case 'range': return filterByRange()
    case 'sort': return sortByColumn()
    case 'removeDuplicates': return removeDuplicates()
    case 'countRows': return countRows()
    case 'aggregate': return aggregate()
    case 'indexMatch': return indexMatch()
    case 'findDuplicates': return findDuplicates()
    case 'group': return groupByAggregate()
    case 'pivot': return pivotTable()
    default:
      showSummary('Unknown operation: ' + operation)
  }
}

function showSummary(text) {
  summary.textContent = text
}

function showTable(rows) {
  if (!rows || !rows.length) {
    tableContainer.innerHTML = '<p style="padding:16px;">No data to show.</p>'
    return
  }

  const headerCols = Object.keys(rows[0])
  const header = headerCols.map((col) => `<th>${col}</th>`).join('')
  const body = rows.slice(0, 20).map((row) => `<tr>${headerCols.map((col) => `<td>${row[col]}</td>`).join('')}</tr>`).join('')

  tableContainer.innerHTML = `
    <table>
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>`
}

function selectColumns() {
  const sel = document.getElementById('selectColumnsInput')
  const cols = sel ? Array.from(sel.selectedOptions).map(o => o.value).filter(Boolean) : []
  if (!cols.length) {
    showSummary('Select at least one column.')
    return
  }
  const invalid = cols.filter((col) => !columns.includes(col))
  if (invalid.length) {
    showSummary(`Invalid columns: ${invalid.join(', ')}`)
    return
  }
  const result = data.map((row) => cols.reduce((obj, col) => ({ ...obj, [col]: row[col] }), {}))
  showSummary(`Selected columns: ${cols.join(', ')}.`)
  showTable(result)
}

function selectRowsByColumn() {
  const col = document.getElementById('selectRowColInput').value.trim()
  const value = document.getElementById('selectRowValueInput').value.trim()
  if (!columns.includes(col)) {
    showSummary(`Invalid column: ${col}`)
    return
  }
  const filtered = data.filter((row) => String(row[col]) === value)
  showSummary(filtered.length ? `Found ${filtered.length} row(s) where ${col} = ${value}.` : 'No matching row found.')
  showTable(filtered)
}

function filterByCondition() {
  const col = document.getElementById('filterColInput').value.trim()
  const value = document.getElementById('filterValueInput').value.trim()
  if (!columns.includes(col)) {
    showSummary(`Invalid column: ${col}`)
    return
  }
  const filtered = data.filter((row) => String(row[col]) === value)
  showSummary(`Found ${filtered.length} rows where ${col} = ${value}.`)
  showTable(filtered)
}

function filterByRange() {
  const col = document.getElementById('rangeColInput').value.trim()
  const min = Number(document.getElementById('rangeMinInput').value)
  const max = Number(document.getElementById('rangeMaxInput').value)
  if (!columns.includes(col)) {
    showSummary(`Invalid column: ${col}`)
    return
  }
  const filtered = data.filter((row) => row[col] >= min && row[col] <= max)
  showSummary(`Found ${filtered.length} rows where ${col} is between ${min} and ${max}.`)
  showTable(filtered)
}

function sortByColumn() {
  const col = document.getElementById('sortColInput').value.trim()
  const dir = document.getElementById('sortDirectionInput').value
  if (!columns.includes(col)) {
    showSummary(`Invalid column: ${col}`)
    return
  }
  const sorted = [...data].sort((a, b) => {
    if (a[col] < b[col]) return dir === 'asc' ? -1 : 1
    if (a[col] > b[col]) return dir === 'asc' ? 1 : -1
    return 0
  })
  showSummary(`Sorted by ${col} in ${dir} order.`)
  showTable(sorted)
}

function aggregate() {
  const col = document.getElementById('aggColInput').value.trim()
  const func = document.getElementById('aggFuncInput').value
  if (!columns.includes(col)) {
    showSummary(`Invalid column: ${col}`)
    return
  }
  const values = data.map((row) => row[col]).filter((value) => typeof value === 'number')
  if (!values.length) {
    showSummary('No numeric values found for aggregation.')
    return
  }

  let result
  if (func === 'sum') result = values.reduce((acc, n) => acc + n, 0)
  else if (func === 'count') result = values.length
  else if (func === 'avg') result = (values.reduce((acc, n) => acc + n, 0) / values.length).toFixed(2)
  else if (func === 'max') result = Math.max(...values)
  else if (func === 'min') result = Math.min(...values)

  showSummary(`${func.toUpperCase()} of ${col}: ${result}`)
  showTable([])
}

function groupByAggregate() {
  const groupCol = document.getElementById('groupColInput').value.trim()
  const aggCol = document.getElementById('groupAggColInput').value.trim()
  const aggType = document.getElementById('groupAggTypeInput').value
  if (!columns.includes(groupCol) || !columns.includes(aggCol)) {
    showSummary(`Invalid columns: ${groupCol} or ${aggCol}`)
    return
  }

  const groups = {}
  data.forEach((row) => {
    const key = row[groupCol]
    if (!groups[key]) groups[key] = []
    groups[key].push(row[aggCol])
  })

  const result = Object.entries(groups).map(([key, values]) => {
    const numeric = values.filter((value) => typeof value === 'number')
    let value
    if (aggType === 'sum') value = numeric.reduce((acc, n) => acc + n, 0)
    else if (aggType === 'count') value = values.length
    else if (aggType === 'avg') value = numeric.length ? (numeric.reduce((acc, n) => acc + n, 0) / numeric.length).toFixed(2) : 0
    else if (aggType === 'max') value = Math.max(...numeric)
    else if (aggType === 'min') value = Math.min(...numeric)
    return { [groupCol]: key, [aggType + '_' + aggCol]: value }
  })

  showSummary(`Grouped by ${groupCol} and calculated ${aggType} of ${aggCol}.`)
  showTable(result)
}

function pivotTable() {
  const indexCol = document.getElementById('groupColInput').value.trim()
  const aggCol = document.getElementById('groupAggColInput').value.trim()
  const aggType = document.getElementById('groupAggTypeInput').value
  if (!columns.includes(indexCol) || !columns.includes(aggCol)) {
    showSummary(`Invalid columns: ${indexCol} or ${aggCol}`)
    return
  }

  const groups = {}
  data.forEach((row) => {
    const key = row[indexCol]
    if (!groups[key]) groups[key] = []
    groups[key].push(row[aggCol])
  })

  const result = Object.entries(groups).map(([key, values]) => {
    const numeric = values.filter((value) => typeof value === 'number')
    let value
    if (aggType === 'sum') value = numeric.reduce((acc, n) => acc + n, 0)
    else if (aggType === 'count') value = values.length
    else if (aggType === 'avg') value = numeric.length ? (numeric.reduce((acc, n) => acc + n, 0) / numeric.length).toFixed(2) : 0
    else if (aggType === 'max') value = Math.max(...numeric)
    else if (aggType === 'min') value = Math.min(...numeric)
    return { [indexCol]: key, [aggType + '_' + aggCol]: value }
  })

  showSummary(`Pivoted on ${indexCol} with ${aggType} of ${aggCol}.`)
  showTable(result)
}

function removeDuplicates() {
  const input = document.getElementById('dedupeColsInput')
  const cols = input ? Array.from(input.selectedOptions).map(o => o.value).filter(Boolean) : []
  const seen = new Set()
  const result = []
  data.forEach(row => {
    const key = cols.length ? cols.map(c => String(row[c])).join('||') : JSON.stringify(row)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(row)
    }
  })
  showSummary(`Removed duplicates; ${result.length} unique rows remain (from ${data.length}).`)
  showTable(result)
}

function countRows() {
  showSummary(`Row count: ${data.length}`)
  showTable([])
}

function indexMatch() {
  const indexCol = document.getElementById('indexColInput').value.trim()
  const indexVal = document.getElementById('indexValInput').value.trim()
  const returnCol = document.getElementById('returnColInput').value.trim()
  if (!columns.includes(indexCol)) { showSummary(`Invalid column: ${indexCol}`); return }
  const matched = data.filter(r => String(r[indexCol]) === indexVal)
  if (!matched.length) { showSummary('No match found.'); showTable([]); return }
  if (returnCol && columns.includes(returnCol)) {
    const out = matched.map(r => ({ [returnCol]: r[returnCol] }))
    showSummary(`Found ${matched.length} match(es); returning column ${returnCol}.`)
    showTable(out)
  } else {
    showSummary(`Found ${matched.length} match(es).`)
    showTable(matched)
  }
}

function findDuplicates() {
  const col = document.getElementById('dupColInput').value.trim()
  if (!columns.includes(col)) { showSummary(`Invalid column: ${col}`); return }
  const counts = {}
  data.forEach(r => { const k = String(r[col]); counts[k] = (counts[k] || 0) + 1 })
  const result = Object.entries(counts).filter(([k,v]) => v > 1).map(([k,v]) => ({ value: k, count: v }))
  showSummary(`Found ${result.length} duplicated value(s) in ${col}.`)
  showTable(result)
}
