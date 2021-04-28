import { PassThrough } from 'stream'
import * as dotenv from 'dotenv'
import { fromBuffer } from 'file-type'
import { google } from 'googleapis'
import fetch from 'node-fetch'

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
 * Sheets APIから名前のデータを取得し、使い易いように浅くして返す
 * @returns {Promise<string[]>} sheetsに登録されている名前のデータ
 */
export const getSheetsNamesData = async (): Promise<string[]> => {
  const sheetsNamesData = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!C:C`
  })

  return sheetsNamesData?.data?.values?.flat() || []
}

/**
 * Twitterから取得したデータをspreadsheetsのデータと比較し、重複してないデータを返す
 * @param {media[]} resources 取得し、整形したデータ
 *
 * @returns {Promise<media[]>} 取得したデータから重複を省いたデータ
 */
export const filterResources = async (resources: media[]): Promise<media[]> => {
  const filterData: media[] = []
  if (!resources.length) return filterData
  try {
    const namesData: string[] = await getSheetsNamesData()

    resources
      .slice(0)
      .reverse()
      .map((media) => {
        if (!namesData.includes(media.file_name) && filterData.length < 90) {
          filterData.push(media)
        }
        return media
      })
  } catch (error) {
    throw `The get Sheet API returned an ${error}`
  }

  return filterData
}

/**
 * ファイルを取得してdriveに保存し、正常に終了したデータのリストを返す
 * @param {media[]} filterData 取得したデータから重複を省いたデータ
 *
 * @returns {Promise<string[][]>} driveにuploadが成功し、sheetに登録しやすい様に整形したデータ
 */
export const saveDrive = async (filterData: media[]): Promise<string[][]> => {
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
          .catch((error) => reject(error))
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
            .catch((error) => {
              throw `The Sheet API returned an ${error}`
            })
        } catch (error) {
          return reject(error)
        }
      })
    })
  ).catch((error) => {
    console.log(error)
  })

  return shapData
}

/**
 * 整形したデータをspreadsheetsに登録
 * @param shapData
 */
export const updateSheet = async (shapData: string[][]): Promise<void> => {
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
    throw `The append Sheet API returned an ${error}`
  }
}

//
/**
 * 一連の処理のエラーをハンドリングする
 * @param resources 取得し、整形されたtweetデータ
 */
export const saveData = async (resources: media[]): Promise<void> => {
  try {
    const filterData = await filterResources(resources)
    if (filterData.length) {
      const shapData = await saveDrive(filterData)
      await updateSheet(shapData)
      console.log(`${shapData.length}件追加しました`)
    } else {
      console.log('新しいデータはありません')
    }
  } catch (error) {
    throw new Error(error)
  }
}
