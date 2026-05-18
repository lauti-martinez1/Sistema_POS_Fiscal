import { openDB } from "idb"

export const dbPromise = openDB("pos-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("sales")) {
      db.createObjectStore("sales", {
        keyPath: "id",
        autoIncrement: true,
      })
    }
  },
})

export async function saveOfflineSale(sale) {
  const db = await dbPromise
  await db.add("sales", sale)
}

export async function getOfflineSales() {
  const db = await dbPromise
  return await db.getAll("sales")
}

export async function deleteOfflineSale(id) {
  const db = await dbPromise
  await db.delete("sales", id)
}