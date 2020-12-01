import * as saveToData from '../src/utils/saveToData'

describe('saveToData: (resources: media[])', (): void => {
  const saveDriveData = jest.spyOn(saveToData, 'saveDriveData')
  saveDriveData.mockImplementation(async () => [])

  const filterResources = jest.spyOn(saveToData, 'filterResources')

  const spyLog = jest.spyOn(console, 'log')

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('filterResourcesがエラーした時、正しく処理のガードが行われているか', () => {
    const error = 'Error'
    filterResources.mockImplementation(() => {
      throw error
    })
    expect(saveToData.saveToData([])).rejects.toThrowError(error)

    expect(saveDriveData).not.toHaveBeenCalled()
  })

  test('filterResourcesの返り値が空の時、正しく処理のガードが行われているか', async () => {
    filterResources.mockImplementation(async () => {
      return []
    })
    await saveToData.saveToData([])

    expect(saveDriveData).not.toHaveBeenCalled()
    expect(spyLog).toHaveBeenCalledWith('新しいデータはありません')
  })
})

describe('filterResources: (resources: media[])', (): void => {
  const saveDriveData = jest.spyOn(saveToData, 'saveDriveData')
  saveDriveData.mockImplementation(async () => [])

  const filterResources = jest.spyOn(saveToData, 'filterResources')

  const spyLog = jest.spyOn(console, 'log')

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('filterResourcesがエラーした時、正しく処理のガードが行われているか', () => {
    const error = 'Error'
    filterResources.mockImplementation(() => {
      throw error
    })
    expect(saveToData.saveToData([])).rejects.toThrowError(error)

    expect(saveDriveData).not.toHaveBeenCalled()
  })

  test('filterResourcesの返り値が空の時、正しく処理のガードが行われているか', async () => {
    filterResources.mockImplementation(async () => {
      return []
    })
    await saveToData.saveToData([])

    expect(saveDriveData).not.toHaveBeenCalled()
    expect(spyLog).toHaveBeenCalledWith('新しいデータはありません')
  })
})
