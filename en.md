# luv-t-archive
 
luv-t-archive is enumerate your favorite/like tweets in the Spreadsheet, and saves images and videos in the Drive.  
Fork this repository and register the required `Token` to `Settings > Secrets` and it will collect automatically.

[JA](https://github.com/ivgtr/luv-t-archive/blob/master/README.md) | EN

## Setup

### Required
- Google Account (GCP account)
- Twitter Account
   - Need to apply for `Twitter Developers`

### Prep work
1. Create a new GCP `Service Account` (https://console.cloud.google.com/)
    1. Enable to `Drive API`and `Sheets API`.(https://console.cloud.google.com/apis/library)
    1. Choose Account you have created, Create and save a key of type `JSON`. (https://console.cloud.google.com/iam-admin/serviceaccounts)
1. Create new sheets in `Google Spreadsheets`. (https://docs.google.com/spreadsheets)
    1. Copy the name of the sheet and ID.
    1. Invite the `Service Account` to that sheet.
1. Create new Folder in `Google Drive`. (https://drive.google.com/drive)
    1. Copy its ID.
    1. Invite the `Service Account` to that Folder.
1. Apply for `Twitter Developers`. (https://developer.twitter.com/en/apps/)
   1. Create a new App, create a `Bearer Token` and copy it.
1. Copy the ID of the Twitter Account you want to use.

### Project setup
1. Fork this repo
1. Edit the [environment variable](https://github.com/ivgtr/luv-t-archive/blob/master/.github/workflows/schedule.yml#L24-L31) in `.github/workflows/schedule.yml`:
   - **TWITTER_ID:** Twitter ID
   - **SHEET_NAME:** The name of the Spreadsheets sheets (Sheet1/シート1)
1. Go to the repo Settings > Secrets
1. Add the following environment variables::
   - **TWITTER_TOKEN:** Created Twitter Bearer Token
   - **SHEET_NAME:** The ID portion from your Spreadsheets sheets url: `https://docs.google.com/spreadsheets/d/`**`xxxxxxxxxxxxxxxxxxxx`**`/edit`.
   - **DRIVE_FOLDER_ID:** The ID portion from your Drive folder url: `https://drive.google.com/drive/folders/`**`xxxxxxxxxxxxxxxxxxxx`**.
   - **SERVICE_CLIENT_EMAIL:** The `client_email` part of the `JSON` key for the stored service account.
   - **SERVICE_PRIVATE_KEY:** The `private_key` part of the `JSON` key for the stored service account.
     - Remove the "\n" as it doesn't work well if it contains it, and change the line.
     - Copy the `private_key` and run `$ echo "key"` and copy the output.

## Task
- [x] Get Tweet.
- [x] Compare the data the Spreadsheet with the retrieved tweets.
- [x] Format and save the tweet in the Spreadsheet.
- [x] Save images and videos of tweets to Drive.
- [x] Error handling, while saving to the Drive.
- [x] CI Setting.
- [ ] Error handling, during CI run. (_even errors are treated as normal..._)

## Spec
1. The process runs, Get latest 200 favorite/like tweets.
1. Browse Spreadsheets, eliminate duplicate tweets, save image and video files to Drive.
   - Due to the GCP API limitation, saved files at one time is limited to 90.
   - _They are saved in the oldest order, so if you don't favorite/like 90 Tweets before the next run, there should be few acquisition omissions..._
1. Save the list of files uploaded to Drive to Spreadsheets.
   - Be careful if you delete Sheets or get an error, the files saved in Drive will be duplicated.
      - Allow at least 2 minutes between process runs.
   - _would like to refer to the Drive, but due to the specification of the API, not practical as I would need to make several requests to get the file list..._

## License
MIT ©[ivgtr](https://github.com/ivgtr)


[![Twitter Follow](https://img.shields.io/twitter/follow/mawaru_hana?style=social)](https://twitter.com/mawaru_hana) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)  