import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { getOutputs } from './utils/cloudFormation'

const envPath = `${__dirname}/../../../.env`
const isOfflineBuild = process.env.SKIP_AWS_FETCH === '1' || process.env.SKIP_AWS_FETCH === 'true'

if (fs.existsSync(envPath)) {
  dotenv.config({path: envPath})
} else if (!isOfflineBuild) {
  throw new Error(`.env not found at ${envPath}`)
}

const { STACK_NAME: stackName } = process.env
const configDir = path.normalize(`${__dirname}/../config`)

const fetchSettings = async () => {
  if (isOfflineBuild) {
    const apiUrl = process.env.LAMBSTATUS_API_URL || process.env.ADMINPAGE_API_URL || process.env.STATUSPAGE_API_URL || 'https://example.com'
    return {
      AdminPageCloudFrontURL: apiUrl,
      StatusPageCloudFrontURL: apiUrl,
      UserPoolID: process.env.LAMBSTATUS_USER_POOL_ID || process.env.USER_POOL_ID || 'offline-user-pool',
      UserPoolClientID: process.env.LAMBSTATUS_CLIENT_ID || process.env.USER_POOL_CLIENT_ID || 'offline-client-id'
    }
  }
  const keys = ['AdminPageCloudFrontURL', 'StatusPageCloudFrontURL', 'UserPoolID', 'UserPoolClientID']
  try {
    return await getOutputs(stackName, keys)
  } catch (err) {
    throw err
  }
}

const generateAdminSettings = async () => {
  const settings = await fetchSettings()
  const body = `__LAMBSTATUS_API_URL__ = '${settings.AdminPageCloudFrontURL}';
__LAMBSTATUS_USER_POOL_ID__ = '${settings.UserPoolID}';
__LAMBSTATUS_CLIENT_ID__ = '${settings.UserPoolClientID}';
`
  const adminSettingsJsPath = `${configDir}/admin-settings.js`
  fs.writeFileSync(adminSettingsJsPath, body)
}

const generateStatusSettings = async () => {
  const settings = await fetchSettings()
  const body = `__LAMBSTATUS_API_URL__ = '${settings.StatusPageCloudFrontURL}';
`
  const statusSettingsJsPath = `${configDir}/status-settings.js`
  fs.writeFileSync(statusSettingsJsPath, body)
}

let promise
if (process.env.PAGE_TYPE === 'admin') {
  promise = generateAdminSettings()
} else if (process.env.PAGE_TYPE === 'status') {
  promise = generateStatusSettings()
}

promise.then(() => {
  console.log('settings.js generated')
})
