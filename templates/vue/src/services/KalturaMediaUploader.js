import KalturaClientFactory from "@/services/KalturaClientFactory"
import { enums, services, objects } from "kaltura-client"

class KalturaMediaUploader {
  constructor() {
    return (async () => {
      this.ks = await KalturaClientFactory.getKS("", {
        type: enums.SessionType.ADMIN,
      })
      this.client = await KalturaClientFactory.getClient(this.ks)
      return this
    })()
  }

  upload(fileData, done) {
    this.fileData = fileData
    this.done = done

    let uploadToken = new objects.UploadToken()

    services.uploadToken
      .add(uploadToken)
      .execute(this.client)
      .then(result => {
        this.uploadToken = result.id
        this.doUpload(result.id)
      })
  }

  doUpload(uploadTokenId) {
    let resume = false
    let finalChunk = true
    let resumeAt = -1

    services.uploadToken
      .upload(uploadTokenId, this.fileData, resume, finalChunk, resumeAt)
      .execute(this.client)
      .then(() => {
        this.createMediaEntry()
      })
  }

  createMediaEntry() {
    let entry = new objects.MediaEntry()

    services.media
      .add(entry)
      .execute(this.client)
      .then(result => {
        this.addContent(result.id)
      })
  }

  addContent(entryId) {
    let resource = new objects.UploadedFileTokenResource()
    resource.token = this.uploadTokenId
    services.media
      .addContent(entryId, resource)
      .execute(this.client)
      .then(result => {
        this.done(result)
      })
  }
}

export default KalturaMediaUploader
