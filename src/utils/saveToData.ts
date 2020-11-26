import { google } from 'googleapis'
import * as dotenv from 'dotenv'
import creds from '../jsons/client_secret.json'

const sample: media[] = [
  {
    tweet_time: '2019/11',
    tweet_url: 'https://',
    file_name: 'hoge2',
    media_type: 'photo',
    media_url: 'https://'
  },
  {
    tweet_time: '2019/11',
    tweet_url: 'https://',
    file_name: 'foo2',
    media_type: 'video',
    media_url: 'https://'
  }
]

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

const saveDriveData = async (resources: string[]) => {
  try {
    drive.files.create({})
  } catch (error) {
    console.log(`The API returned an error: ${error}`)
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
): Promise<{ values: string[][]; resources: string[] }> => {
  const values: string[][] = []
  const resources: string[] = []

  try {
    const responseGetSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!C:C`
    })
    const names: string[] = responseGetSheet?.data?.values?.flat() || []

    data.map((media) => {
      if (!names.includes(media.file_name)) {
        values.push([
          media.tweet_time,
          media.tweet_url,
          media.file_name,
          media.media_type,
          media.media_url
        ])
        resources.push(media.media_url)
      }
      return media
    })
  } catch (error) {
    console.log(`The API returned an error: ${error}`)
  }

  return { values, resources }
}

const saveToData = async (data: media[]): Promise<boolean> => {
  const { values, resources } = await getSheetRequest(data)
  if (values.length) {
    await Promise.all([setSheetData(values), saveDriveData(resources)])
      .then(() => console.log('全部終わりました！'))
      .catch((error) => console.log(error))
    return true
  }
  return false
}

export default saveToData
