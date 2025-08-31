// upload.js
const fs = require('fs')

const {
  loadSpreadsheet,
  localesPath,
  getPureKey,
  ns,
  lngs,
  sheetId,
  columnKeyToHeader,
  NOT_AVAILABLE_CELL,
} = require('./index')

const headerValues = columnKeyToHeader

async function addNewSheet(doc, title, sheetId) {
  const sheet = await doc.addSheet({
    sheetId,
    title,
    headerValues,
  })

  return sheet
}

async function updateTranslationsFromKeyMapToSheet(doc, keyMap) {
  //시트 타이틀
  const title = 'wrtn-io-landing'
  let sheet = doc.sheetsById[sheetId]
  if (!sheet) {
    sheet = await addNewSheet(doc, title, sheetId)
  }

  const rows = await sheet.getRows()

  // find exsit keys
  const exsitKeys = {}
  const addedRows = []

  let maxRowNum = 0
  rows.forEach((row) => {
    if (row._rowNumber > maxRowNum) {
      maxRowNum = row._rowNumber
    }
    const key = row[columnKeyToHeader.key]
    if (keyMap[key]) {
      exsitKeys[key] = true
    }
  })

  //스프레트시트에 row 넣는 부분
  for (const [key, translations] of Object.entries(keyMap)) {
    let empty = false
    if (!exsitKeys[key]) {
      const row = {
        [columnKeyToHeader.key]: key,
        ...Object.keys(translations).reduce((result, lng) => {
          const header = columnKeyToHeader[lng]
          result[header] = translations[lng]

          // 24.06.10 시트에 "한글"열 기준 추가되어있지 않은 값만 추가되도록 변경.
          const findRowIdx = rows.findIndex((item) => item._rawData[0] === translations.ko)
          if (findRowIdx < 0) {
            if (translations[lng] === ''
              || translations[lng] === null
              || translations[lng] === undefined
            ) {
              empty = true
            } else {
              empty = false
            }
          } else {
            empty = false
          }

          return result
        }, {}),
      }
      if (!empty) continue

      maxRowNum += 1
      row['일본어'] = `=GOOGLETRANSLATE(B${maxRowNum}, "ko", "ja")`
      row['영어'] = `=GOOGLETRANSLATE(E${maxRowNum}, "ja", "en")`
      row['에스파냐어'] = `=GOOGLETRANSLATE(C${maxRowNum}, "en", "es")`
      addedRows.push(row)
    }
  }

  // upload new keys
  await sheet.addRows(addedRows)

  // 시트에서 사용안하는 키값들 제거
  await handleChangeRows(doc, Object.keys(keyMap))
}

// key값에 따른 언어 value
function toJson(keyMap) {
  const json = {}

  Object.entries(keyMap).forEach(([__, keysByPlural]) => {
    for (const [keyWithPostfix, translations] of Object.entries(keysByPlural)) {
      json[keyWithPostfix] = {
        ...translations,
      }
    }
  })

  return json
}

// 언어 key : value 값 저장
function gatherKeyMap(keyMap, lng, json) {
  for (const [keyWithPostfix, translated] of Object.entries(json)) {
    const key = getPureKey(keyWithPostfix)

    if (!keyMap[key]) {
      keyMap[key] = {}
    }

    const keyMapWithLng = keyMap[key]
    if (!keyMapWithLng[keyWithPostfix]) {
      keyMapWithLng[keyWithPostfix] = lngs.reduce((initObj, lng) => {
        initObj[lng] = NOT_AVAILABLE_CELL

        return initObj
      }, {})
    }

    keyMapWithLng[keyWithPostfix][lng] = translated
  }
}

async function updateSheetFromJson() {
  const doc = await loadSpreadsheet()

  fs.readdir(localesPath, (error, lngs) => {
    if (error) {
      throw error
    }

    const keyMap = {}

    lngs.forEach((lng) => {
      // window와 linux 경로가 달라 아래처럼 설정.
      let localeJsonFilePath = ''
      try {
        localeJsonFilePath = `${localesPath}\\${lng}\\${ns}.json`

        const json = fs.readFileSync(localeJsonFilePath, 'utf8')

        gatherKeyMap(keyMap, lng, JSON.parse(json))
      } catch (err) {
        localeJsonFilePath = `${localesPath}/${lng}/${ns}.json`
        const json = fs.readFileSync(localeJsonFilePath, 'utf8')

        gatherKeyMap(keyMap, lng, JSON.parse(json))
      }
    })
    //스프레드 시트에 업데이트
    updateTranslationsFromKeyMapToSheet(doc, toJson(keyMap))
  })
}

// 시트에서 사용안하는 키값들 제거
async function handleChangeRows(doc, scanKeys) {
  const sheet = doc.sheetsById[sheetId]
  const rows = await sheet.getRows()

  // 실제로 사용안하는 행 제거
  for (const row of rows) {
    const rowKey = row._rawData[0]
    const rowNumber = row._rowNumber

    const findUseIdx = scanKeys.findIndex((item) => item === rowKey && rowNumber > 1)
    if (findUseIdx < 0) {
      console.log(`delete key => ${rowKey}, row number => ${rowNumber}`)
      await row.delete()
    }
  }
}

updateSheetFromJson()