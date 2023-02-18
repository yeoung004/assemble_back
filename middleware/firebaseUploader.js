const { initializeApp } = require("firebase/app")
const { ref, getStorage, uploadBytes } = require("firebase/storage")
const { FIREBASE_CONFIG } = require("../config/prod")

const firebaseApp = initializeApp(FIREBASE_CONFIG)
const storage = getStorage(firebaseApp)

exports.uploadImageToFireStorage = async (fileName, file) => {
  try {
    const snapshot = await uploadBytes(ref(storage, 'event/' + fileName), file)
    console.log('Uploaded' + fileName)
    return snapshot.metadata.downloadTokens
  } catch (error) {
    console.log('uploadImageToFireStorage', error)
  }
}