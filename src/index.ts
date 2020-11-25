import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config()

const { TWITTER_ID: twitterId, TWITTER_TOKEN: twitterToken } = process.env

const requestTwitterData = async (): Promise<any> => {
  const headers = {
    Authorization: `Bearer ${twitterToken}`
  }

  const options = {
    method: 'GET',
    headers
  }

  const count = 5

  let url = 'https://api.twitter.com/1.1/favorites/list.json'

  const timelineData = await new Promise((resolve, reject) => {
    url += `?screen_name=${twitterId}&count=${count}&trim_user=true&tweet_mode=extended`

    fetch(url, options)
      .then((response) => response.json())
      .then((result) => {
        const medias = []
        result.map((tweet) => {
          if (tweet.extended_entities) {
            tweet.extended_entities.media.map((media) => {
              const name = media.media_url.split('/')
              medias.push({
                url: media.url,
                name: name[name.length - 1].split('.')[0],
                type: media.type,
                media_url: media.media_url
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

  console.log(timelineData)

  return timelineData
}

const getTweetData = async () => {
  // const countData = await requestTwitterData()
}

const main = async () => {
  // const resultText = await getTweetData()
}

;(async () => {
  console.log("test")
})()
