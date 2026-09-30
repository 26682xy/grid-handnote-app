import { Filesystem, Directory } from '@capacitor/filesystem'

/**
 * 网页端：文件对象转base64
 * @param {File} file
 * @returns {Promise<string>} base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 判断是否为Capacitor移动端环境
 */
export function isCapacitorMobile() {
  return !!(window?.Capacitor?.isNativePlatform)
}

/**
 * 移动端：把blob写入App私有目录，返回文件url
 * @param {Blob} blob
 * @param {string} fileName
 * @returns {Promise<string>} file:// 路径
 */
export async function saveImageToCapacitorFs(blob, fileName) {
  const base64 = await blobToBase64(blob)
  const writeRes = await Filesystem.writeFile({
    path: `handnote_img/${fileName}`,
    data: base64,
    directory: Directory.Data,
    recursive: true
  })
  return writeRes.uri
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 统一处理图片上传，兼容网页 / Capacitor安卓
 * @param {File} file
 * @returns {Promise<string>} 图片src，网页base64 / 移动端file uri
 */
export async function handleUploadImageFile(file) {
  if (isCapacitorMobile()) {
    const blob = file
    const ext = file.name.split('.').pop()
    const uid = crypto.randomUUID()
    const fileName = `${uid}.${ext}`
    return await saveImageToCapacitorFs(blob, fileName)
  } else {
    return await fileToBase64(file)
}
}
