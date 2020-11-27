import { google } from 'googleapis'
import * as dotenv from 'dotenv'
import { PassThrough } from 'stream'
import fetch from 'node-fetch'
import fileType from 'file-type'
import creds from '../jsons/client_secret.json'

dotenv.config()

const {
  SHEET_NAME: sheetName,
  SHEET_ID: sheetId,
  FOLDER_ID: folderId
} = process.env

const jwtClient = new google.auth.JWT(
  creds.client_email,
  undefined,
  creds.private_key,
  [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ]
)

// スプレッドシートAPIはv4を使う
const sheets = google.sheets({
  version: 'v4',
  auth: jwtClient
})

// ドライヴAPIはv3を使う
const drive = google.drive({
  version: 'v3',
  auth: jwtClient
})

const saveDriveData = async (resources: resources[]) => {
  try {
    resources.map(async (data) => {
      const bufferData: {
        data: Buffer
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
              data: result,
              mime
            })
          })
          .catch((err) => {
            return reject(err)
          })
      })

      const bufferStream = new PassThrough()
      bufferStream.end(bufferData.data)

      drive.files.create(
        {
          requestBody: {
            parents: [folderId as string],
            mimeType: bufferData.mime,
            name: data.file_name
          },
          media: {
            mimeType: bufferData.mime,
            body: bufferStream
          },
          fields: 'id'
        },
        {}
      )

      return data
    })
  } catch (error) {
    console.log(`The Drive API returned an error: ${error}`)
  }
}
const setSheetData = async (values: string[][]) => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values
      }
    })
  } catch (error) {
    console.log(`The API returned an error: ${error}`)
  }
}

const getSheetRequest = async (
  data: media[]
): Promise<{
  values: string[][]
  resources: resources[]
}> => {
  const values: string[][] = []
  const resources: resources[] = []

  try {
    const responseGetSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!C:C`
    })
    const names: string[] = responseGetSheet?.data?.values?.flat() || []

    data.map((media) => {
      if (!names.includes(media.file_name)) {
        values.push([
          media.tweet_url,
          media.tweet_time,
          media.file_name,
          media.media_type,
          media.media_url,
          media.save_time
        ])
        resources.push({
          media_url: media.media_url,
          file_name: media.file_name,
          media_extension: media.media_url.slice(
            media.media_url.lastIndexOf('.') + 1
          )
        })
      }
      return media
    })
  } catch (error) {
    console.log(`The Sheet API returned an error: ${error}`)
  }

  return { values, resources }
}

const saveToData = async (data: media[]): Promise<boolean> => {
  try {
    const { values, resources } = await getSheetRequest(data)
    if (values.length) {
      await Promise.all([setSheetData(values), saveDriveData(resources)]).catch(
        (error) => {
          throw new Error(error)
        }
      )
    }
    console.log(`${resources.length}件追加`)
    return true
  } catch (error) {
    console.log(`Error: ${error}`)
    return false
  }
}

export default saveToData
