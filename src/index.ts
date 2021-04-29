import { getLuvTweet } from './utils/getTweetData'
import { saveLuvData } from './utils/saveLuvData'

export default (async () => {
  try {
    const tweetData = await getLuvTweet()
    await saveLuvData(tweetData)
    console.log('全ての処理が完了')
  } catch (error) {
    console.log(`何か問題が起きた様です\n${error}`)
  }
})()
