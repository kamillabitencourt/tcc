import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { storage } from "../firebase/firebaseConfig";

export const uploadImage = async (uri) => {

  const response = await fetch(uri);

  const blob = await response.blob();

  const filename =
    `images/${Date.now()}.jpg`;

  const storageRef =
    ref(storage, filename);

  await uploadBytes(
    storageRef,
    blob
  );

  return await getDownloadURL(
    storageRef
  );
};