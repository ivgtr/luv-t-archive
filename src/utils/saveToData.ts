import { google } from 'googleapis'
import * as dotenv from 'dotenv'
import { PassThrough } from 'stream'
import fetch from 'node-fetch'
import fileType from 'file-type'

dotenv.config()

const {
  SHEET_NAME: sheetName,
  SHEET_ID: sheetId,
  FOLDER_ID: folderId,
  CLIENT_EMAIL: clientEmail,
  PRIVATE_KEY: privateKey
} = process.env

const jwtClient = new google.auth.JWT(
  clientEmail,
  undefined,
  privateKey,
  [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ],
  undefined
)

// Spreadsheets APIはv4を使う
const sheets = google.sheets({
  version: 'v4',
  auth: jwtClient
})

// Drive APIはv3を使う
const drive = google.drive({
  version: 'v3',
  auth: jwtClient
})

/**
 * Twitterから取得したデータをspreadsheetsのデータと比較し、重複してないデータを返す
 * @param resources
 */
const filterResources = async (resources: media[]): Promise<media[]> => {
  const filterData: media[] = []

  try {
    const responseGetSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!C:C`
    })
    const names: string[] = responseGetSheet?.data?.values?.flat() || []

    resources.map((media) => {
      if (!names.includes(media.file_name)) {
        filterData.push(media)
      }
      return media
    })
  } catch (error) {
    throw new Error(`The Sheet API returned an ${error}`)
  }

  return filterData
}

/**
 * ファイルを取得してdriveに保存し、正常に終了したデータのリストを返す
 * @param filterData
 */
const saveDriveData = async (filterData: media[]) => {
  // そのままspreadsheetsに登録できる様に整形したデータをいれる
  const shapData: string[][] = []
  await Promise.all(
    filterData.map(async (data) => {
      // ファイルデータを取得し、そのmimeタイプと一緒に返す
      const fileData: {
        bufferData: Buffer
        mime: string
      } = await new Promise((resolve, reject) => {
        fetch(data.media_url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        })
          .then((response) => response.buffer())
          .then(async (result) => {
            const { mime } = (await fileType.fromBuffer(result)) as {
              ext: string
              mime: string
            }
            return resolve({
              bufferData: result,
              mime
            })
          })
          .catch((err) => {
            return reject(err)
          })
      })

      await new Promise((resolve, reject) => {
        try {
          // よくわからないけど良い感じstream APIで繋げてる
          const bufferStream = new PassThrough()
          bufferStream.end(fileData.bufferData)

          // ファイルを取得して整形したデータを返す and 取得できなかったデータは返さない様に
          return drive.files
            .create(
              {
                requestBody: {
                  parents: [folderId as string],
                  mimeType: fileData.mime,
                  name: data.file_name
                },
                media: {
                  mimeType: fileData.mime,
                  body: bufferStream
                },
                fields: 'id'
              },
              {}
            )
            .then(() => {
              shapData.push([
                data.tweet_url,
                data.tweet_time,
                data.file_name,
                data.media_type,
                data.media_url,
                data.save_time
              ])
              return resolve(data)
            })
            .catch((err) => {
              throw new Error(err)
            })
        } catch (err) {
          return reject(err)
        }
      })
    })
  )

  return shapData
}

/**
 * 整形したデータをspreadsheetsに登録
 * @param shapData
 */
const setSheetData = async (shapData: string[][]): Promise<void> => {
  try {
    // 型がおかしいのでts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        shapData
      }
    })
  } catch (error) {
    throw new Error(`The Sheet API returned an ${error}`)
  }
}

//
/**
 * 処理の結果によってboolean型を返す
 * @param resources
 */
const saveToData = async (resources: media[]): Promise<boolean> => {
  try {
    const filterData = await filterResources(resources)
    if (filterData.length) {
      const shapData = await saveDriveData(filterData)
      await setSheetData(shapData)
      console.log(`${shapData.length}件追加しました`)
    } else {
      console.log('新しいデータはありません')
    }

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export default saveToData
