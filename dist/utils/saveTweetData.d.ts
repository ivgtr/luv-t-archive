/**
 * Sheets APIから名前のデータを取得し、使い易いように浅くして返す
 * @returns {Promise<string[]>} sheetsに登録されている名前のデータ
 */
export declare const getSheetsNamesData: () => Promise<string[]>;
/**
 * Twitterから取得したデータをspreadsheetsのデータと比較し、重複してないデータを返す
 * @param {media[]} resources 取得し、整形したデータ
 *
 * @returns {Promise<media[]>} 取得したデータから重複を省いたデータ
 */
export declare const filterResources: (resources: media[]) => Promise<media[]>;
/**
 * ファイルを取得してdriveに保存し、正常に終了したデータのリストを返す
 * @param {media[]} filterData 取得したデータから重複を省いたデータ
 *
 * @returns {Promise<string[][]>} driveにuploadが成功し、sheetに登録しやすい様に整形したデータ
 */
export declare const saveDrive: (filterData: media[]) => Promise<string[][]>;
/**
 * 整形したデータをspreadsheetsに登録
 * @param shapData
 */
export declare const updateSheet: (shapData: string[][]) => Promise<void>;
/**
 * 一連の処理のエラーをハンドリングする
 * @param resources 取得し、整形されたtweetデータ
 */
export declare const saveData: (resources: media[]) => Promise<void>;
//# sourceMappingURL=saveTweetData.d.ts.map