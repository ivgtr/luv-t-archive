import { PassThrough } from 'stream'
import { google } from 'googleapis'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { fromBuffer } from 'file-type'

dotenv.config()

const {
  SHEET_NAME: sheetName,
  SHEET_ID: sheetId,
  DRIVE_FOLDER_ID: driveFolderId,
  SERVICE_CLIENT_EMAIL: serviceClientEmail,
  SERVICE_PRIVATE_KEY: servicePrivateKey
} = process.env

const jwtClient = new google.auth.JWT(
  serviceClientEmail,
  undefined,
  servicePrivateKey,
  ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
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
export const filterResources = async (resources: media[]): Promise<media[]> => {
  const filterData: media[] = []
  if (!resources.length) return filterData
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
    throw `The Sheet API returned an ${error}`
  }

  return filterData
}

/**
 * ファイルを取得してdriveに保存し、正常に終了したデータのリストを返す
 * @param filterData
 */
export const saveDriveData = async (filterData: media[]) => {
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
            const { mime } = (await fromBuffer(result)) as {
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
                  parents: [driveFolderId as string],
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
              throw err
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
export const setSheetData = async (shapData: string[][]): Promise<void> => {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: shapData
      }
    })
  } catch (error) {
    throw `The Sheet API returned an ${error}`
  }
}

//
/**
 * 一連の処理のエラーをハンドリングする
 * @param resources
 */
export const saveToData = async (resources: media[]): Promise<void> => {
  try {
    const filterData = await filterResources(resources)
    if (filterData.length) {
      const shapData = await saveDriveData(filterData)
      await setSheetData(shapData)
      console.log(`${shapData.length}件追加しました`)
    } else {
      console.log('新しいデータはありません')
    }
  } catch (error) {
    throw new Error(error)
  }
}
