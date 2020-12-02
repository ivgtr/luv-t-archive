import { getLuvTweet } from './utils/getTweetData'
import { saveData } from './utils/saveTweetData'

const main = async () => {
  try {
    const tweetData = await getLuvTweet()
    await saveData(tweetData)
    console.log('全ての処理が完了')
  } catch (error) {
    console.log(`何か問題が起きた様です\n${error}`)
  }
}

;(async () => {
  await main()
})()
