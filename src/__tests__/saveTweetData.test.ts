import * as saveTweetData from '../utils/saveLuvData'

const data1 = {
  tweet_url: 'data1',
  tweet_time: 'data1',
  file_name: 'data1',
  media_type: 'data1',
  media_url: 'data1',
  save_time: 'data1'
}

const data2 = {
  tweet_url: 'data2',
  tweet_time: 'data2',
  file_name: 'data2',
  media_type: 'data2',
  media_url: 'data2',
  save_time: 'data2'
}
const data3 = {
  tweet_url: 'data3',
  tweet_time: 'data3',
  file_name: 'data3',
  media_type: 'data3',
  media_url: 'data3',
  save_time: 'data3'
}

describe('saveToData: (resources: media[])', (): void => {
  const saveDrive = jest.spyOn(saveTweetData, 'saveDrive')
  saveDrive.mockImplementation(async () => [])

  const filterResources = jest.spyOn(saveTweetData, 'filterResources')

  test('filterResourcesの返り値が空の時、正しく処理のガードが行われているか', async () => {
    const spyLog = jest.spyOn(console, 'log')
    filterResources.mockImplementation(async () => [])
    await saveTweetData.saveLuvData([])

    expect(saveDrive).not.toHaveBeenCalled()
    expect(spyLog).toHaveBeenCalledWith('新しいデータはありません')
  })
})

describe('filterResources: (resources: media[])', (): void => {
  let resources: {
    tweet_url: string
    tweet_time: string
    file_name: string
    media_type: string
    media_url: string
    save_time: string
  }[]

  test('引数が空のとき、処理は動かずに空の配列が返ってくる', async () => {
    const sheetsNamesData = jest.spyOn(saveTweetData, 'getSheetsNamesData')
    sheetsNamesData.mockImplementation()

    resources = []
    const result = await saveTweetData.filterResources(resources)
    expect(result).toStrictEqual(resources)

    expect(sheetsNamesData).not.toHaveBeenCalled()
  })

  test('引数が存在するとき、重複データを削除したデータが返ってくる', async () => {
    const sheetsNamesData = jest.spyOn(saveTweetData, 'getSheetsNamesData')
    sheetsNamesData.mockImplementation(async () => [data2.file_name])

    resources = [data1, data2, data3]
    const correct = [data3, data1]

    const result = await saveTweetData.filterResources(resources)
    expect(result).toStrictEqual(correct)
  })
})
