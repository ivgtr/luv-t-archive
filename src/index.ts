import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import { Status } from 'twitter-d'

dotenv.config()

const { TWITTER_ID: twitterId, TWITTER_TOKEN: twitterToken } = process.env
const url = 'https://api.twitter.com/1.1/favorites/list.json'

const saveToData = async (data: media[]): Promise<void> => {
  console.log(data)
}

const getTweetLike = async (): Promise<media[]> => {
  const headers = {
    Authorization: `Bearer ${twitterToken}`
  }

  const options = {
    method: 'GET',
    headers
  }

  const count = 5

  const favoriteData: media[] = await new Promise((resolve, reject) => {
    const param = `?screen_name=${twitterId}&count=${count}&trim_user=true&tweet_mode=extended`

    fetch(url + param, options)
      .then((response) => response.json())
      .then((result: Status[]) => {
        const medias: media[] = []
        result.map((tweet) => {
          if (tweet?.extended_entities?.media) {
            tweet.extended_entities.media.map((media) => {
              const name = media.media_url.split('/')
              let video_url: VideoVariant | null = null
              if (media.type === 'video' && media?.video_info?.variants) {
                const getNumSafe = ({
                  bitrate = -Infinity
                }: {
                  bitrate?: number | undefined | null
                }) => bitrate as number
                video_url = media.video_info.variants.reduce((acc, r) =>
                  getNumSafe(r) > getNumSafe(acc) ? r : acc
                )
              }
              medias.push({
                tweet_url: media.url,
                file_name: name[name.length - 1],
                media_type: media.type,
                media_url: video_url ? video_url.url : media.media_url
              })
              return media
            })
          }
          return tweet
        })

        return resolve(medias)
      })
      .catch((err) => {
        return reject(err)
      })
  })

  return favoriteData
}

const main = async () => {
  const mediaData = await getTweetLike()
  saveToData(mediaData)
}

;(async () => {
  await main()
})()
