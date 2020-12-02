import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import type { Status } from 'twitter-d'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'

dotenv.config()
dayjs.locale('ja')

const { TWITTER_ID: twitterId, TWITTER_TOKEN: twitterToken } = process.env
const endpoint = 'https://api.twitter.com/1.1/favorites/list.json'

// tweet取得数
const count = 200

//
/**
 * tweetを取得し、整形したものを返す
 *
 * @returns tweetを取得し、整形したデータ
 */
export const getLuvTweet = async (): Promise<media[]> => {
  const headers = {
    Authorization: `Bearer ${twitterToken}`
  }

  const options = {
    method: 'GET',
    headers
  }

  const favoriteData: media[] = await new Promise((resolve, reject) => {
    const param = `?screen_name=${twitterId}&count=${count}&trim_user=true&tweet_mode=extended`

    // tweetを取得
    fetch(endpoint + param, options)
      .then((response) => response.json())
      .then((result: Status[]) => {
        // 整形したものが入る
        const medias: media[] = []
        const save_time = dayjs().format('YYYY/MMMM/DD日(ddd) HH:mm')
        result.map((tweet) => {
          const tweet_time = dayjs(tweet.created_at).format('YYYY/MMMM/DD日(ddd) HH:mm')
          // imageもしくはvideoが存在するか判定
          if (tweet?.extended_entities?.media) {
            // 配列の形なのでそれに沿って処理
            tweet.extended_entities.media.map((media) => {
              let name = media.media_url.split('/')
              let video_url: VideoVariant | null = null
              // videoの場合の処理
              if (media.type === 'video' && media?.video_info?.variants) {
                // bitrate順に並び替えて一番良いものを返す
                const getNumSafe = ({ bitrate = -Infinity }: { bitrate?: number | null }) =>
                  bitrate as number
                video_url = media.video_info.variants.reduce((acc, r) =>
                  getNumSafe(r) > getNumSafe(acc) ? r : acc
                )
                const remParam = video_url.url.indexOf('?')
                name = remParam
                  ? video_url.url.substring(0, remParam).split('/')
                  : video_url.url.split('/')
              }
              medias.push({
                tweet_url: media.url,
                tweet_time,
                file_name: name[name.length - 1],
                media_type: media.type,
                media_url: video_url ? video_url.url : media.media_url,
                save_time
              })
              return media
            })
          }
          return tweet
        })
        // 一通り処理したものをPromise元に返す
        return resolve(medias)
      })
      .catch((err) => {
        return reject(err)
      })
  })

  // 呼び出し元に整形したものを返す
  return favoriteData
}
