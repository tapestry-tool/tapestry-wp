import { Configuration, enums, Client, services } from "kaltura-client"

const {
  KALTURA_ADMIN_SECRET: secret,
  KALTURA_PARTNER_ID: partnerId,
  KS_TYPE: ksType,
  KALTURA_SERVICE_URL: serviceUrl,
} = process.env
let config = new Configuration()
config.serviceUrl = serviceUrl

const defaultKSType = enums.SessionType[ksType || "USER"]

class KalturaClientFactory {
  static getKS(userId, options = null) {
    const { type = defaultKSType, privileges = "appId:appName-appDomain" } =
      options || {}
    var client = new Client(config)
    var expiry = null

    return new Promise((resolve, reject) => {
      services.session
        .start(secret, userId, type, partnerId, expiry, privileges)
        .completion((success, response) => {
          if (!success) {
            console.log("Session initiation Failed.")
            reject(response.message)
            return
          }
          resolve(response)
        })
        .execute(client)
    })
  }

  static getClient(ks) {
    var client = new Client(config)
    client.setKs(ks)
    return Promise.resolve(client)
  }
}

export default KalturaClientFactory
